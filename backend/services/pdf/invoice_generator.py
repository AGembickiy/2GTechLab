from io import BytesIO
from datetime import datetime
from django.template.loader import get_template
from django.conf import settings
from weasyprint import HTML
import os


class InvoicePDFGenerator:
    """Генератор PDF счетов."""
    
    @staticmethod
    def generate_invoice(order, user, items, total_price):
        """
        Сгенерировать PDF счет.
        
        Args:
            order: Заказ
            user: Пользователь
            items: Элементы заказа
            total_price: Общая цена
            
        Returns:
            bytes: PDF файл
        """
        template_path = 'pdf/invoice.html'
        
        # Try to load template from file system if exists
        if os.path.exists(template_path):
            with open(template_path, 'r') as f:
                html_content = f.read()
        else:
            # Fallback to simple HTML
            html_content = InvoicePDFGenerator._get_default_template(order, user, items, total_price)
        
        # Convert HTML to PDF
        pdf_file = HTML(string=html_content, base_url=settings.STATIC_ROOT).write_pdf()
        
        return pdf_file
    
    @staticmethod
    def _get_default_template(order, user, items, total_price):
        """Получить шаблон по умолчанию."""
        from django.utils import timezone
        current_date = timezone.now().strftime('%d.%m.%Y')
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Счет #{order.id}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .customer {{ margin-bottom: 20px; }}
                .items {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                .items th, .items td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                .items th {{ background-color: #f4f4f4; }}
                .total {{ text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }}
                .footer {{ margin-top: 30px; text-align: center; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>СЧЕТ #{order.id}</h1>
                <p>2GTechLab - 3D Печать</p>
                <p>Дата: {current_date}</p>
            </div>
            
            <div class="customer">
                <h3>Заказчик:</h3>
                <p>{user.get_full_name() or user.username}</p>
                <p>Email: {user.email}</p>
            </div>
            
            <h3>Позиции заказа:</h3>
            <table class="items">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Материал</th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    {"".join(f'''
                    <tr>
                        <td>{i+1}</td>
                        <td>{item.get("material_name", "Материал")}</td>
                        <td>{item.get("quantity", 1)}</td>
                        <td>{item.get("unit_price", 0):.2f} ₽</td>
                        <td>{item.get("total", 0):.2f} ₽</td>
                    </tr>''' for i, item in enumerate(items))}
                </tbody>
            </table>
            
            <div class="total">
                Итого: {total_price:.2f} ₽
            </div>
            
            <div class="footer">
                <p>Спасибо за заказ!</p>
                <p>2GTechLab - 3D Печать и производство</p>
            </div>
        </body>
        </html>
        """
        return html


class ReportPDFGenerator:
    """Генератор PDF отчетов."""
    
    @staticmethod
    def generate_sales_report(start_date, end_date, sales_data):
        """Сгенерировать отчет о продажах."""
        template_path = 'pdf/sales_report.html'
        
        if os.path.exists(template_path):
            with open(template_path, 'r') as f:
                html_content = f.read()
        else:
            html_content = ReportPDFGenerator._get_sales_report_template(start_date, end_date, sales_data)
        
        pdf_file = HTML(string=html_content, base_url=settings.STATIC_ROOT).write_pdf()
        return pdf_file
    
    @staticmethod
    def _get_sales_report_template(start_date, end_date, sales_data):
        """Получить шаблон отчета о продажах."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Отчет о продажах</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .report-info {{ margin-bottom: 20px; }}
                .table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                .table th, .table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                .table th {{ background-color: #f4f4f4; }}
                .total {{ text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ОТЧЕТ О ПРОДАЖАХ</h1>
                <p>2GTechLab</p>
            </div>
            
            <div class="report-info">
                <p>Период: {start_date} - {end_date}</p>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Заказ</th>
                        <th>Клиент</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {"".join(f'''
                    <tr>
                        <td>{sale.get('date', '')}</td>
                        <td>{sale.get('order_id', '')}</td>
                        <td>{sale.get('customer', '')}</td>
                        <td>{sale.get('amount', 0):.2f} ₽</td>
                        <td>{sale.get('status', '')}</td>
                    </tr>''' for sale in sales_data)}
                </tbody>
            </table>
        </body>
        </html>
        """
        return html
