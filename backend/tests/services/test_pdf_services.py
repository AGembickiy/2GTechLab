from django.test import TestCase


class InvoiceGeneratorTests(TestCase):
    """Тесты генератора счетов."""
    
    def setUp(self):
        from django.contrib.auth.models import User
        from backend.services.pdf.invoice_generator import InvoicePDFGenerator
        
        self.generator = InvoicePDFGenerator
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_generate_invoice(self):
        """Тест генерации счета."""
        order = type('MockOrder', (), {'id': 123, 'total_price': 1000})()
        items = [
            {'material_name': 'PLA White', 'quantity': 2, 'unit_price': 500, 'total': 1000}
        ]
        
        pdf_content = self.generator.generate_invoice(order, self.user, items, 1000)
        self.assertIsNotNone(pdf_content)
        self.assertIsInstance(pdf_content, bytes)
    
    def test_get_default_template(self):
        """Тест получения шаблона."""
        order = type('MockOrder', (), {'id': 123})()
        items = []
        
        template = self.generator._get_default_template(order, self.user, items, 1000)
        self.assertIn('СЧЕТ #123', template)


class ReportGeneratorTests(TestCase):
    """Тесты генератора отчетов."""
    
    def setUp(self):
        from backend.services.pdf.invoice_generator import ReportPDFGenerator
        
        self.generator = ReportPDFGenerator
    
    def test_generate_sales_report(self):
        """Тест генерации отчета о продажах."""
        sales_data = [
            {'date': '01.01.2026', 'order_id': 1, 'customer': 'Test User', 'amount': 1000, 'status': 'completed'}
        ]
        
        pdf_content = self.generator.generate_sales_report('01.01.2026', '31.01.2026', sales_data)
        self.assertIsNotNone(pdf_content)
        self.assertIsInstance(pdf_content, bytes)
    
    def test_get_sales_report_template(self):
        """Тест получения шаблона отчета."""
        template = self.generator._get_sales_report_template('01.01.2026', '31.01.2026', [])
        self.assertIn('ОТЧЕТ О ПРОДАЖАХ', template)
