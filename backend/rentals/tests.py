from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta

from inventory.models import Product, ProductVariant
from rentals.models import RentalOrder, RentalItem
from rentals.state_machine import RentalStateMachine, TransitionError
from rentals.strategies import LateFeeCalculator
from rentals.services import RentalService

User = get_user_model()

class RentalWorkflowTests(TestCase):
    def setUp(self):
        # Create users
        self.admin = User.objects.create_user(username='admin', password='password', role='admin')
        self.client = User.objects.create_user(username='client', password='password', role='client')

        # Create products
        self.excavator = Product.objects.create(
            name='Excavator XL',
            sku='EXC-XL',
            base_price=Decimal('100.00'),
            security_deposit_type='fixed',
            security_deposit_value=Decimal('500.00'),
            stock_qty=2,
            available_qty=2,
            late_fee_type='daily',
            late_fee_rate=Decimal('50.00'),
            grace_period_hours=2
        )

        self.generator = Product.objects.create(
            name='Generator 10k',
            sku='GEN-10K',
            base_price=Decimal('20.00'),
            security_deposit_type='percentage',
            security_deposit_value=Decimal('10.00'), # 10%
            stock_qty=5,
            available_qty=5,
            late_fee_type='hourly',
            late_fee_rate=Decimal('5.00'),
            grace_period_hours=1
        )

    def test_state_machine_transitions(self):
        # 1. Create order
        now = timezone.now()
        order = RentalService.create_rental_order(
            client=self.client,
            start_date=now + timedelta(days=1),
            end_date=now + timedelta(days=2),
            fulfillment_type='store_pickup',
            shipping_address='',
            items_data=[
                {'product': self.excavator, 'quantity': 1, 'variants': {}}
            ]
        )
        self.assertEqual(order.status, 'draft')
        self.assertEqual(order.total_rent_amount, Decimal('100.00'))
        self.assertEqual(order.total_deposit_amount, Decimal('500.00'))

        # Excavator stock before confirm should still be 2
        self.excavator.refresh_from_db()
        self.assertEqual(self.excavator.available_qty, 2)

        # 2. Try invalid direct transition (Draft -> Picked Up)
        sm = RentalStateMachine(order)
        with self.assertRaises(TransitionError):
            sm.transition_to('picked_up')

        # 3. Valid transition: Confirm
        RentalService.confirm_order(order.id)
        order.refresh_from_db()
        self.assertEqual(order.status, 'confirmed')

        # Excavator stock should decrease by 1
        self.excavator.refresh_from_db()
        self.assertEqual(self.excavator.available_qty, 1)

        # 4. Valid transition: Pick Up
        RentalService.pickup_order(order.id)
        order.refresh_from_db()
        self.assertEqual(order.status, 'picked_up')

        # 5. Return order with inspection
        order, inspection = RentalService.return_order(
            order_id=order.id,
            inspector=self.admin,
            condition_rating='good'
        )
        order.refresh_from_db()
        self.assertEqual(order.status, 'returned')
        self.assertIsNotNone(order.actual_return_date)

        # Excavator stock should be restored to 2
        self.excavator.refresh_from_db()
        self.assertEqual(self.excavator.available_qty, 2)

        # 6. Settle deposit
        order.deposit_paid = Decimal('500.00')
        order.save()
        RentalService.settle_order(order.id)
        order.refresh_from_db()
        self.assertEqual(order.status, 'settled')
        self.assertEqual(order.deposit_refunded, Decimal('500.00'))

    def test_late_fee_strategies(self):
        now = timezone.now()
        # Create an order scheduled to end 12 hours ago
        order = RentalService.create_rental_order(
            client=self.client,
            start_date=now - timedelta(days=2),
            end_date=now - timedelta(hours=12),
            fulfillment_type='store_pickup',
            shipping_address='',
            items_data=[
                {'product': self.excavator, 'quantity': 1, 'variants': {}}, # Daily strategy, $50 penalty, grace 2h
                {'product': self.generator, 'quantity': 1, 'variants': {}}  # Hourly strategy, $5 penalty, grace 1h
            ]
        )
        RentalService.confirm_order(order.id)
        RentalService.pickup_order(order.id)
        
        # Calculate late fee if returned now (12 hours overdue)
        # Excavator (Daily): 12 hours late exceeds 2h grace. Charged 1 day = $50.00
        # Generator (Hourly): 12 hours late exceeds 1h grace. Charged 12 hours * $5 = $60.00, 
        #   BUT capped at generator's security deposit: 10% of base price ($20) = $2.00 deposit.
        #   So Generator fee is capped at $2.00.
        # Total late fee: $50.00 + $2.00 = $52.00.
        
        calculated_excavator_fee = LateFeeCalculator.calculate_item_fee(order.items.all()[0], now)
        calculated_generator_fee = LateFeeCalculator.calculate_item_fee(order.items.all()[1], now)
        
        self.assertEqual(calculated_excavator_fee, Decimal('50.00'))
        self.assertEqual(calculated_generator_fee, Decimal('2.00'))

        total_fee = LateFeeCalculator.calculate_order_fees(order, now)
        self.assertEqual(total_fee, Decimal('52.00'))

    def test_grace_period_no_fee(self):
        now = timezone.now()
        # Create an order scheduled to end 1.5 hours ago (Excavator has 2 hours grace period)
        order = RentalService.create_rental_order(
            client=self.client,
            start_date=now - timedelta(days=1),
            end_date=now - timedelta(hours=1.5),
            fulfillment_type='store_pickup',
            shipping_address='',
            items_data=[
                {'product': self.excavator, 'quantity': 1, 'variants': {}}
            ]
        )
        RentalService.confirm_order(order.id)
        RentalService.pickup_order(order.id)
        
        calculated_fee = LateFeeCalculator.calculate_item_fee(order.items.all()[0], now)
        # Overdue hours (1.5) <= Grace hours (2.0) -> Late fee is 0.00
        self.assertEqual(calculated_fee, Decimal('0.00'))

    def test_stock_depletion_validation(self):
        now = timezone.now()
        # Excavator has stock = 2. Create order booking 2 excavators.
        order1 = RentalService.create_rental_order(
            client=self.client,
            start_date=now + timedelta(days=1),
            end_date=now + timedelta(days=2),
            fulfillment_type='store_pickup',
            shipping_address='',
            items_data=[
                {'product': self.excavator, 'quantity': 2, 'variants': {}}
            ]
        )
        # Create order2 booking 1 excavator
        order2 = RentalService.create_rental_order(
            client=self.client,
            start_date=now + timedelta(days=1),
            end_date=now + timedelta(days=2),
            fulfillment_type='store_pickup',
            shipping_address='',
            items_data=[
                {'product': self.excavator, 'quantity': 1, 'variants': {}}
            ]
        )

        # Confirm order1 (deducts 2 stock) -> succeeds
        RentalService.confirm_order(order1.id)
        self.excavator.refresh_from_db()
        self.assertEqual(self.excavator.available_qty, 0)

        # Confirm order2 (needs 1 stock) -> should fail due to stock depletion
        with self.assertRaises(ValueError):
            RentalService.confirm_order(order2.id)
