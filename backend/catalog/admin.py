from django.contrib import admin

from .models import BirdSpecies, Brand, Category, Product, ProductImage, ProductSpec, Review, Variant


class VariantInline(admin.TabularInline):
    model = Variant
    extra = 1


class SpecInline(admin.TabularInline):
    model = ProductSpec
    extra = 1


class ImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "sku", "category", "brand", "lowest", "total_stock", "is_active", "is_bestseller", "is_new"]
    list_filter = ["is_active", "is_bestseller", "is_new", "category", "brand", "birds"]
    list_editable = ["is_active", "is_bestseller", "is_new"]
    search_fields = ["name", "sku", "slug"]
    prepopulated_fields = {"slug": ["name"]}
    filter_horizontal = ["birds"]
    readonly_fields = ["rating", "review_count"]
    inlines = [VariantInline, ImageInline, SpecInline]

    @admin.display(description="کمترین قیمت")
    def lowest(self, product):
        return min((v.price for v in product.variants.all()), default=0)

    @admin.display(description="موجودی")
    def total_stock(self, product):
        return sum(v.stock for v in product.variants.all())

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("category", "brand").prefetch_related("variants")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "group", "sort_order"]
    list_editable = ["sort_order"]
    prepopulated_fields = {"slug": ["name"]}


@admin.register(BirdSpecies)
class BirdSpeciesAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "sort_order"]
    list_editable = ["sort_order"]


admin.site.register(Brand)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["product", "author", "rating", "is_approved", "created_at"]
    list_filter = ["is_approved", "rating"]
    list_editable = ["is_approved"]
    search_fields = ["text", "author", "product__name"]
    raw_id_fields = ["product", "user"]
