from django.utils import timezone
from django.db.models import Sum, Q
from rentals.models import RentalOrder, RentalItem, RentalInspection
from finance.models import Payment, SecurityDeposit
from decimal import Decimal

class RentalRepository:
    @staticmethod
    def get_all():
        return RentalOrder.objects.all().select_related('client').prefetch_related('items__product')

    @staticmethod
    def get_by_id(order_id):
        try:
            return RentalOrder.objects.select_related('client').prefetch_related('items__product', 'inspections').get(pk=order_id)
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
        res = Payment.objects.filter(payment_type='rental', status='paid').aggregate(Sum('amount'))
        return res['amount__sum'] or Decimal('0.00')

    @staticmethod
    def get_deposits_held_sum():
        # Total security deposits currently held
        res = SecurityDeposit.objects.filter(status='Held').aggregate(Sum('amount'))
        return res['amount__sum'] or Decimal('0.00')

    @staticmethod
    def get_late_fees_collected_sum():
        res = Payment.objects.filter(payment_type='late_fee', status='paid').aggregate(Sum('amount'))
        return res['amount__sum'] or Decimal('0.00')

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

        from inventory.repositories import PriceListRepository
        for item in items_data:
            product = item['product']
            qty = item['quantity']
            variants = item.get('variants', {})

            # Calculate price
            price = PriceListRepository.get_product_price(product)
            deposit = Decimal('0.00')
            if product.rental_policy:
                deposit = product.rental_policy.security_deposit_value
                if product.rental_policy.security_deposit_type == 'percentage':
                    deposit = (product.rental_policy.security_deposit_value / 100) * price

            RentalItem.objects.create(
                rental_order=order,
                product=product,
                quantity=qty,
                unit_price=price,
                deposit_amount=deposit,
                selected_variants=variants
            )

        return order
