from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from backend.apps.finance.models.transaction import Transaction
from backend.apps.finance.serializers.transaction_serializer import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet для управления транзакциями."""
    queryset = Transaction.objects.all().select_related('order')
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
