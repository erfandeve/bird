from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts.validators import clean_mobile

from .models import ContactMessage, NewsletterSubscriber, Post


class PostSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source="published_at")
    readMinutes = serializers.IntegerField(source="read_minutes")
    body = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["slug", "title", "excerpt", "date", "readMinutes", "body"]

    def get_body(self, post):
        return post.sections()


class ContactSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=2, max_length=120)
    message = serializers.CharField(min_length=10, max_length=4000)

    class Meta:
        model = ContactMessage
        fields = ["name", "mobile", "message"]

    def validate_mobile(self, value):
        return clean_mobile(value)


class NewsletterSerializer(serializers.Serializer):
    contact = serializers.CharField(max_length=254)

    def validate_contact(self, value):
        value = value.strip()
        try:
            return clean_mobile(value)
        except serializers.ValidationError:
            pass
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("یک شمارهٔ موبایل یا ایمیل درست وارد کنید.")
        return value.lower()


class PublicView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []


class PostListView(PublicView):
    def get(self, request):
        return Response(PostSerializer(Post.objects.filter(is_published=True), many=True).data)


class PostDetailView(PublicView):
    def get(self, request, slug):
        return Response(PostSerializer(get_object_or_404(Post, slug=slug, is_published=True)).data)


class PublicFormView(PublicView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "public_form"


class ContactView(PublicFormView):
    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)


class NewsletterView(PublicFormView):
    def post(self, request):
        serializer = NewsletterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        NewsletterSubscriber.objects.get_or_create(contact=serializer.validated_data["contact"])
        return Response(status=status.HTTP_201_CREATED)
