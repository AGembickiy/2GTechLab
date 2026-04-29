from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from orders.models import Material, Order, OrderParameter, Printer


class AdminApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="manager", password="pass")
        self.client.force_authenticate(user=self.user)
        self.material = Material.objects.create(
            name="PLA White",
            material_type="PLA",
            manufacturer="BestFilament",
            color_hex="#FFFFFF",
            price_per_kg=1200,
            weight_g=1500,
            actual_weight_g=1450,
            min_weight_g=400,
        )
        self.printer = Printer.objects.create(
            model_name="Prusa MK3S+",
            hourly_rate=500,
            is_active=True,
        )

    def create_order(self, status: str, final_price: int | None):
        order = Order.objects.create(
            status=status,
            final_price=final_price,
            material=self.material,
            printer=self.printer,
        )
        OrderParameter.objects.create(order=order)
        return order

    def test_finance_endpoint_returns_aggregated_metrics(self):
        self.create_order(status="completed", final_price=1000)
        self.create_order(status="completed", final_price=1500)
        self.create_order(status="printing", final_price=900)

        response = self.client.get("/api/orders/finance/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(float(response.data["total_revenue"]), 2500.0)
        self.assertEqual(float(response.data["avg_check"]), 1250.0)
        self.assertEqual(response.data["completed_orders_count"], 2)
        self.assertEqual(response.data["in_progress_orders_count"], 1)
        self.assertEqual(float(response.data["estimated_pipeline_value"]), 900.0)

    def test_materials_endpoint_exposes_inventory_fields(self):
        response = self.client.get("/api/materials/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        material_payload = response.data[0]
        self.assertEqual(material_payload["material_type"], "PLA")
        self.assertEqual(material_payload["manufacturer"], "BestFilament")
        self.assertEqual(material_payload["actual_weight_g"], 1450)
        self.assertEqual(material_payload["min_weight_g"], 400)

    def test_materials_crud_flow(self):
        create_response = self.client.post(
            "/api/materials/",
            {
                "name": "PETG Black",
                "category": "filament",
                "material_type": "PETG",
                "manufacturer": "Fiberlogy",
                "supplier": "3D Store",
                "color_hex": "#111111",
                "price_per_kg": "1600.00",
                "purchase_price": "1400.00",
                "weight_g": 1000,
                "actual_weight_g": 980,
                "min_weight_g": 250,
                "density": 1.27,
                "print_temperature_c": 235,
                "filament_diameter_mm": 1.75,
                "spool_weight_g": 1000,
                "filament_length_m": 330,
                "delivery_date": "2026-03-20",
                "expiration_date": "2027-03-20",
                "previous_inventory_date": "2026-04-01",
                "next_inventory_date": "2026-05-01",
                "notes": "Партия A1",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)
        created_id = create_response.data["id"]
        self.assertEqual(create_response.data["supplier"], "3D Store")

        update_response = self.client.put(
            f"/api/materials/{created_id}/",
            {
                "name": "PETG Black Pro",
                "category": "filament",
                "material_type": "PETG",
                "manufacturer": "Fiberlogy",
                "supplier": "3D Store",
                "color_hex": "#101010",
                "price_per_kg": "1650.00",
                "purchase_price": "1450.00",
                "weight_g": 900,
                "actual_weight_g": 870,
                "min_weight_g": 220,
                "density": 1.27,
                "print_temperature_c": 240,
                "filament_diameter_mm": 1.75,
                "spool_weight_g": 1000,
                "filament_length_m": 320,
                "delivery_date": "2026-04-10",
                "expiration_date": "2027-04-10",
                "previous_inventory_date": "2026-04-05",
                "next_inventory_date": "2026-05-10",
                "notes": "Инвентаризация обновлена",
            },
            format="json",
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data["name"], "PETG Black Pro")
        self.assertEqual(update_response.data["actual_weight_g"], 870)
        self.assertEqual(update_response.data["print_temperature_c"], 240)

        delete_response = self.client.delete(f"/api/materials/{created_id}/")
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Material.objects.filter(id=created_id).exists())

    def test_jwt_token_auth_allows_materials_access(self):
        self.client.force_authenticate(user=None)
        token_response = self.client.post(
            "/api/token/",
            {"username": "manager", "password": "pass"},
            format="json",
        )
        self.assertEqual(token_response.status_code, 200)
        access_token = token_response.data["access"]

        jwt_client = APIClient()
        jwt_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = jwt_client.get("/api/materials/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
