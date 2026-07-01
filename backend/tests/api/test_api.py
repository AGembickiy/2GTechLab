from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class APIAuthTests(TestCase):
    """Тесты API аутентификации."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_login_success(self):
        """Тест успешного входа."""
        # Clear rate limit for this test
        from django.core.cache import cache
        cache.clear()
        
        response = self.client.post('/api/v1/accounts/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
    
    def test_login_invalid_credentials(self):
        """Тест входа с неверными данными."""
        response = self.client.post('/api/v1/accounts/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_rate_limiting(self):
        """Тест ограничения частоты входа."""
        for i in range(6):
            response = self.client.post('/api/v1/accounts/login/', {
                'username': 'testuser',
                'password': 'wrongpassword'
            })
        
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class APIWarehouseTests(TestCase):
    """Тесты API склада."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_get_items_authenticated(self):
        """Тест получения списка товаров."""
        response = self.client.get('/api/v1/warehouse/items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_item_authenticated(self):
        """Тест создания товара."""
        response = self.client.post('/api/v1/warehouse/items/', {
            'name': 'Test Material',
            'sku': 'TEST001',
            'item_type': 'material',
            'quantity': 100,
            'min_quantity': 10,
            'unit': 'шт.',
            'cost_price': 100.00,
            'selling_price': 150.00
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class APIOrderTests(TestCase):
    """Тесты API заказов."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_get_orders_authenticated(self):
        """Тест получения списка заказов."""
        response = self.client.get('/api/v1/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class APIThrottlingTests(TestCase):
    """Тесты ограничения частоты."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_burst_throttling(self):
        """Тест ограничения burst."""
        for i in range(101):
            response = self.client.get('/api/v1/warehouse/items/')
        
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
