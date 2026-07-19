from rest_framework import viewsets, permissions
from .models import SecurityDeposit, PlatformRevenue
from .serializers import SecurityDepositSerializer, PlatformRevenueSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

class SecurityDepositViewSet(viewsets.ModelViewSet):
    queryset = SecurityDeposit.objects.select_related('order', 'order__customer', 'order__customer__user').all().order_by('-updated_at')
    serializer_class = SecurityDepositSerializer
    permission_classes = [permissions.IsAuthenticated]

class VendorPayoutsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        payouts = PlatformRevenue.objects.filter(order__items__product__vendor=request.user).distinct().order_by('-created_at')
        serializer = PlatformRevenueSerializer(payouts, many=True)
        return Response(serializer.data)
