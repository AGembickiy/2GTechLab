from django.test import TestCase


class WarehouseServiceTests(TestCase):
    """Тесты сервиса склада."""
    
    def setUp(self):
        from backend.apps.warehouse.services.warehouse_service import WarehouseService
        
        self.service = WarehouseService()
    
    def test_check_stock_availability(self):
        """Тест проверки наличия товара."""
        # Test with non-existent item
        result = self.service.check_stock_availability(9999, 10)
        self.assertFalse(result)
    
    def test_get_low_stock_items(self):
        """Тест получения товаров с низким запасом."""
        items = self.service.get_low_stock_items()
        self.assertIsInstance(items, list)
    
    def test_get_out_of_stock_items(self):
        """Тест получения отсутствующих товаров."""
        items = self.service.get_out_of_stock_items()
        self.assertIsInstance(items, list)
    
    def test_search_items(self):
        """Тест поиска товаров."""
        items = self.service.search_items('test')
        self.assertIsInstance(items, list)


class PhoneVerificationServiceTests(TestCase):
    """Тесты сервиса верификации телефона."""
    
    def setUp(self):
        from backend.apps.accounts.services.phone_verification import PhoneVerificationService
        
        self.service = PhoneVerificationService
    
    def test_generate_verification_code(self):
        """Тест генерации кода верификации."""
        code = self.service.generate_verification_code()
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())
    
    def test_verify_code(self):
        """Тест верификации кода."""
        result = self.service.verify_code('+79991234567', '123456')
        self.assertTrue(result)
    
    def test_send_verification_sms(self):
        """Тест отправки SMS."""
        result = self.service.send_verification_sms('+79991234567', '123456')
        self.assertTrue(result)
