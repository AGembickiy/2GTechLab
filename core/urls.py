from importlib import import_module
from django.urls import path, include
from django.contrib import admin
try:
    from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
except ImportError:
    TokenObtainPairView = None
    TokenRefreshView = None

urlpatterns = [
    path('admin/', admin.site.urls),
]


def include_if_exists(urlconf_path: str):
    try:
        import_module(urlconf_path)
    except ModuleNotFoundError:
        return None
    return path('api/', include(urlconf_path))


for app_urls in ('shop.urls', 'user_profiles.urls', 'print_service.urls', 'orders.urls'):
    included = include_if_exists(app_urls)
    if included:
        urlpatterns.append(included)

if TokenObtainPairView and TokenRefreshView:
    urlpatterns += [
        path('api/token/', TokenObtainPairView.as_view()),
        path('api/token/refresh/', TokenRefreshView.as_view()),
    ]
