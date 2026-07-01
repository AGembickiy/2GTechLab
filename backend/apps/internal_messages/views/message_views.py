from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from backend.apps.internal_messages.models.message import Message
from backend.apps.internal_messages.serializers.message_serializer import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet для управления сообщениями."""
    queryset = Message.objects.all().select_related('sender', 'recipient')
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Message.objects.all().select_related('sender', 'recipient')
        return Message.objects.filter(recipient=self.request.user).select_related('sender', 'recipient')
