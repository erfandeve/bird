from rest_framework import serializers

from accounts.validators import clean_mobile, clean_postal_code

from .models import Order, OrderLine, ShippingMethod


class LineInput(serializers.Serializer):
    variant = serializers.IntegerField(min_value=1)
    qty = serializers.IntegerField(min_value=1, max_value=99)


class QuoteInput(serializers.Serializer):
    lines = LineInput(many=True, allow_empty=False, max_length=50)
    coupon = serializers.CharField(required=False, allow_blank=True, max_length=30)
    shipping = serializers.CharField(required=False, allow_blank=True, max_length=20)


class AddressInput(serializers.Serializer):
    receiver = serializers.CharField(min_length=3, max_length=120)
    mobile = serializers.CharField()
    province = serializers.CharField(max_length=60)
    city = serializers.CharField(min_length=2, max_length=60)
    line = serializers.CharField(min_length=10)
    postalCode = serializers.CharField()

    def validate_mobile(self, value):
        return clean_mobile(value)

    def validate_postalCode(self, value):
        return clean_postal_code(value)


class OrderInput(serializers.Serializer):
    lines = LineInput(many=True, allow_empty=False, max_length=50)
    address = AddressInput()
    shipping = serializers.CharField(max_length=20)
    payment = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    coupon = serializers.CharField(required=False, allow_blank=True, max_length=30)
    expectedTotal = serializers.IntegerField(min_value=0)


class TrackInput(serializers.Serializer):
    code = serializers.CharField(max_length=16)
    mobile = serializers.CharField()

    def validate_mobile(self, value):
        return clean_mobile(value)


class ShippingSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code")
    allowsCod = serializers.BooleanField(source="allows_cod")

    class Meta:
        model = ShippingMethod
        fields = ["id", "name", "eta", "price", "allowsCod"]


class OrderLineSerializer(serializers.ModelSerializer):
    variantId = serializers.CharField(source="variant_id")
    slug = serializers.CharField(source="product_slug")
    variantLabel = serializers.CharField(source="variant_label")
    price = serializers.IntegerField(source="unit_price")
    compareAt = serializers.IntegerField(source="compare_at")
    art = serializers.SerializerMethodField()

    class Meta:
        model = OrderLine
        fields = ["variantId", "slug", "name", "variantLabel", "price", "compareAt", "qty", "art", "image"]

    def get_art(self, line):
        return {"kind": line.art_kind, "tone": line.art_tone}


class OrderSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="code")
    createdAt = serializers.DateTimeField(source="created_at")
    shipping = serializers.IntegerField(source="shipping_cost")
    shippingMethod = serializers.CharField(source="shipping_method")
    paymentMethod = serializers.CharField(source="get_payment_method_display")
    trackingCode = serializers.CharField(source="tracking_code")
    lines = OrderLineSerializer(many=True)
    address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "createdAt", "status", "lines", "subtotal", "discount", "shipping", "total",
            "address", "shippingMethod", "paymentMethod", "trackingCode",
        ]

    def get_address(self, order):
        return {
            "receiver": order.receiver,
            "mobile": order.mobile,
            "province": order.province,
            "city": order.city,
            "line": order.line,
            "postalCode": order.postal_code,
        }
