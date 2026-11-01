from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class ShippingMethod(models.Model):
    code = models.SlugField("شناسه", primary_key=True, max_length=20)
    name = models.CharField("نام", max_length=60)
    eta = models.CharField("زمان تحویل", max_length=60)
    price = models.PositiveIntegerField("هزینه (تومان)")
    is_active = models.BooleanField("فعال", default=True)
    allows_cod = models.BooleanField("امکان پرداخت در محل", default=False)
    sort_order = models.PositiveSmallIntegerField("ترتیب", default=0)

    class Meta:
        ordering = ["sort_order"]
        verbose_name = "روش ارسال"
        verbose_name_plural = "روش‌های ارسال"

    def __str__(self):
        return self.name


class Coupon(models.Model):
    code = models.CharField("کد", max_length=30, unique=True, help_text="با حروف بزرگ انگلیسی")
    label = models.CharField("توضیح نمایشی", max_length=120)
    percent = models.PositiveSmallIntegerField("درصد", validators=[MinValueValidator(1), MaxValueValidator(100)])
    cap = models.PositiveIntegerField("سقف تخفیف (تومان)", null=True, blank=True)
    min_subtotal = models.PositiveIntegerField("حداقل خرید (تومان)", default=0)
    max_uses = models.PositiveIntegerField("سقف استفاده", null=True, blank=True)
    used_count = models.PositiveIntegerField("تعداد استفاده", default=0, editable=False)
    starts_at = models.DateTimeField("شروع", null=True, blank=True)
    ends_at = models.DateTimeField("پایان", null=True, blank=True)
    is_active = models.BooleanField("فعال", default=True)

    class Meta:
        verbose_name = "کد تخفیف"
        verbose_name_plural = "کدهای تخفیف"

    def __str__(self):
        return self.code

    def is_usable(self, subtotal: int) -> bool:
        now = timezone.now()
        return (
            self.is_active
            and (self.starts_at is None or self.starts_at <= now)
            and (self.ends_at is None or self.ends_at >= now)
            and (self.max_uses is None or self.used_count < self.max_uses)
            and subtotal >= self.min_subtotal
        )

    def discount_for(self, subtotal: int) -> int:
        amount = round(subtotal * self.percent / 100)
        return min(amount, self.cap) if self.cap is not None else amount


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "در انتظار پرداخت"
        CONFIRMED = "confirmed", "ثبت‌شده"
        PACKING = "packing", "آماده‌سازی"
        SHIPPED = "shipped", "ارسال‌شده"
        DELIVERED = "delivered", "تحویل‌شده"
        CANCELLED = "cancelled", "لغوشده"

    class PaymentMethod(models.TextChoices):
        ONLINE = "online", "پرداخت آنلاین"
        COD = "cod", "پرداخت در محل"

    code = models.CharField("شمارهٔ سفارش", max_length=16, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders", verbose_name="کاربر")
    status = models.CharField("وضعیت", max_length=20, choices=Status.choices, default=Status.PENDING_PAYMENT, db_index=True)
    payment_method = models.CharField("روش پرداخت", max_length=10, choices=PaymentMethod.choices)
    paid_at = models.DateTimeField("زمان پرداخت", null=True, blank=True)

    subtotal = models.PositiveIntegerField("جمع کالاها")
    discount = models.PositiveIntegerField("تخفیف", default=0)
    shipping_cost = models.PositiveIntegerField("هزینهٔ ارسال", default=0)
    total = models.PositiveIntegerField("مبلغ نهایی")
    coupon = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="کد تخفیف")

    receiver = models.CharField("گیرنده", max_length=120)
    mobile = models.CharField("موبایل", max_length=11, db_index=True)
    province = models.CharField("استان", max_length=60)
    city = models.CharField("شهر", max_length=60)
    line = models.TextField("نشانی")
    postal_code = models.CharField("کد پستی", max_length=10)
    shipping_method = models.CharField("روش ارسال", max_length=60)
    tracking_code = models.CharField("کد رهگیری مرسوله", max_length=60, blank=True)

    created_at = models.DateTimeField("تاریخ", auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "سفارش"
        verbose_name_plural = "سفارش‌ها"

    def __str__(self):
        return self.code


class OrderLine(models.Model):
    """نام و قیمت کپی می‌شوند تا تغییر بعدی محصول، سابقهٔ سفارش را عوض نکند."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="lines")
    variant = models.ForeignKey("catalog.Variant", null=True, on_delete=models.SET_NULL, related_name="+")
    product_slug = models.CharField(max_length=120)
    name = models.CharField("محصول", max_length=160)
    variant_label = models.CharField("گزینه", max_length=120)
    art_kind = models.CharField(max_length=12)
    art_tone = models.CharField(max_length=12)
    image = models.CharField(max_length=300, blank=True)
    unit_price = models.PositiveIntegerField("قیمت واحد")
    compare_at = models.PositiveIntegerField(null=True, blank=True)
    qty = models.PositiveIntegerField("تعداد")

    class Meta:
        ordering = ["id"]
        verbose_name = "ردیف سفارش"
        verbose_name_plural = "ردیف‌های سفارش"


class Payment(models.Model):
    class Status(models.TextChoices):
        STARTED = "started", "شروع‌شده"
        PAID = "paid", "پرداخت‌شده"
        FAILED = "failed", "ناموفق"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    gateway = models.CharField("درگاه", max_length=20)
    amount = models.PositiveIntegerField("مبلغ (تومان)")
    authority = models.CharField("شناسهٔ درگاه", max_length=64, unique=True)
    ref_id = models.CharField("کد مرجع", max_length=64, blank=True)
    status = models.CharField("وضعیت", max_length=10, choices=Status.choices, default=Status.STARTED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "پرداخت"
        verbose_name_plural = "پرداخت‌ها"
