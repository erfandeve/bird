from django.urls import path

from . import views

urlpatterns = [
    path("categories", views.CategoryListView.as_view()),
    path("birds", views.BirdListView.as_view()),
    path("brands", views.BrandListView.as_view()),
    path("slugs", views.SlugsView.as_view()),
    path("products", views.ProductListView.as_view()),
    path("products/<slug:slug>", views.ProductDetailView.as_view()),
    path("products/<slug:slug>/related", views.RelatedProductsView.as_view()),
    path("products/<slug:slug>/reviews", views.ProductReviewsView.as_view()),
]
