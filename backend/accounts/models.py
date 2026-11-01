from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, mobile, password=None, **extra):
        if not mobile:
            raise ValueError("شماره موبایل الزامی است.")
        extra["email"] = self.normalize_email(extra.get("email", ""))
        user = self.model(mobile=mobile, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mobile, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True)
        return self.create_user(mobile, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    mobile = models.CharField("موبایل", max_length=11, unique=True)
    name = models.CharField("نام", max_length=120, blank=True)
    email = models.EmailField("ایمیل", blank=True)
    is_staff = models.BooleanField("کارمند", default=False)
    is_active = models.BooleanField("فعال", default=True)
    date_joined = models.DateTimeField("تاریخ عضویت", default=timezone.now)

    USERNAME_FIELD = "mobile"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"

    def __str__(self):
        return self.name or self.mobile


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    title = models.CharField("عنوان", max_length=60, blank=True)
    receiver = models.CharField("گیرنده", max_length=120)
    mobile = models.CharField("موبایل", max_length=11)
    province = models.CharField("استان", max_length=60)
    city = models.CharField("شهر", max_length=60)
    line = models.TextField("نشانی")
    postal_code = models.CharField("کد پستی", max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "نشانی"
        verbose_name_plural = "نشانی‌ها"

    def __str__(self):
        return f"{self.receiver} - {self.city}"


class PasswordResetCode(models.Model):
    mobile = models.CharField(max_length=11, db_index=True)
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class WishlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    product = models.ForeignKey("catalog.Product", on_delete=models.CASCADE, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["user", "product"], name="unique_wishlist_item")]
