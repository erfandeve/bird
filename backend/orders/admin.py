from django.contrib import admin, messages

from .models import Coupon, Order, OrderLine, Payment, ShippingMethod
from .services import cancel_order


class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 0
    can_delete = False
    fields = ["name", "variant_label", "unit_price", "qty"]
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    can_delete = False
    fields = ["gateway", "amount", "authority", "ref_id", "status"]
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["code", "receiver", "mobile", "total", "status", "payment_method", "created_at"]
    list_filter = ["status", "payment_method", "created_at"]
    search_fields = ["code", "mobile", "receiver"]
    date_hierarchy = "created_at"
    inlines = [OrderLineInline, PaymentInline]
    actions = ["cancel_selected"]
    # مبلغ‌ها و کد نباید بعد از ثبت تغییر کنند
    readonly_fields = [
        "code", "user", "payment_method", "paid_at", "subtotal", "discount", "shipping_cost", "total",
        "coupon", "shipping_method", "created_at",
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def save_model(self, request, obj, form, change):
        if "status" in form.changed_data and obj.status == Order.Status.CANCELLED:
            # لغو از مسیر سرویس می‌رود تا موجودی برگردد؛ وضعیت قبلی را به آن می‌سپاریم
            previous = Order.objects.get(pk=obj.pk).status
            obj.status = previous
            super().save_model(request, obj, form, change)
            if not cancel_order(obj.pk):
                messages.warning(request, "سفارش ارسال‌شده یا لغوشده را نمی‌توان لغو کرد.")
            obj.refresh_from_db()
            return
        super().save_model(request, obj, form, change)

    @admin.action(description="لغو سفارش و بازگرداندن موجودی")
    def cancel_selected(self, request, queryset):
        count = sum(cancel_order(pk) for pk in queryset.values_list("pk", flat=True))
        self.message_user(request, f"{count} سفارش لغو شد.")


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ["code", "percent", "cap", "used_count", "max_uses", "ends_at", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["code"]
    readonly_fields = ["used_count"]

    def save_model(self, request, obj, form, change):
        obj.code = obj.code.strip().upper()
        super().save_model(request, obj, form, change)


@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "price", "eta", "allows_cod", "is_active", "sort_order"]
    list_editable = ["price", "is_active", "sort_order"]
