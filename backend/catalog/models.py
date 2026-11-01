from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Avg, Count

ART_KINDS = [(k, k) for k in ["pouch", "jar", "box", "bottle", "cage", "perch", "swing", "toy", "feeder", "bath", "nest", "ladder"]]
ART_TONES = [(k, k) for k in ["olive", "lemon", "sage", "moss", "honey", "clay"]]


def normalize_text(text: str) -> str:
    """جست‌وجوی فارسی: ی و ک عربی و نیم‌فاصله نباید نتیجه را خراب کنند."""
    return " ".join(text.replace("ي", "ی").replace("ك", "ک").replace("‌", " ").lower().split())


class Category(models.Model):
    FOOD, GEAR = "food", "gear"
    slug = models.SlugField("شناسهٔ آدرس", unique=True)
    name = models.CharField("نام", max_length=80)
    group = models.CharField("گروه", max_length=8, choices=[(FOOD, "خوراک"), (GEAR, "لوازم")])
    blurb = models.CharField("توضیح کوتاه", max_length=160, blank=True)
    seo_intro = models.TextField("متن معرفی صفحه", blank=True)
    art_kind = models.CharField("طرح", max_length=12, choices=ART_KINDS, default="box")
    art_tone = models.CharField("رنگ طرح", max_length=12, choices=ART_TONES, default="olive")
    sort_order = models.PositiveSmallIntegerField("ترتیب", default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"

    def __str__(self):
        return self.name


class BirdSpecies(models.Model):
    slug = models.SlugField("شناسهٔ آدرس", unique=True)
    name = models.CharField("نام", max_length=80)
    blurb = models.CharField("توضیح کوتاه", max_length=160, blank=True)
    seo_intro = models.TextField("متن معرفی صفحه", blank=True)
    diet = models.CharField("غذای پیشنهادی", max_length=200, blank=True)
    avoid = models.CharField("پرهیز کنید", max_length=200, blank=True)
    sort_order = models.PositiveSmallIntegerField("ترتیب", default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "گونهٔ پرنده"
        verbose_name_plural = "گونه‌های پرنده"

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField("نام", max_length=80, unique=True)

    class Meta:
        ordering = ["id"]
        verbose_name = "برند"
        verbose_name_plural = "برندها"

    def __str__(self):
        return self.name


class Product(models.Model):
    slug = models.SlugField("شناسهٔ آدرس", max_length=120, unique=True)
    sku = models.CharField("کد کالا", max_length=40, unique=True)
    name = models.CharField("نام", max_length=160)
    short = models.CharField("توضیح کوتاه", max_length=240, blank=True)
    description = models.TextField("توضیحات", blank=True, help_text="پاراگراف‌ها را با یک خط خالی جدا کنید.")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products", verbose_name="دسته‌بندی")
    birds = models.ManyToManyField(BirdSpecies, related_name="products", verbose_name="مناسب برای")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products", verbose_name="برند")
    variant_label = models.CharField("عنوان گزینه‌ها", max_length=40, default="وزن")
    art_kind = models.CharField("طرح جایگزین عکس", max_length=12, choices=ART_KINDS, default="box")
    art_tone = models.CharField("رنگ طرح", max_length=12, choices=ART_TONES, default="olive")
    is_bestseller = models.BooleanField("پرفروش", default=False)
    is_new = models.BooleanField("تازه", default=False)
    is_active = models.BooleanField("فعال", default=True)
    # از نظرهای تأییدشده محاسبه می‌شوند تا مرتب‌سازی سریع بماند
    rating = models.DecimalField("امتیاز", max_digits=2, decimal_places=1, default=0, editable=False)
    review_count = models.PositiveIntegerField("تعداد نظر", default=0, editable=False)
    search_text = models.TextField(default="", editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"

    def __str__(self):
        return self.name

    def rebuild_search_text(self):
        birds = " ".join(self.birds.values_list("name", flat=True)) if self.pk else ""
        self.search_text = normalize_text(f"{self.name} {self.short} {self.brand.name} {self.category.name} {birds}")
        Product.objects.filter(pk=self.pk).update(search_text=self.search_text)

    def refresh_rating(self):
        stats = self.reviews.filter(is_approved=True).aggregate(avg=Avg("rating"), count=Count("id"))
        Product.objects.filter(pk=self.pk).update(rating=round(stats["avg"] or 0, 1), review_count=stats["count"])


class ProductSpec(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="specs")
    key = models.CharField("عنوان", max_length=60)
    value = models.CharField("مقدار", max_length=240)
    sort_order = models.PositiveSmallIntegerField("ترتیب", default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "مشخصه"
        verbose_name_plural = "مشخصات"


class Variant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    label = models.CharField("عنوان", max_length=60)
    price = models.PositiveIntegerField("قیمت (تومان)")
    compare_at = models.PositiveIntegerField("قیمت قبل از تخفیف", null=True, blank=True)
    stock = models.PositiveIntegerField("موجودی", default=0)
    sort_order = models.PositiveSmallIntegerField("ترتیب", default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "گزینهٔ محصول"
        verbose_name_plural = "گزینه‌های محصول"
        constraints = [models.CheckConstraint(condition=models.Q(price__gt=0), name="variant_price_positive")]

    def __str__(self):
        return f"{self.product.name} - {self.label}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField("عکس", upload_to="products/")
    sort_order = models.PositiveSmallIntegerField("ترتیب", default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name = "عکس"
        verbose_name_plural = "عکس‌ها"


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews", verbose_name="محصول")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="کاربر")
    author = models.CharField("نام نویسنده", max_length=120)
    rating = models.PositiveSmallIntegerField("امتیاز", validators=[MinValueValidator(1), MaxValueValidator(5)])
    text = models.TextField("متن")
    is_approved = models.BooleanField("تأیید شده", default=False)
    created_at = models.DateTimeField("تاریخ", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "نظر"
        verbose_name_plural = "نظرها"
        constraints = [
            models.UniqueConstraint(fields=["product", "user"], name="one_review_per_user", condition=models.Q(user__isnull=False))
        ]

    def __str__(self):
        return f"{self.author}: {self.product.name}"
