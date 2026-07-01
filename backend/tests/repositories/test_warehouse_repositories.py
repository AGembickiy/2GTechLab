from django.test import TestCase


class WarehouseRepositoryTests(TestCase):
    """Тесты репозитория склада."""
    
    def setUp(self):
        from backend.apps.warehouse.models import WarehouseItem
        from backend.apps.warehouse.repositories.warehouse_repository import WarehouseRepository
        
        self.repo = WarehouseRepository
        self.item = WarehouseItem.objects.create(
            name='Test Material',
            sku='TEST001',
            item_type='material',
            quantity=100,
            min_quantity=10,
            unit='шт.',
            cost_price=100.00,
            selling_price=150.00
        )
    
    def test_get_item_by_id(self):
        """Тест получения товара по ID."""
        item = self.repo.get_item_by_id(self.item.id)
        self.assertIsNotNone(item)
        self.assertEqual(item.name, 'Test Material')
    
    def test_get_item_by_sku(self):
        """Тест получения товара по артикулу."""
        item = self.repo.get_item_by_sku('TEST001')
        self.assertIsNotNone(item)
        self.assertEqual(item.sku, 'TEST001')
    
    def test_create_item(self):
        """Тест создания товара."""
        item = self.repo.create_item(
            name='New Item',
            description='Test description',
            item_type='consumable',
            sku='NEW001',
            quantity=50,
            min_quantity=5,
            unit='шт.',
            cost_price=50.00,
            selling_price=75.00
        )
        self.assertIsNotNone(item)
        self.assertEqual(item.sku, 'NEW001')


class WarehouseTransactionRepositoryTests(TestCase):
    """Тесты репозитория транзакций."""
    
    def setUp(self):
        from backend.apps.warehouse.models import WarehouseItem, WarehouseTransaction
        from backend.apps.warehouse.repositories.transaction_repository import WarehouseTransactionRepository
        from django.contrib.auth.models import User
        
        self.repo = WarehouseTransactionRepository
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.item = WarehouseItem.objects.create(
            name='Test Material',
            sku='TEST001',
            item_type='material',
            quantity=100,
            min_quantity=10,
            unit='шт.',
            cost_price=100.00,
            selling_price=150.00
        )
        
        self.transaction = self.repo.create_transaction(
            item=self.item,
            transaction_type='income',
            quantity=50,
            old_quantity=100,
            new_quantity=150,
            description='Test transaction',
            created_by=self.user
        )
    
    def test_get_transaction_by_id(self):
        """Тест получения транзакции по ID."""
        transaction = self.repo.get_transaction_by_id(self.transaction.id)
        self.assertIsNotNone(transaction)
        self.assertEqual(transaction.transaction_type, 'income')


class AuditRepositoryTests(TestCase):
    """Тесты репозитория инвентаризации."""
    
    def setUp(self):
        from backend.apps.warehouse.models import WarehouseItem, InventoryAudit, InventoryAuditItem
        from backend.apps.warehouse.repositories.audit_repository import AuditRepository
        from django.contrib.auth.models import User
        
        self.repo = AuditRepository
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.item = WarehouseItem.objects.create(
            name='Test Material',
            sku='TEST001',
            item_type='material',
            quantity=100,
            min_quantity=10,
            unit='шт.',
            cost_price=100.00,
            selling_price=150.00
        )
        
        self.audit = InventoryAudit.objects.create(
            title='Test Audit',
            description='Test description',
            planned_date='2026-01-01',
            created_by=self.user
        )
    
    def test_get_audit_by_id(self):
        """Тест получения инвентаризации по ID."""
        audit = self.repo.get_audit_by_id(self.audit.id)
        self.assertIsNotNone(audit)
        self.assertEqual(audit.title, 'Test Audit')
