from decimal import Decimal
from django.utils import timezone
from rentals.models import RentalOrder, RentalItem, RentalInspection
from rentals.repositories import RentalRepository
from finance.models import Payment, SecurityDeposit
from rentals.state_machine import RentalStateMachine
from rentals.strategies import LateFeeCalculator

class RentalService:
    @staticmethod
    def create_rental_order(client, start_date, end_date, fulfillment_type, shipping_address, items_data):
        return RentalRepository.create_order(
            client=client,
            start_date=start_date,
            end_date=end_date,
            fulfillment_type=fulfillment_type,
            shipping_address=shipping_address,
            items_data=items_data
        )

    @staticmethod
    def confirm_order(order_id, user=None):
        order = RentalRepository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")
        
        sm = RentalStateMachine(order)
        sm.transition_to('confirmed', user)
        return order

    @staticmethod
    def collect_payment(order_id, amount_paid, deposit_paid):
        order = RentalRepository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        if Decimal(str(amount_paid)) > 0:
            Payment.objects.create(
                rental_order=order,
                payment_type='rental',
                amount=Decimal(str(amount_paid)),
                status='paid'
            )

        if Decimal(str(deposit_paid)) > 0:
            Payment.objects.create(
                rental_order=order,
                payment_type='deposit',
                amount=Decimal(str(deposit_paid)),
                status='paid'
            )
            SecurityDeposit.objects.create(
                order=order,
                amount=Decimal(str(deposit_paid)),
                status='Held'
            )

        return order

    @staticmethod
    def pickup_order(order_id, user=None):
        order = RentalRepository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        sm = RentalStateMachine(order)
        sm.transition_to('picked_up', user)
        order.actual_pickup = timezone.now()
        order.save()
        return order

    @staticmethod
    def return_order(order_id, inspector, condition_rating, damage_notes="", missing_accessories=""):
        order = RentalRepository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        now = timezone.now()

        # Log inspection
        inspection = RentalInspection.objects.create(
            rental_order=order,
            inspector=inspector,
            condition_rating=condition_rating,
            damage_notes=damage_notes,
            missing_accessories=missing_accessories
        )

        # Transition order state
        sm = RentalStateMachine(order)
        sm.transition_to('returned', inspector)

        # Calculate late fee using Strategy Pattern
        late_fee = LateFeeCalculator.calculate_order_fees(order, now)
        if late_fee > 0:
            Payment.objects.create(
                rental_order=order,
                payment_type='late_fee',
                amount=late_fee,
                status='paid'
            )

        return order, inspection

    @staticmethod
    def settle_order(order_id):
        order = RentalRepository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        sm = RentalStateMachine(order)
        sm.transition_to('settled')
        return order
