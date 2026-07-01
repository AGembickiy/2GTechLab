from django.urls import path
from backend.apps.accounts.views.phone_verification_views import SendPhoneVerificationView, VerifyPhoneView

urlpatterns = [
    path('send-verification/', SendPhoneVerificationView.as_view(), name='phone-send-verification'),
    path('verify/', VerifyPhoneView.as_view(), name='phone-verify'),
]
