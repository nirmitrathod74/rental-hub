from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from accounts.models import User
from accounts.repositories import UserRepository

class VendorApprovalAPITests(APITestCase):
    def setUp(self):
        self.admin = UserRepository.create_user(username='admin', password='password123', email='admin@test.com', role='admin')
        self.vendor = UserRepository.create_user(username='vendor_pending', password='password123', email='vendor@test.com', role='vendor', vendor_status='pending')
        self.client_user = UserRepository.create_user(username='client', password='password123', email='client@test.com', role='client')

    def test_register_vendor_sets_pending_status(self):
        url = reverse('auth_register')
        data = {
            'username': 'newvendor',
            'password': 'password123',
            'role': 'vendor',
            'email': 'vendor@example.com'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        user = User.objects.get(username='newvendor')
        self.assertEqual(user.role, 'vendor')
        self.assertEqual(user.vendor_status, 'pending')

    def test_pending_vendor_login_fails(self):
        url = reverse('token_obtain_pair')
        data = {'username': 'vendor_pending', 'password': 'password123'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_approve_vendor(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-vendors-approve', kwargs={'pk': self.vendor.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        self.vendor.refresh_from_db()
        self.assertEqual(self.vendor.vendor_status, 'approved')
        
    def test_client_cannot_approve_vendor(self):
        self.client.force_authenticate(user=self.client_user)
        url = reverse('admin-vendors-approve', kwargs={'pk': self.vendor.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
