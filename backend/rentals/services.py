from decimal import Decimal
from django.utils import timezone
from rentals.models import RentalOrder, RentalItem, RentalInspection
from rentals.repositories import RentalRepository, DepositRepository
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

        order.amount_paid += Decimal(str(amount_paid))
        order.deposit_paid += Decimal(str(deposit_paid))
        order.save()

        if Decimal(str(deposit_paid)) > 0:
            DepositRepository.log_transaction(
                order=order,
                amount=Decimal(str(deposit_paid)),
                transaction_type='collect',
                notes=f"Collected security deposit of ${deposit_paid} during confirmation."
            )
        return order

    @staticmethod
    def pickup_order(order_id, user=None):
        order = RentalRepository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        sm = RentalStateMachine(order)
        sm.transition_to('picked_up', user)
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
            order.late_fee_charged = late_fee
            order.save()
            DepositRepository.log_transaction(
                order=order,
                amount=late_fee,
                transaction_type='deduct',
                notes=f"Late fee deduction of ${late_fee} calculated on return."
            )

        return order, inspection

    @staticmethod
    def settle_order(order_id):
        order = RentalRepository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")

        # Refunding the security deposit (minus late fees)
        remaining_deposit = order.deposit_paid - order.late_fee_charged
        refund_amount = max(Decimal('0.00'), remaining_deposit)

        order.deposit_refunded = refund_amount
        order.save()

        if refund_amount > 0:
            DepositRepository.log_transaction(
                order=order,
                amount=refund_amount,
                transaction_type='refund',
                notes=f"Refunded remaining deposit of ${refund_amount} to customer."
            )

        sm = RentalStateMachine(order)
        sm.transition_to('settled')
        return order
