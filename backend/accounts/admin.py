from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Address, User


class AddressInline(admin.TabularInline):
    model = Address
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["mobile", "name", "email", "is_staff", "is_active", "date_joined"]
    list_filter = ["is_staff", "is_active"]
    search_fields = ["mobile", "name", "email"]
    inlines = [AddressInline]
    fieldsets = [
        (None, {"fields": ["mobile", "password"]}),
        ("مشخصات", {"fields": ["name", "email"]}),
        ("دسترسی", {"fields": ["is_active", "is_staff", "is_superuser", "groups", "user_permissions"]}),
        ("تاریخ‌ها", {"fields": ["last_login", "date_joined"]}),
    ]
    add_fieldsets = [(None, {"classes": ["wide"], "fields": ["mobile", "password1", "password2"]})]
