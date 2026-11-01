from django.urls import path

from . import views

urlpatterns = [
    path("me", views.MeView.as_view()),
    path("register", views.RegisterView.as_view()),
    path("login", views.LoginView.as_view()),
    path("logout", views.LogoutView.as_view()),
    path("password/forgot", views.ForgotPasswordView.as_view()),
    path("password/reset", views.ResetPasswordView.as_view()),
    path("password/change", views.ChangePasswordView.as_view()),
    path("addresses", views.AddressListView.as_view()),
    path("addresses/<int:pk>", views.AddressDetailView.as_view()),
    path("wishlist", views.WishlistView.as_view()),
    path("wishlist/<slug:slug>", views.WishlistItemView.as_view()),
]
