from rest_framework import serializers
from backend.apps.finance.models.transaction import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """Сериализатор транзакции."""
    class Meta:
        model = Transaction
        fields = ['id', 'order', 'amount', 'tax_amount', 'category', 'description', 'created_at', 'total_amount']
        read_only_fields = ['id', 'created_at', 'total_amount']
