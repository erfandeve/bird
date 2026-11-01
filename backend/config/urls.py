from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views.static import serve

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
    path("healthz", lambda request: HttpResponse("ok")),
    path("admin/", admin.site.urls),
    path("api/v1/", include(api)),
    # عکس محصول فقط از ادمین آپلود می‌شود و از volume همین سرور خوانده می‌شود
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
