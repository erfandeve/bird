from django.db.models import Exists, ExpressionWrapper, F, FloatField, Max, Min, OuterRef, Q, Subquery
from rest_framework import serializers

from .models import BirdSpecies, Category, Product, Review, Variant


def split_paragraphs(text: str) -> list[str]:
    return [part.strip() for part in text.split("\n\n") if part.strip()]


def annotate_prices(queryset):
    """برای فیلتر و مرتب‌سازی؛ با Subquery تا joinهای M2M ردیف‌ها را چند برابر نکنند."""
    variants = Variant.objects.filter(product=OuterRef("pk")).order_by().values("product")
    discount = ExpressionWrapper((F("compare_at") - F("price")) * 1.0 / F("compare_at"), output_field=FloatField())
    return queryset.annotate(
        lowest_price=Subquery(variants.annotate(v=Min("price")).values("v")),
        best_discount=Subquery(
            variants.filter(compare_at__gt=F("price")).annotate(v=Max(discount)).values("v"),
            output_field=FloatField(),
        ),
        in_stock=Exists(Variant.objects.filter(product=OuterRef("pk"), stock__gt=0)),
    )


def product_queryset():
    return (
        Product.objects.filter(is_active=True)
        .select_related("brand", "category")
        .prefetch_related("variants", "specs", "birds", "images")
    )


class VariantSerializer(serializers.ModelSerializer):
    id = serializers.CharField()
    compareAt = serializers.IntegerField(source="compare_at")

    class Meta:
        model = Variant
        fields = ["id", "label", "price", "compareAt", "stock"]


class ProductSerializer(serializers.ModelSerializer):
    id = serializers.CharField()
    description = serializers.SerializerMethodField()
    category = serializers.CharField(source="category.slug")
    birds = serializers.SerializerMethodField()
    birdNames = serializers.SerializerMethodField()
    brand = serializers.CharField(source="brand.name")
    variants = VariantSerializer(many=True)
    variantLabel = serializers.CharField(source="variant_label")
    rating = serializers.FloatField()
    reviewCount = serializers.IntegerField(source="review_count")
    art = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    specs = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "slug", "sku", "name", "short", "description", "category", "birds", "birdNames", "brand",
            "variants", "variantLabel", "rating", "reviewCount", "art", "images", "specs", "tags",
        ]

    def get_description(self, product):
        return split_paragraphs(product.description)

    def get_birds(self, product):
        return [bird.slug for bird in product.birds.all()]

    def get_birdNames(self, product):
        return [bird.name for bird in product.birds.all()]

    def get_art(self, product):
        return {"kind": product.art_kind, "tone": product.art_tone}

    def get_images(self, product):
        # آدرس نسبی؛ Next.js مسیر /media را به همین سرور می‌فرستد
        return [item.image.url for item in product.images.all()]

    def get_specs(self, product):
        return [["برند", product.brand.name], *[[spec.key, spec.value] for spec in product.specs.all()]]

    def get_tags(self, product):
        return [tag for tag, on in (("bestseller", product.is_bestseller), ("new", product.is_new)) if on]


class CategorySerializer(serializers.ModelSerializer):
    seoIntro = serializers.CharField(source="seo_intro")
    art = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["slug", "name", "group", "blurb", "seoIntro", "art"]

    def get_art(self, category):
        return {"kind": category.art_kind, "tone": category.art_tone}


class BirdSerializer(serializers.ModelSerializer):
    seoIntro = serializers.CharField(source="seo_intro")

    class Meta:
        model = BirdSpecies
        fields = ["slug", "name", "blurb", "seoIntro", "diet", "avoid"]


class ReviewSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    author = serializers.CharField(read_only=True)
    date = serializers.DateTimeField(source="created_at", read_only=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    text = serializers.CharField(min_length=10, max_length=2000)

    class Meta:
        model = Review
        fields = ["id", "author", "rating", "date", "text"]


def filter_products(queryset, params):
    """پارامترها همان‌هایی هستند که فرانت‌اند در آدرس صفحه نگه می‌دارد."""

    def csv(key):
        return [v for v in params.get(key, "").split(",") if v]

    def positive_int(key):
        value = params.get(key, "")
        return int(value) if value.isdigit() else None

    if categories := csv("category"):
        queryset = queryset.filter(category__slug__in=categories)
    if birds := csv("bird"):
        queryset = queryset.filter(Exists(Product.birds.through.objects.filter(product=OuterRef("pk"), birdspecies__slug__in=birds)))
    if brands := csv("brand"):
        queryset = queryset.filter(brand__name__in=brands)
    if (low := positive_int("min")) is not None:
        queryset = queryset.filter(lowest_price__gte=low)
    if (high := positive_int("max")) is not None:
        queryset = queryset.filter(lowest_price__lte=high)
    if params.get("stock") == "1":
        queryset = queryset.filter(in_stock=True)
    if params.get("sale") == "1":
        queryset = queryset.filter(best_discount__gt=0)
    if tag := params.get("tag"):
        queryset = queryset.filter(Q(is_bestseller=True) if tag == "bestseller" else Q(is_new=True) if tag == "new" else Q(pk__in=[]))
    if search := params.get("q", "").strip()[:80]:
        from .models import normalize_text

        for word in normalize_text(search).split():
            queryset = queryset.filter(search_text__icontains=word)

    orderings = {
        "cheap": ["lowest_price", "-id"],
        "expensive": ["-lowest_price", "-id"],
        "discount": [F("best_discount").desc(nulls_last=True), "-id"],
        "newest": ["-is_new", "-id"],
    }
    default = ["-in_stock", "-review_count", "-rating", "-id"]
    return queryset.order_by(*orderings.get(params.get("sort"), default))
