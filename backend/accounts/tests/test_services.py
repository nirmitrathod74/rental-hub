from django.test import TestCase
from accounts.models import User
from accounts.services import UserService
from accounts.repositories import UserRepository

class UserServiceTests(TestCase):
    def setUp(self):
        self.vendor = UserRepository.create_user(
            username='vendor1', password='password123', email='vendor1@test.com', role='vendor', vendor_status='pending'
        )
        self.client = UserRepository.create_user(
            username='client1', password='password123', email='client1@test.com', role='client'
        )

    def test_approve_vendor(self):
        approved_user = UserService.approve_vendor(self.vendor.id)
        self.assertEqual(approved_user.vendor_status, 'approved')
        self.vendor.refresh_from_db()
        self.assertEqual(self.vendor.vendor_status, 'approved')
        self.assertTrue(self.vendor.is_approved_vendor)

    def test_reject_vendor(self):
        rejected_user = UserService.reject_vendor(self.vendor.id)
        self.assertEqual(rejected_user.vendor_status, 'rejected')

    def test_approve_non_vendor_raises_error(self):
        with self.assertRaises(ValueError):
            UserService.approve_vendor(self.client.id)
