import json
import logging
import secrets
import urllib.error
import urllib.request
from dataclasses import dataclass

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)


class GatewayError(Exception):
    pass


@dataclass
class StartResult:
    authority: str
    redirect_url: str


class FakeGateway:
    """درگاه آزمایشی برای توسعه؛ با DEBUG=false بارگذاری نمی‌شود."""

    name = "fake"

    def start(self, order, amount, callback_url) -> StartResult:
        authority = f"FAKE{secrets.token_hex(12)}"
        return StartResult(authority, f"{settings.FRONTEND_URL}/api/v1/payments/fake/{authority}")

    def verify(self, authority, amount, callback_status) -> str | None:
        return f"FAKE-REF-{authority[-8:]}" if callback_status == "OK" else None


class ZarinpalGateway:
    """API نسخهٔ ۴ زرین‌پال. مبلغ‌ها به ریال ارسال می‌شوند (واحد پیش‌فرض این API)."""

    name = "zarinpal"

    def __init__(self):
        if not settings.ZARINPAL_MERCHANT_ID:
            raise ImproperlyConfigured("ZARINPAL_MERCHANT_ID is required for the zarinpal gateway.")
        self.host = "sandbox.zarinpal.com" if settings.ZARINPAL_SANDBOX else "payment.zarinpal.com"

    def _post(self, path, payload):
        request = urllib.request.Request(
            f"https://{self.host}/pg/v4/payment/{path}.json",
            data=json.dumps({"merchant_id": settings.ZARINPAL_MERCHANT_ID, **payload}).encode(),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            # زرین‌پال خطاهای تجاری را هم با کد ۴xx و بدنهٔ JSON برمی‌گرداند
            try:
                return json.load(error)
            except ValueError as parse_error:
                raise GatewayError(f"HTTP {error.code}") from parse_error
        except (OSError, ValueError) as error:
            raise GatewayError(str(error)) from error

    def start(self, order, amount, callback_url) -> StartResult:
        body = self._post(
            "request",
            {
                "amount": amount * 10,
                "callback_url": callback_url,
                "description": f"سفارش {order.code}",
                "metadata": {"mobile": order.mobile},
            },
        )
        data = body.get("data") or {}
        if data.get("code") != 100 or not data.get("authority"):
            logger.error("Zarinpal request failed for %s: %s", order.code, body.get("errors"))
            raise GatewayError("payment request rejected")
        return StartResult(data["authority"], f"https://{self.host}/pg/StartPay/{data['authority']}")

    def verify(self, authority, amount, callback_status) -> str | None:
        if callback_status != "OK":
            return None
        body = self._post("verify", {"amount": amount * 10, "authority": authority})
        data = body.get("data") or {}
        # کد ۱۰۱ یعنی این پرداخت قبلاً تأیید شده است
        if data.get("code") in (100, 101):
            return str(data.get("ref_id", ""))
        logger.warning("Zarinpal verify failed for %s: %s", authority, body.get("errors"))
        return None


def get_gateway():
    if settings.PAYMENT_GATEWAY == "fake":
        if not settings.DEBUG:
            raise ImproperlyConfigured("The fake payment gateway cannot run with DEBUG=false.")
        return FakeGateway()
    if settings.PAYMENT_GATEWAY == "zarinpal":
        return ZarinpalGateway()
    raise ImproperlyConfigured(f"Unknown payment gateway '{settings.PAYMENT_GATEWAY}'.")
