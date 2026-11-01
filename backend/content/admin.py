from django.contrib import admin

from .models import ContactMessage, NewsletterSubscriber, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "published_at", "is_published"]
    list_filter = ["is_published"]
    search_fields = ["title", "body"]
    prepopulated_fields = {"slug": ["title"]}


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "mobile", "created_at", "is_handled"]
    list_filter = ["is_handled"]
    list_editable = ["is_handled"]
    search_fields = ["name", "mobile", "message"]
    readonly_fields = ["name", "mobile", "message", "created_at"]


@admin.register(NewsletterSubscriber)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ["contact", "created_at"]
    search_fields = ["contact"]
