from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import User


class TransactionCategory(models.TextChoices):
    """Категории транзакций."""
    REVENUE = "revenue", "Доход"
    EXPENSE = "expense", "Расход"


class Transaction(models.Model):
    """Финансовые транзакции."""
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="transactions",
        null=True,
        blank=True
    )
    amount = models.DecimalField(
        "Сумма",
        max_digits=12,
        decimal_places=2
    )
    tax_amount = models.DecimalField(
        "Сумма НДС",
        max_digits=12,
        decimal_places=2,
        default=0
    )
    category = models.CharField(
        "Категория",
        max_length=20,
        choices=TransactionCategory.choices
    )
    description = models.TextField("Описание", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Транзакция'
        verbose_name_plural = 'Транзакции'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_category_display()}: {self.amount}"

    @property
    def total_amount(self) -> float:
        """Общая сумма с НДС."""
        return self.amount + self.tax_amount
