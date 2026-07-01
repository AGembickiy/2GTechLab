from typing import List, Optional
from django.db.models import QuerySet
from backend.apps.finance.models import Transaction, TransactionCategory
from backend.apps.orders.models import Order


class TransactionRepository:
    """Репозиторий для работы с транзакциями."""

    @staticmethod
    def get_by_id(transaction_id: int) -> Optional[Transaction]:
        """Получить транзакцию по ID."""
        try:
            return Transaction.objects.select_related("order").get(pk=transaction_id)
        except Transaction.DoesNotExist:
            return None

    @staticmethod
    def get_all() -> QuerySet[Transaction]:
        """Получить все транзакции."""
        return Transaction.objects.select_related("order")

    @staticmethod
    def get_by_order(order: Order) -> QuerySet[Transaction]:
        """Получить транзакции по заказу."""
        return Transaction.objects.filter(order=order)

    @staticmethod
    def get_by_category(category: str) -> QuerySet[Transaction]:
        """Получить транзакции по категории."""
        return Transaction.objects.filter(category=category)

    @staticmethod
    def get_revenue_transactions() -> QuerySet[Transaction]:
        """Получить доходные транзакции."""
        return Transaction.objects.filter(category=TransactionCategory.REVENUE)

    @staticmethod
    def get_expense_transactions() -> QuerySet[Transaction]:
        """Получить расходные транзакции."""
        return Transaction.objects.filter(category=TransactionCategory.EXPENSE)

    @staticmethod
    def create(
        order: Order = None,
        amount: float = 0,
        tax_amount: float = 0,
        category: str = TransactionCategory.REVENUE,
        description: str = ""
    ) -> Transaction:
        """Создать новую транзакцию."""
        return Transaction.objects.create(
            order=order,
            amount=amount,
            tax_amount=tax_amount,
            category=category,
            description=description
        )

    @staticmethod
    def calculate_revenue() -> float:
        """Рассчитать общую выручку."""
        revenue = Transaction.objects.filter(category=TransactionCategory.REVENUE).aggregate(
            total=models.Sum('amount')
        )
        return revenue['total'] or 0

    @staticmethod
    def calculate_expenses() -> float:
        """Рассчитать общие расходы."""
        expenses = Transaction.objects.filter(category=TransactionCategory.EXPENSE).aggregate(
            total=models.Sum('amount')
        )
        return expenses['total'] or 0
