"""
Accounts URLs.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.apps.accounts.views.user_views import UserViewSet, ProfileViewSet
from backend.apps.accounts.views.phone_verification_views import SendPhoneVerificationView, VerifyPhoneView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    # Phone verification endpoints
    path('phone/send-verification/', SendPhoneVerificationView.as_view(), name='phone-send-verification'),
    path('phone/verify/', VerifyPhoneView.as_view(), name='phone-verify'),
]
