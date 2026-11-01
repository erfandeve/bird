import logging

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger(__name__)


def send_sms(mobile: str, text: str) -> None:
    """نقطهٔ اتصال سرویس پیامک. برای کاوه‌نگار یا هر سرویس دیگر، شاخهٔ تازه‌ای اینجا اضافه شود."""
    if settings.SMS_BACKEND == "console":
        logger.info("SMS to %s: %s", mobile, text)
        return
    raise ImproperlyConfigured(f"SMS backend '{settings.SMS_BACKEND}' is not implemented.")
