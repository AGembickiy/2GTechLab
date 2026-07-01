from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from backend.apps.accounts.models.user import Profile
from backend.apps.accounts.serializers.user_serializer import UserSerializer, ProfileSerializer
from backend.core.throttling.throttling import BurstRateThrottle, SustainedRateThrottle


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet для управления пользователями."""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'


class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet для управления профилями."""
    queryset = Profile.objects.all().select_related('user')
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [BurstRateThrottle]
    throttle_scope = 'sustained'

    def get_queryset(self):
        if self.request.user.is_staff:
            return Profile.objects.all().select_related('user')
        return Profile.objects.filter(user=self.request.user).select_related('user')
