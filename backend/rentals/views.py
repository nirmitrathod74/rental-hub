from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from rentals.models import RentalOrder, RentalItem, QuotationTemplate, RentalInspection
from rentals.serializers import (
    RentalOrderSerializer, QuotationTemplateSerializer, RentalInspectionSerializer
)
from rentals.services import RentalService
from rentals.repositories import RentalRepository
from rentals.dashboard import DashboardService
from inventory.models import Product
from decimal import Decimal

class IsAdminUserOrClientOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_role:
            return True
        return obj.client == request.user

class RentalOrderViewSet(viewsets.ModelViewSet):
    serializer_class = RentalOrderSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdminUserOrClientOwner)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return RentalOrder.objects.all().order_by('-created_at')
        return RentalOrder.objects.filter(client=user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # Allow client or admin to create order
        client = request.user
        if request.user.is_admin_role and 'client_id' in request.data:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                client = User.objects.get(pk=request.data['client_id'])
            except User.DoesNotExist:
                return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

        start_date_str = request.data.get('start_date')
        end_date_str = request.data.get('end_date')
        fulfillment_type = request.data.get('fulfillment_type', 'store_pickup')
        shipping_address = request.data.get('shipping_address', '')
        items_data = request.data.get('items', [])

        if not start_date_str or not end_date_str or not items_data:
            return Response({'error': 'start_date, end_date, and items list are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse items
        parsed_items = []
        for item in items_data:
            product_id = item.get('product_id')
            qty = item.get('quantity', 1)
            variants = item.get('variants', {})
            try:
                product = Product.objects.get(pk=product_id)
            except Product.DoesNotExist:
                return Response({'error': f'Product #{product_id} not found'}, status=status.HTTP_404_NOT_FOUND)
            parsed_items.append({
                'product': product,
                'quantity': int(qty),
                'variants': variants
            })

        try:
            start_date = timezone.datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = timezone.datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)

        # Create order in Service Layer
        order = RentalService.create_rental_order(
            client=client,
            start_date=start_date,
            end_date=end_date,
            fulfillment_type=fulfillment_type,
            shipping_address=shipping_address,
            items_data=parsed_items
        )

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        try:
            # Transition to confirmed
            RentalService.confirm_order(order.id, request.user)
            
            # Check if payment values were supplied during check-out confirmation
            amt_paid = request.data.get('amount_paid', 0.0)
            dep_paid = request.data.get('deposit_paid', 0.0)
            
            if float(amt_paid) > 0 or float(dep_paid) > 0:
                RentalService.collect_payment(order.id, amt_paid, dep_paid)
                
            # Reload
            order.refresh_from_db()
            return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def collect_payment_api(self, request, pk=None):
        order = self.get_object()
        amt_paid = request.data.get('amount_paid', 0.0)
        dep_paid = request.data.get('deposit_paid', 0.0)
        try:
            RentalService.collect_payment(order.id, amt_paid, dep_paid)
            order.refresh_from_db()
            return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def pickup(self, request, pk=None):
        order = self.get_object()
        try:
            RentalService.pickup_order(order.id, request.user)
            order.refresh_from_db()
            return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def return_inspection(self, request, pk=None):
        order = self.get_object()
        # Checks condition rating: 'good', 'damaged', 'needs_repair'
        cond_rating = request.data.get('condition_rating', 'good')
        damage_notes = request.data.get('damage_notes', '')
        missing_acc = request.data.get('missing_accessories', '')

        try:
            order, inspection = RentalService.return_order(
                order_id=order.id,
                inspector=request.user,
                condition_rating=cond_rating,
                damage_notes=damage_notes,
                missing_accessories=missing_acc
            )
            return Response({
                'order': self.get_serializer(order).data,
                'inspection': RentalInspectionSerializer(inspection).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def settle(self, request, pk=None):
        order = self.get_object()
        try:
            RentalService.settle_order(order.id)
            order.refresh_from_db()
            return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def qr(self, request, pk=None):
        """Stable scan payload. Clients encode this UUID into a QR image."""
        order = self.get_object()
        return Response({'rental_id': str(order.public_id), 'order_id': order.id, 'status': order.status})

    @action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        order = self.get_object()

    @action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        order = self.get_object()
        # Returns invoice link
        invoice_url = DocumentFactory.generate_pdf_invoice(order)
        # Add host prefix in real scenario, we'll return full url path
        host = request.build_absolute_uri('/')[:-1]
        return Response({'invoice_url': f"{host}{invoice_url}"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def quotation(self, request, pk=None):
        order = self.get_object()
        template_id = request.query_params.get('template_id')
        template = None
        if template_id:
            try:
                template = QuotationTemplate.objects.get(pk=template_id)
            except QuotationTemplate.DoesNotExist:
                pass
        
        # Returns quotation link
        quot_url = DocumentFactory.generate_pdf_quotation(order, template)
        host = request.build_absolute_uri('/')[:-1]
        return Response({'quotation_url': f"{host}{quot_url}"}, status=status.HTTP_200_OK)


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def metrics(self, request):
        if not request.user.is_admin_role:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        return Response(DashboardService.metrics(), status=status.HTTP_200_OK)


class QuotationTemplateViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.all().order_by('id')
    serializer_class = QuotationTemplateSerializer
    permission_classes = (permissions.IsAuthenticated,)


from rentals.document_factory import DocumentFactory

class PickupOperationsAPIView(generics.ListAPIView):
    serializer_class = RentalOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return orders scheduled for pickup today or pending in the future
        return RentalOrder.objects.filter(
            status='confirmed'
        ).order_by('start_date')
