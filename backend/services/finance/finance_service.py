from backend.repositories.finance.transaction_repository import TransactionRepository
from backend.apps.finance.models import Transaction, TransactionCategory
from backend.apps.orders.models import Order


class FinanceService:
    """Сервис управления финансами."""

    @staticmethod
    def create_revenue_transaction(
        order: Order,
        amount: float,
        tax_amount: float = 0,
        description: str = ""
    ) -> Transaction:
        """Создать доходную транзакцию."""
        return TransactionRepository.create(
            order=order,
            amount=amount,
            tax_amount=tax_amount,
            category=TransactionCategory.REVENUE,
            description=description or f"Payment for order #{order.id}"
        )

    @staticmethod
    def create_expense_transaction(
        amount: float,
        description: str = "",
        order: Order = None
    ) -> Transaction:
        """Создать расходную транзакцию."""
        return TransactionRepository.create(
            order=order,
            amount=amount,
            tax_amount=0,
            category=TransactionCategory.EXPENSE,
            description=description
        )

    @staticmethod
    def calculate_revenue() -> float:
        """Рассчитать общую выручку."""
        return TransactionRepository.calculate_revenue()

    @staticmethod
    def calculate_expenses() -> float:
        """Рассчитать общие расходы."""
        return TransactionRepository.calculate_expenses()

    @staticmethod
    def get_net_profit() -> float:
        """Рассчитать чистую прибыль."""
        revenue = TransactionRepository.calculate_revenue()
        expenses = TransactionRepository.calculate_expenses()
        return revenue - expenses

    @staticmethod
    def get_transaction_by_order(order: Order) -> list:
        """Получить транзакции по заказу."""
        return list(TransactionRepository.get_by_order(order))