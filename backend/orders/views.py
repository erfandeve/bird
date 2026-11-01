from urllib.parse import urlencode

from django.conf import settings
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.utils.html import format_html
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Order, Payment, ShippingMethod
from .serializers import OrderInput, OrderSerializer, QuoteInput, ShippingSerializer, TrackInput
from .services import OrderError, build_quote, place_order, settle_payment, start_payment

SESSION_KEY = "guest_orders"


def _orders():
    return Order.objects.prefetch_related("lines")


def _error(error: OrderError):
    return Response({"detail": error.message, "code": error.code, **error.extra}, status=status.HTTP_409_CONFLICT)


class ShippingListView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        methods = ShippingMethod.objects.filter(is_active=True)
        return Response({"methods": ShippingSerializer(methods, many=True).data, "freeFrom": settings.FREE_SHIPPING_FROM})


class QuoteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = QuoteInput(data=request.data)
        data.is_valid(raise_exception=True)
        values = data.validated_data
        return Response(build_quote(values["lines"], values.get("coupon", ""), values.get("shipping", "")))


class OrderListView(APIView):
    def get_permissions(self):
        # سفارش مهمان مجاز است؛ فهرست سفارش‌ها نیاز به ورود دارد
        return [AllowAny()] if self.request.method == "POST" else super().get_permissions()

    def get(self, request):
        return Response(OrderSerializer(_orders().filter(user=request.user)[:50], many=True).data)

    def post(self, request):
        data = OrderInput(data=request.data)
        data.is_valid(raise_exception=True)
        values = data.validated_data
        address = dict(values["address"])
        address["postal_code"] = address.pop("postalCode")
        user = request.user if request.user.is_authenticated else None

        try:
            order = place_order(
                user=user,
                lines=values["lines"],
                address=address,
                shipping_code=values["shipping"],
                payment_method=values["payment"],
                coupon_code=values.get("coupon", ""),
                expected_total=values["expectedTotal"],
            )
            payment_url = None
            if order.payment_method == Order.PaymentMethod.ONLINE:
                payment_url = start_payment(order, f"{settings.FRONTEND_URL}/api/v1/payments/callback")
        except OrderError as error:
            return _error(error)

        if user is None:
            request.session[SESSION_KEY] = [*request.session.get(SESSION_KEY, [])[-19:], order.code]
        order = _orders().get(pk=order.pk)
        return Response({"order": OrderSerializer(order).data, "paymentUrl": payment_url}, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """فقط صاحب سفارش، یا مرورگری که سفارش مهمان را همین حالا ثبت کرده."""

    permission_classes = [AllowAny]

    def get(self, request, code):
        order = _orders().filter(code=code).first()
        if order is None:
            raise Http404
        owns = request.user.is_authenticated and order.user_id == request.user.pk
        if not owns and not (order.user_id is None and code in request.session.get(SESSION_KEY, [])):
            raise Http404
        return Response(OrderSerializer(order).data)


class TrackView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "track"

    def post(self, request):
        data = TrackInput(data=request.data)
        data.is_valid(raise_exception=True)
        code = data.validated_data["code"].strip().upper()
        order = _orders().filter(code=code, mobile=data.validated_data["mobile"]).first()
        if order is None:
            return Response({"detail": "سفارشی با این مشخصات پیدا نشد."}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)


def payment_callback(request):
    """مقصد بازگشت از درگاه؛ نتیجه را بررسی و کاربر را به صفحهٔ مناسب فروشگاه می‌فرستد."""
    authority = request.GET.get("Authority", "")
    order = settle_payment(authority, request.GET.get("Status", ""))
    if order is None:
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/checkout/failed")
    paid = order.paid_at is not None
    target = "success" if paid else "failed"
    return HttpResponseRedirect(f"{settings.FRONTEND_URL}/checkout/{target}?{urlencode({'order': order.code})}")


def fake_gateway_page(request, authority):
    if settings.PAYMENT_GATEWAY != "fake" or not settings.DEBUG:
        raise Http404
    payment = Payment.objects.filter(authority=authority).first()
    if payment is None:
        raise Http404
    base = f"{settings.FRONTEND_URL}/api/v1/payments/callback"
    return HttpResponse(
        format_html(
            '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>درگاه آزمایشی</title>'
            '<body style="font-family:system-ui;max-width:420px;margin:15vh auto;text-align:center">'
            "<h1>درگاه آزمایشی</h1><p>مبلغ: {} تومان. پولی جابه‌جا نمی‌شود.</p>"
            '<p><a id="pay" href="{}">پرداخت موفق</a> | <a id="cancel" href="{}">انصراف</a></p></body></html>',
            payment.amount,
            f"{base}?{urlencode({'Authority': authority, 'Status': 'OK'})}",
            f"{base}?{urlencode({'Authority': authority, 'Status': 'NOK'})}",
        )
    )
