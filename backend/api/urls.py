from django.urls import path, include
from backend.api.v1.accounts.views import LoginView

urlpatterns = [
    path('v1/', include('backend.api.v1.urls')),
    path('token/', LoginView.as_view(), name='token'),
]
