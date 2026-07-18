from rest_framework import viewsets, permissions
from .models import SecurityDeposit
from .serializers import SecurityDepositSerializer

class SecurityDepositViewSet(viewsets.ModelViewSet):
    queryset = SecurityDeposit.objects.select_related('order', 'order__customer', 'order__customer__user').all().order_by('-updated_at')
    serializer_class = SecurityDepositSerializer
    permission_classes = [permissions.IsAuthenticated]
