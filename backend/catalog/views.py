from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from content.models import Post

from .models import BirdSpecies, Brand, Category, Product, Review
from .serializers import (
    BirdSerializer,
    CategorySerializer,
    ProductSerializer,
    ReviewSerializer,
    annotate_prices,
    filter_products,
    product_queryset,
)

DEFAULT_PER_PAGE = 12
MAX_PER_PAGE = 60


class PublicView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []


class CategoryListView(PublicView):
    def get(self, request):
        return Response(CategorySerializer(Category.objects.all(), many=True).data)


class BirdListView(PublicView):
    def get(self, request):
        return Response(BirdSerializer(BirdSpecies.objects.all(), many=True).data)


class BrandListView(PublicView):
    def get(self, request):
        return Response(list(Brand.objects.values_list("name", flat=True)))


class ProductListView(PublicView):
    def get(self, request):
        params = request.query_params
        queryset = filter_products(annotate_prices(product_queryset()), params)

        def number(key, default):
            value = params.get(key, "")
            return int(value) if value.isdigit() and int(value) > 0 else default

        per_page = min(number("per_page", DEFAULT_PER_PAGE), MAX_PER_PAGE)
        total = queryset.count()
        pages = max(1, -(-total // per_page))
        page = min(number("page", 1), pages)
        items = queryset[(page - 1) * per_page : page * per_page]
        return Response({"items": ProductSerializer(items, many=True).data, "total": total, "page": page, "pages": pages})


class ProductDetailView(PublicView):
    def get(self, request, slug):
        return Response(ProductSerializer(get_object_or_404(product_queryset(), slug=slug)).data)


class RelatedProductsView(PublicView):
    def get(self, request, slug):
        product = get_object_or_404(Product.objects.filter(is_active=True).prefetch_related("birds"), slug=slug)
        own_birds = {bird.pk for bird in product.birds.all()}
        scored = []
        for other in product_queryset().exclude(pk=product.pk):
            shared = sum(1 for bird in other.birds.all() if bird.pk in own_birds)
            scored.append((2 * (other.category_id == product.category_id) + shared, other.pk, other))
        scored.sort(key=lambda row: (-row[0], -row[1]))
        return Response(ProductSerializer([row[2] for row in scored[:8]], many=True).data)


class ProductReviewsView(APIView):
    """خواندن عمومی است؛ نوشتن نیاز به ورود دارد و نظر پس از تأیید ادمین نمایش داده می‌شود."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "public_form"

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else super().get_permissions()

    def get_throttles(self):
        return [] if self.request.method == "GET" else super().get_throttles()

    def get(self, request, slug):
        reviews = Review.objects.filter(product__slug=slug, product__is_active=True, is_approved=True)[:30]
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, slug):
        product = get_object_or_404(Product, slug=slug, is_active=True)
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({"detail": "شما قبلاً برای این محصول نظر داده‌اید."}, status=status.HTTP_409_CONFLICT)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product, user=request.user, author=request.user.name or "کاربر میلو")
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SlugsView(PublicView):
    """فهرست آدرس‌های موجود برای ۴۰۴ واقعی در proxy و ساخت sitemap."""

    def get(self, request):
        return Response(
            {
                "product": list(Product.objects.filter(is_active=True).values_list("slug", flat=True)),
                "category": list(Category.objects.values_list("slug", flat=True)),
                "bird": list(BirdSpecies.objects.values_list("slug", flat=True)),
                "blog": list(Post.objects.filter(is_published=True).values_list("slug", flat=True)),
            }
        )
