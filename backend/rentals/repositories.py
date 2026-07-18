from django.utils import timezone
from django.db.models import Sum, Q
from rentals.models import RentalOrder, RentalItem, DepositHistory, RentalInspection
from decimal import Decimal

class RentalRepository:
    @staticmethod
    def get_all():
        return RentalOrder.objects.all().select_related('client').prefetch_related('items__product')

    @staticmethod
    def get_by_id(order_id):
        try:
            return RentalOrder.objects.select_related('client').prefetch_related('items__product', 'inspections', 'deposit_history').get(pk=order_id)
        except RentalOrder.DoesNotExist:
            return None

    @staticmethod
    def get_client_orders(client):
        return RentalOrder.objects.filter(client=client).prefetch_related('items__product').order_by('-created_at')

    @staticmethod
    def get_active_rentals():
        return RentalOrder.objects.filter(status='picked_up')

    @staticmethod
    def get_overdue_rentals():
        return RentalOrder.objects.filter(status='overdue')

    @staticmethod
    def get_rentals_due_today():
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timezone.timedelta(days=1)
        return RentalOrder.objects.filter(end_date__range=(today_start, today_end), status='picked_up')

    @staticmethod
    def get_upcoming_pickups():
        now = timezone.now()
        return RentalOrder.objects.filter(start_date__gte=now, status='confirmed')

    @staticmethod
    def get_upcoming_returns():
        now = timezone.now()
        return RentalOrder.objects.filter(end_date__gte=now, status='picked_up')

    @staticmethod
    def get_revenue_sum():
        # Sum of rent paid by customers
        res = RentalOrder.objects.filter(status__in=['returned', 'settled']).aggregate(Sum('amount_paid'))
        return res['amount_paid__sum'] or Decimal('0.00')

    @staticmethod
    def get_deposits_held_sum():
        # Total security deposits currently held (paid minus refunded/deducted)
        collected = RentalOrder.objects.aggregate(Sum('deposit_paid'))['deposit_paid__sum'] or Decimal('0.00')
        refunded = RentalOrder.objects.aggregate(Sum('deposit_refunded'))['deposit_refunded__sum'] or Decimal('0.00')
        deducted = RentalOrder.objects.aggregate(Sum('late_fee_charged'))['late_fee_charged__sum'] or Decimal('0.00')
        return max(Decimal('0.00'), collected - refunded - deducted)

    @staticmethod
    def get_late_fees_collected_sum():
        res = RentalOrder.objects.aggregate(Sum('late_fee_charged'))['late_fee_charged__sum'] or Decimal('0.00')
        return res or Decimal('0.00')

    @staticmethod
    def create_order(client, start_date, end_date, fulfillment_type, shipping_address, items_data):
        order = RentalOrder.objects.create(
            client=client,
            start_date=start_date,
            end_date=end_date,
            fulfillment_type=fulfillment_type,
            shipping_address=shipping_address,
            status='draft'
        )

        total_rent = Decimal('0.00')
        total_deposit = Decimal('0.00')

        from inventory.repositories import PriceListRepository
        for item in items_data:
            product = item['product']
            qty = item['quantity']
            variants = item.get('variants', {})

            # Calculate price
            price = PriceListRepository.get_product_price(product)
            deposit = product.security_deposit_value
            if product.security_deposit_type == 'percentage':
                deposit = (product.security_deposit_value / 100) * price

            RentalItem.objects.create(
                rental_order=order,
                product=product,
                quantity=qty,
                unit_price=price,
                deposit_amount=deposit,
                selected_variants=variants
            )

            total_rent += price * qty
            total_deposit += deposit * qty

        order.total_rent_amount = total_rent
        order.total_deposit_amount = total_deposit
        order.save()
        return order


class DepositRepository:
    @staticmethod
    def log_transaction(order, amount, transaction_type, notes=None):
        return DepositHistory.objects.create(
            rental_order=order,
            amount=amount,
            transaction_type=transaction_type,
            notes=notes
        )

    @staticmethod
    def get_history(order):
        return DepositHistory.objects.filter(rental_order=order).order_by('-created_at')
