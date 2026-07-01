from rest_framework import serializers
from backend.apps.internal_messages.models.message import Message


class MessageSerializer(serializers.ModelSerializer):
    """Сериализатор сообщения."""
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'sender_name', 'recipient_name', 'subject', 'body', 'is_read', 'created_at', 'replied_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'created_at', 'replied_at']
