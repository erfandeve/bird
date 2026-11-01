import re

from rest_framework import serializers

_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


def latin_digits(value: str) -> str:
    return value.translate(_DIGITS).strip()


def clean_mobile(value: str) -> str:
    value = latin_digits(value)
    if not re.fullmatch(r"09\d{9}", value):
        raise serializers.ValidationError("شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.")
    return value


def clean_postal_code(value: str) -> str:
    value = latin_digits(value)
    if not re.fullmatch(r"\d{10}", value):
        raise serializers.ValidationError("کد پستی باید ۱۰ رقم باشد.")
    return value
