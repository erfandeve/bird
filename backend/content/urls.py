from django.urls import path

from . import views

urlpatterns = [
    path("posts", views.PostListView.as_view()),
    path("posts/<slug:slug>", views.PostDetailView.as_view()),
    path("contact", views.ContactView.as_view()),
    path("newsletter", views.NewsletterView.as_view()),
]
