from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from user_profiles.models import Profile


class UsersListApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_users_endpoint_returns_roles_from_profile_and_admin_flags(self):
        admin_user = User.objects.create_user(
            username="admin_user",
            password="pass",
            is_staff=True,
            email="admin@test.local",
        )
        partner_user = User.objects.create_user(
            username="partner_user",
            password="pass",
            email="partner@test.local",
        )
        Profile.objects.create(user=partner_user, role="partner")

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        users_by_name = {user["username"]: user for user in response.json()}
        self.assertEqual(users_by_name["admin_user"]["role"], "admin")
        self.assertEqual(users_by_name["partner_user"]["role"], "partner")
