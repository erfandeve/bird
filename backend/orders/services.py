import secrets
from dataclasses import dataclass

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import IntegrityError, transaction
from django.db.models import F
from django.utils import timezone

from catalog.models import Variant

from .gateways import GatewayError, get_gateway
from .models import Coupon, Order, OrderLine, Payment, ShippingMethod


class OrderError(Exception):
    """خطایی که متنش مستقیم به کاربر نشان داده می‌شود."""

    def __init__(self, message, code="invalid", extra=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.extra = extra or {}


@dataclass
class Totals:
    subtotal: int
    saved: int
    discount: int
    shipping: int
    total: int
    free_shipping: bool


def merge_lines(lines):
    merged = {}
    for line in lines:
        merged[line["variant"]] = merged.get(line["variant"], 0) + line["qty"]
    return merged


def compute_totals(pairs, coupon, shipping_price) -> Totals:
    """pairs: فهرست (Variant, qty). قیمت همیشه از دیتابیس خوانده می‌شود، نه از مرورگر."""
    subtotal = sum(v.price * qty for v, qty in pairs)
    listed = sum((v.compare_at or v.price) * qty for v, qty in pairs)
    discount = coupon.discount_for(subtotal) if coupon and coupon.is_usable(subtotal) else 0
    free = subtotal >= settings.FREE_SHIPPING_FROM
    shipping = 0 if free else shipping_price
    return Totals(subtotal, listed - subtotal, discount, shipping, subtotal - discount + shipping, free)


def find_coupon(code, *, lock=False):
    if not code:
        return None
    queryset = Coupon.objects.select_for_update() if lock else Coupon.objects
    return queryset.filter(code=code.strip().upper()).first()


def _active_variants(ids, *, lock=False):
    queryset = Variant.objects.select_related("product").filter(pk__in=ids, product__is_active=True)
    if lock:
        # ترتیب ثابت قفل‌ها جلوی بن‌بست دو سفارش همزمان را می‌گیرد
        queryset = queryset.select_for_update(of=("self",)).order_by("pk")
    return {variant.pk: variant for variant in queryset}


def build_quote(lines, coupon_code, shipping_code):
    wanted = merge_lines(lines)
    variants = _active_variants(wanted.keys())
    pairs, problems = [], []
    for variant_id, qty in wanted.items():
        variant = variants.get(variant_id)
        if variant is None:
            problems.append({"variant": str(variant_id), "reason": "unavailable", "stock": 0})
            continue
        if variant.stock < qty:
            problems.append({"variant": str(variant_id), "reason": "stock", "stock": variant.stock})
        pairs.append((variant, qty))

    shipping = ShippingMethod.objects.filter(pk=shipping_code, is_active=True).first() if shipping_code else None
    coupon = find_coupon(coupon_code)
    subtotal = sum(v.price * qty for v, qty in pairs)
    coupon_ok = bool(coupon and coupon.is_usable(subtotal))
    totals = compute_totals(pairs, coupon if coupon_ok else None, shipping.price if shipping else 0)

    return {
        "lines": [
            {"variant": str(v.pk), "price": v.price, "compareAt": v.compare_at, "stock": v.stock, "qty": qty}
            for v, qty in pairs
        ],
        "problems": problems,
        "subtotal": totals.subtotal,
        "saved": totals.saved,
        "discount": totals.discount,
        "shipping": totals.shipping,
        "freeShipping": totals.free_shipping,
        "total": totals.total,
        "coupon": {"code": coupon.code, "label": coupon.label} if coupon_ok else None,
        "couponError": "این کد معتبر نیست." if coupon_code and not coupon_ok else None,
    }


def _new_code():
    return f"BRD{secrets.randbelow(10**10):010d}"


def _first_image(product):
    first = product.images.first()
    return first.image.url if first else ""


@transaction.atomic
def _create_order(*, user, lines, address, shipping_code, payment_method, coupon_code, expected_total):
    shipping = ShippingMethod.objects.filter(pk=shipping_code, is_active=True).first()
    if shipping is None:
        raise OrderError("روش ارسال معتبر نیست.")
    if payment_method == Order.PaymentMethod.COD and not shipping.allows_cod:
        raise OrderError("پرداخت در محل برای این روش ارسال ممکن نیست.")

    wanted = merge_lines(lines)
    variants = _active_variants(wanted.keys(), lock=True)

    problems = []
    for variant_id, qty in wanted.items():
        variant = variants.get(variant_id)
        if variant is None or variant.stock < qty:
            problems.append({"variant": str(variant_id), "stock": variant.stock if variant else 0})
    if problems:
        raise OrderError("موجودی بعضی کالاها کافی نیست.", "stock", {"problems": problems})

    pairs = [(variants[variant_id], qty) for variant_id, qty in wanted.items()]

    coupon = find_coupon(coupon_code, lock=True)
    if coupon_code:
        subtotal = sum(v.price * qty for v, qty in pairs)
        if coupon is None or not coupon.is_usable(subtotal):
            raise OrderError("این کد تخفیف معتبر نیست.", "coupon")

    totals = compute_totals(pairs, coupon, shipping.price)
    if expected_total != totals.total:
        # کاربر نباید مبلغی غیر از آنچه دیده پرداخت کند
        raise OrderError("قیمت سبد تغییر کرده است. مبلغ جدید را بررسی کنید.", "price_changed", {"total": totals.total})

    is_cod = payment_method == Order.PaymentMethod.COD
    order = Order.objects.create(
        code=_new_code(),
        user=user,
        status=Order.Status.CONFIRMED if is_cod else Order.Status.PENDING_PAYMENT,
        payment_method=payment_method,
        subtotal=totals.subtotal,
        discount=totals.discount,
        shipping_cost=totals.shipping,
        total=totals.total,
        coupon=coupon,
        shipping_method=shipping.name,
        **address,
    )
    OrderLine.objects.bulk_create(
        OrderLine(
            order=order,
            variant=variant,
            product_slug=variant.product.slug,
            name=variant.product.name,
            variant_label=f"{variant.product.variant_label}: {variant.label}",
            art_kind=variant.product.art_kind,
            art_tone=variant.product.art_tone,
            image=_first_image(variant.product),
            unit_price=variant.price,
            compare_at=variant.compare_at,
            qty=qty,
        )
        for variant, qty in pairs
    )
    for variant, qty in pairs:
        Variant.objects.filter(pk=variant.pk).update(stock=F("stock") - qty)
    if coupon:
        Coupon.objects.filter(pk=coupon.pk).update(used_count=F("used_count") + 1)
    return order


def place_order(**kwargs):
    for attempt in range(3):
        try:
            return _create_order(**kwargs)
        except IntegrityError:
            # تصادف نادر در شمارهٔ سفارش
            if attempt == 2:
                raise


def start_payment(order, callback_url):
    try:
        gateway = get_gateway()
        result = gateway.start(order, order.total, callback_url)
    except (GatewayError, ImproperlyConfigured) as error:
        cancel_order(order.pk)
        raise OrderError("اتصال به درگاه پرداخت انجام نشد. دوباره تلاش کنید.", "gateway") from error
    Payment.objects.create(order=order, gateway=gateway.name, amount=order.total, authority=result.authority)
    return result.redirect_url


@transaction.atomic
def cancel_order(order_id) -> bool:
    """موجودی و کد تخفیف را برمی‌گرداند؛ با قفل ردیف، تکرارش اثری ندارد."""
    order = Order.objects.select_for_update().get(pk=order_id)
    if order.status in (Order.Status.CANCELLED, Order.Status.SHIPPED, Order.Status.DELIVERED):
        return False
    for line in order.lines.exclude(variant=None).order_by("variant_id"):
        Variant.objects.filter(pk=line.variant_id).update(stock=F("stock") + line.qty)
    if order.coupon_id:
        Coupon.objects.filter(pk=order.coupon_id, used_count__gt=0).update(used_count=F("used_count") - 1)
    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status", "updated_at"])
    return True


def settle_payment(authority, callback_status):
    """بازگشت از درگاه. تکرار callback یا رفرش صفحه نباید پرداخت را دو بار ثبت کند."""
    with transaction.atomic():
        payment = Payment.objects.select_for_update().select_related("order").filter(authority=authority).first()
        if payment is None:
            return None
        if payment.status != Payment.Status.STARTED:
            return payment.order
        order = Order.objects.select_for_update().get(pk=payment.order_id)
        # سفارشی که منقضی شده تأیید نمی‌شود تا زرین‌پال مبلغ را خودکار برگرداند
        if order.status != Order.Status.PENDING_PAYMENT:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
            return order
        try:
            ref_id = get_gateway().verify(authority, payment.amount, callback_status)
        except GatewayError:
            # وضعیت مبهم است؛ STARTED می‌ماند تا با callback بعدی دوباره بررسی شود
            return order
        if ref_id is None:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])
        else:
            payment.status = Payment.Status.PAID
            payment.ref_id = ref_id
            payment.save(update_fields=["status", "ref_id", "updated_at"])
            order.status = Order.Status.CONFIRMED
            order.paid_at = timezone.now()
            order.save(update_fields=["status", "paid_at", "updated_at"])
            return order
    cancel_order(order.pk)
    order.refresh_from_db()
    return order
