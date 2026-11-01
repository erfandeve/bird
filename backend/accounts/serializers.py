from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Address
from .validators import clean_mobile, clean_postal_code, latin_digits

User = get_user_model()


def _check_password(value, user=None):
    try:
        password_validation.validate_password(value, user)
    except DjangoValidationError as error:
        raise serializers.ValidationError(list(error.messages))
    return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "mobile", "email"]
        read_only_fields = ["mobile"]
        extra_kwargs = {"name": {"max_length": 120}}


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=3, max_length=120)
    mobile = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_mobile(self, value):
        value = clean_mobile(value)
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("با این شماره قبلاً ثبت‌نام شده است.")
        return value

    def validate_password(self, value):
        return _check_password(value)

    def create(self, validated):
        return User.objects.create_user(
            validated["mobile"],
            validated["password"],
            name=validated["name"].strip(),
            email=validated.get("email", ""),
        )


class LoginSerializer(serializers.Serializer):
    mobile = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_mobile(self, value):
        return clean_mobile(value)


class ForgotSerializer(serializers.Serializer):
    mobile = serializers.CharField()

    def validate_mobile(self, value):
        return clean_mobile(value)


class ResetSerializer(serializers.Serializer):
    mobile = serializers.CharField()
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_mobile(self, value):
        return clean_mobile(value)

    def validate_code(self, value):
        return latin_digits(value)

    def validate_password(self, value):
        return _check_password(value)


class ChangePasswordSerializer(serializers.Serializer):
    current = serializers.CharField(write_only=True, trim_whitespace=False)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_current(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("رمز فعلی درست نیست.")
        return value

    def validate_password(self, value):
        return _check_password(value, self.context["request"].user)


class AddressSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    postalCode = serializers.CharField(source="postal_code")
    title = serializers.CharField(required=False, allow_blank=True, max_length=60)
    receiver = serializers.CharField(min_length=3, max_length=120)
    line = serializers.CharField(min_length=10)

    class Meta:
        model = Address
        fields = ["id", "title", "receiver", "mobile", "province", "city", "line", "postalCode"]

    def validate_mobile(self, value):
        return clean_mobile(value)

    def validate_postalCode(self, value):
        return clean_postal_code(value)
