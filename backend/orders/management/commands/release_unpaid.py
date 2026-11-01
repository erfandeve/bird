from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from orders.models import Order
from orders.services import cancel_order


class Command(BaseCommand):
    help = "سفارش‌های پرداخت‌نشدهٔ قدیمی را لغو و موجودی‌شان را آزاد می‌کند. باید با cron هر چند دقیقه اجرا شود."

    def handle(self, *args, **options):
        limit = timezone.now() - timedelta(minutes=settings.UNPAID_ORDER_MINUTES)
        expired = Order.objects.filter(status=Order.Status.PENDING_PAYMENT, created_at__lt=limit)
        count = sum(cancel_order(pk) for pk in expired.values_list("pk", flat=True))
        self.stdout.write(f"{count} order(s) released.")
