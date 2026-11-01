import secrets
from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from catalog.models import Product
from catalog.serializers import ProductSerializer, product_queryset

from .models import Address, PasswordResetCode, WishlistItem
from .serializers import (
    AddressSerializer,
    ChangePasswordSerializer,
    ForgotSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetSerializer,
    UserSerializer,
)
from .sms import send_sms

User = get_user_model()

CODE_TTL = timedelta(minutes=5)
MAX_CODE_ATTEMPTS = 5


class ThrottledView(APIView):
    throttle_classes = [ScopedRateThrottle]


@method_decorator(ensure_csrf_cookie, name="dispatch")
class MeView(APIView):
    """کوکی CSRF هم از همین‌جا به مرورگر می‌رسد."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"user": UserSerializer(request.user).data if request.user.is_authenticated else None})

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"user": serializer.data})


class RegisterView(ThrottledView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response({"user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class LoginView(ThrottledView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, username=serializer.validated_data["mobile"], password=serializer.validated_data["password"])
        if user is None:
            return Response({"detail": "شماره موبایل یا رمز عبور درست نیست."}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response({"user": UserSerializer(user).data})


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ForgotPasswordView(ThrottledView):
    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = ForgotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data["mobile"]
        # پاسخ برای شمارهٔ موجود و ناموجود یکی است تا عضویت افراد لو نرود
        if User.objects.filter(mobile=mobile, is_active=True).exists():
            code = f"{secrets.randbelow(1_000_000):06d}"
            PasswordResetCode.objects.filter(mobile=mobile, used=False).update(used=True)
            PasswordResetCode.objects.create(mobile=mobile, code_hash=make_password(code), expires_at=timezone.now() + CODE_TTL)
            send_sms(mobile, f"کد بازیابی رمز میلو: {code}")
        return Response({"detail": "اگر این شماره حساب داشته باشد، کد بازیابی برایش پیامک می‌شود."})


class ResetPasswordView(ThrottledView):
    permission_classes = [AllowAny]
    throttle_scope = "otp"

    def post(self, request):
        serializer = ResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        invalid = Response({"detail": "کد درست نیست یا منقضی شده است."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            record = (
                PasswordResetCode.objects.select_for_update()
                .filter(mobile=data["mobile"], used=False, expires_at__gt=timezone.now())
                .first()
            )
            if record is None or record.attempts >= MAX_CODE_ATTEMPTS:
                return invalid
            if not check_password(data["code"], record.code_hash):
                record.attempts += 1
                record.save(update_fields=["attempts"])
                return invalid
            user = User.objects.filter(mobile=data["mobile"], is_active=True).first()
            if user is None:
                return invalid
            record.used = True
            record.save(update_fields=["used"])
            user.set_password(data["password"])
            user.save(update_fields=["password"])
        return Response({"detail": "رمز عبور تغییر کرد. حالا وارد شوید."})


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["password"])
        request.user.save(update_fields=["password"])
        update_session_auth_hash(request, request.user)
        return Response({"detail": "رمز عبور تغییر کرد."})


class AddressListView(APIView):
    def get(self, request):
        return Response(AddressSerializer(request.user.addresses.all(), many=True).data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AddressDetailView(APIView):
    def _get(self, request, pk):
        return get_object_or_404(Address, pk=pk, user=request.user)

    def put(self, request, pk):
        serializer = AddressSerializer(self._get(request, pk), data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        self._get(request, pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        slugs = list(request.user.wishlist.values_list("product__slug", flat=True))
        products = {p.slug: p for p in product_queryset().filter(slug__in=slugs)}
        return Response(ProductSerializer([products[s] for s in slugs if s in products], many=True).data)

    def post(self, request):
        """لیست مرورگر را بعد از ورود با حساب کاربر ادغام می‌کند."""
        slugs = request.data.get("slugs", [])
        if not isinstance(slugs, list):
            return Response({"detail": "ورودی نامعتبر است."}, status=status.HTTP_400_BAD_REQUEST)
        for product in Product.objects.filter(slug__in=[str(s) for s in slugs[:200]], is_active=True):
            WishlistItem.objects.get_or_create(user=request.user, product=product)
        return self.get(request)


class WishlistItemView(APIView):
    def put(self, request, slug):
        product = get_object_or_404(Product, slug=slug, is_active=True)
        WishlistItem.objects.get_or_create(user=request.user, product=product)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request, slug):
        request.user.wishlist.filter(product__slug=slug).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
