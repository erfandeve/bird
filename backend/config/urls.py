from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "مدیریت فروشگاه میلو"
admin.site.site_title = "میلو"
admin.site.index_title = "پیشخوان"

api = [
    path("auth/", include("accounts.urls")),
    path("", include("catalog.urls")),
    path("", include("orders.urls")),
    path("", include("content.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
