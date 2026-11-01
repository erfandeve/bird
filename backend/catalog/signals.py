import json
import logging
import threading
import urllib.request

from django.conf import settings
from django.db import transaction
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from .models import BirdSpecies, Brand, Category, Product, ProductImage, ProductSpec, Review, Variant

logger = logging.getLogger(__name__)


def _post_revalidate():
    request = urllib.request.Request(
        settings.FRONTEND_REVALIDATE_URL,
        data=json.dumps({"tag": "catalog"}).encode(),
        headers={"Content-Type": "application/json", "X-Revalidate-Secret": settings.REVALIDATE_SECRET},
        method="POST",
    )
    try:
        urllib.request.urlopen(request, timeout=3).close()
    except OSError as error:
        # اگر فرانت‌اند در دسترس نباشد، کش با گذشت زمان خودش تازه می‌شود
        logger.warning("Frontend revalidate failed: %s", error)


def notify_frontend():
    if settings.FRONTEND_REVALIDATE_URL and settings.REVALIDATE_SECRET:
        transaction.on_commit(lambda: threading.Thread(target=_post_revalidate, daemon=True).start())


@receiver([post_save, post_delete], sender=Review)
def on_review_change(sender, instance, **kwargs):
    if not kwargs.get("raw"):
        instance.product.refresh_rating()
        notify_frontend()


@receiver([post_save, post_delete])
def on_catalog_change(sender, instance, **kwargs):
    if kwargs.get("raw"):
        return
    if sender in (Product, Variant, ProductSpec, ProductImage, Category, BirdSpecies, Brand) or sender.__name__ == "Post":
        notify_frontend()
    if sender is Product and kwargs.get("signal") is post_save:
        instance.rebuild_search_text()


@receiver(m2m_changed, sender=Product.birds.through)
def on_product_birds_change(sender, instance, action, **kwargs):
    if action.startswith("post_") and isinstance(instance, Product):
        instance.rebuild_search_text()
        notify_frontend()
