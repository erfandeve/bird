from django.urls import path

from . import views

urlpatterns = [
    path("shipping-methods", views.ShippingListView.as_view()),
    path("orders/quote", views.QuoteView.as_view()),
    path("orders/track", views.TrackView.as_view()),
    path("orders", views.OrderListView.as_view()),
    path("orders/<str:code>", views.OrderDetailView.as_view()),
    path("payments/callback", views.payment_callback),
    path("payments/fake/<str:authority>", views.fake_gateway_page),
]
