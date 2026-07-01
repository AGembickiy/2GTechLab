# Common serializers for 2GTechLab

from rest_framework import serializers


class IDSerializer(serializers.Serializer):
    """Serializer with only ID field."""
    id = serializers.IntegerField()


class MessageSerializer(serializers.Serializer):
    """Serializer with only message field."""
    message = serializers.CharField()
