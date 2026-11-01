import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.dateparse import parse_datetime

from catalog.models import BirdSpecies, Brand, Category, Product, ProductSpec, Review, Variant
from content.models import Post
from orders.models import Coupon, ShippingMethod

DATA = Path(__file__).resolve().parents[2] / "seed" / "demo.json"

SHIPPING = [
    ("post", "پست پیشتاز", "۲ تا ۴ روز کاری", 65_000, False),
    ("tipax", "تیپاکس", "۱ تا ۳ روز کاری", 95_000, False),
    ("courier", "پیک تهران", "همان روز یا فردا", 75_000, True),
]


class Command(BaseCommand):
    help = "دادهٔ نمونهٔ فروشگاه را وارد می‌کند. نام‌ها، قیمت‌ها و نظرها ساختگی‌اند و برای سایت واقعی نیستند."

    @transaction.atomic
    def handle(self, *args, **options):
        data = json.loads(DATA.read_text(encoding="utf-8"))

        for i, c in enumerate(data["categories"]):
            Category.objects.update_or_create(
                slug=c["slug"],
                defaults=dict(
                    name=c["name"], group=c["group"], blurb=c["blurb"], seo_intro=c["seoIntro"],
                    art_kind=c["art"]["kind"], art_tone=c["art"]["tone"], sort_order=i,
                ),
            )
        for i, b in enumerate(data["birds"]):
            BirdSpecies.objects.update_or_create(
                slug=b["slug"],
                defaults=dict(name=b["name"], blurb=b["blurb"], seo_intro=b["seoIntro"], diet=b["diet"], avoid=b["avoid"], sort_order=i),
            )

        categories = {c.slug: c for c in Category.objects.all()}
        birds = {b.slug: b for b in BirdSpecies.objects.all()}

        for p in data["products"]:
            brand, _ = Brand.objects.get_or_create(name=p["brand"])
            product, _ = Product.objects.update_or_create(
                slug=p["slug"],
                defaults=dict(
                    sku=p["sku"], name=p["name"], short=p["short"], description="\n\n".join(p["description"]),
                    category=categories[p["category"]], brand=brand, variant_label=p["variantLabel"],
                    art_kind=p["art"]["kind"], art_tone=p["art"]["tone"],
                    is_bestseller="bestseller" in p["tags"], is_new="new" in p["tags"],
                ),
            )
            product.birds.set(birds[s] for s in p["birds"])
            product.variants.all().delete()
            for i, v in enumerate(p["variants"]):
                Variant.objects.create(product=product, label=v["label"], price=v["price"], compare_at=v.get("compareAt"), stock=v["stock"], sort_order=i)
            product.specs.all().delete()
            for i, (key, value) in enumerate(s for s in p["specs"] if s[0] != "برند"):
                ProductSpec.objects.create(product=product, key=key, value=value, sort_order=i)
            product.reviews.all().delete()
            for r in p["reviews"]:
                review = Review(product=product, author=r["author"], rating=r["rating"], text=r["text"], is_approved=True)
                review.save()
            # شمارش نمونه با تعداد ردیف‌های نظر یکی نیست؛ فقط برای نمایش دمو
            Product.objects.filter(pk=product.pk).update(rating=p["rating"], review_count=p["reviewCount"])

        for post in data["posts"]:
            blocks = []
            for section in post["body"]:
                if section.get("heading"):
                    blocks.append(f"## {section['heading']}")
                blocks.extend(section["paragraphs"])
            Post.objects.update_or_create(
                slug=post["slug"],
                defaults=dict(
                    title=post["title"], excerpt=post["excerpt"], body="\n\n".join(blocks),
                    read_minutes=post["readMinutes"], published_at=parse_datetime(post["date"]),
                ),
            )

        for i, (code, name, eta, price, cod) in enumerate(SHIPPING):
            ShippingMethod.objects.update_or_create(code=code, defaults=dict(name=name, eta=eta, price=price, allows_cod=cod, sort_order=i))
        Coupon.objects.update_or_create(code="MILOO10", defaults=dict(label="۱۰٪ تخفیف تا سقف ۲۰۰ هزار تومان", percent=10, cap=200_000))

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(data['products'])} products, {len(data['posts'])} posts."))
