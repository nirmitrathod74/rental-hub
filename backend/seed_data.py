import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rentalhub.settings')
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Product, ProductVariant, PriceList, PriceListItem, RentalPeriod
from rentals.models import QuotationTemplate
from decimal import Decimal

User = get_user_model()

def seed():
    print("Seeding database...")
    
    # 1. Users
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@rentalhub.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("Created admin user: admin/admin123")
    else:
        print("Admin user already exists")

    client_user, created = User.objects.get_or_create(
        username='client',
        defaults={
            'email': 'client@gmail.com',
            'role': 'client',
            'address': '123 Portal Lane, Cityville',
            'phone_number': '+15550199'
        }
    )
    if created:
        client_user.set_password('client123')
        client_user.save()
        print("Created client user: client/client123")
    else:
        print("Client user already exists")

    # 2. Rental Periods
    periods = [
        ('Daily Rental', 1),
        ('Weekly Rental', 7),
        ('Monthly Rental', 30)
    ]
    for name, days in periods:
        RentalPeriod.objects.get_or_create(name=name, defaults={'duration_days': days})
    print("Seeded rental periods.")

    # 3. Products
    p1, _ = Product.objects.get_or_create(
        sku='EXC-001',
        defaults={
            'name': 'Heavy Duty Excavator',
            'description': 'Industrial excavator for massive building construction and excavation works.',
            'base_price': Decimal('250.00'),
            'security_deposit_type': 'fixed',
            'security_deposit_value': Decimal('1000.00'),
            'stock_qty': 5,
            'available_qty': 5,
            'late_fee_type': 'daily',
            'late_fee_rate': Decimal('75.00'),
            'grace_period_hours': 2
        }
    )
    ProductVariant.objects.get_or_create(product=p1, attribute_name='Manufacturer', attribute_value='Caterpillar')
    ProductVariant.objects.get_or_create(product=p1, attribute_name='Color', attribute_value='Yellow')

    p2, _ = Product.objects.get_or_create(
        sku='GEN-50K',
        defaults={
            'name': '50kW Silent Diesel Generator',
            'description': 'Super silent diesel backup power generator with output of 50 kilowatts.',
            'base_price': Decimal('120.00'),
            'security_deposit_type': 'percentage',
            'security_deposit_value': Decimal('15.00'), # 15% of rental price
            'stock_qty': 10,
            'available_qty': 10,
            'late_fee_type': 'hourly',
            'late_fee_rate': Decimal('10.00'),
            'grace_period_hours': 1
        }
    )
    ProductVariant.objects.get_or_create(product=p2, attribute_name='Brand', attribute_value='Cummins')

    p3, _ = Product.objects.get_or_create(
        sku='SCA-05',
        defaults={
            'name': 'Aluminium Scaffolding Set',
            'description': 'Mobile tower aluminium scaffolding for painters, plasterers, and electricians.',
            'base_price': Decimal('45.00'),
            'security_deposit_type': 'fixed',
            'security_deposit_value': Decimal('150.00'),
            'stock_qty': 20,
            'available_qty': 20,
            'late_fee_type': 'weekly',
            'late_fee_rate': Decimal('100.00'),
            'grace_period_hours': 6
        }
    )
    ProductVariant.objects.get_or_create(product=p3, attribute_name='Size', attribute_value='Height 5 Meters')
    print("Seeded rental products and variants.")

    # 4. Pricelist
    pl, _ = PriceList.objects.get_or_create(
        name='Weekend Promo Price List',
        defaults={'is_default': False}
    )
    PriceListItem.objects.get_or_create(
        pricelist=pl,
        product=p1,
        defaults={'custom_price': Decimal('220.00')}
    )
    PriceListItem.objects.get_or_create(
        pricelist=pl,
        product=p2,
        defaults={'custom_price': Decimal('100.00')}
    )
    print("Seeded promo pricelist discounts.")

    # 5. Quotation Template
    QuotationTemplate.objects.get_or_create(
        name='Standard Quotation Layout',
        defaults={
            'header_text': '<h1>RENTALHUB GLOBAL CORP</h1><p>Equipments & Logistics Solutions</p>',
            'footer_text': '<p>This quotation is valid for 14 days. Terms of service apply.</p>'
        }
    )
    print("Seeded quotation templates.")

    # 6. Mock Orders for Dashboard metrics visibility
    from rentals.models import RentalOrder, RentalItem, DepositHistory, RentalInspection
    from django.utils import timezone
    from datetime import timedelta

    now = timezone.now()

    # Draft / Quotation Order (excavator)
    if not RentalOrder.objects.filter(status='draft').exists():
        o1 = RentalOrder.objects.create(
            client=client_user,
            status='draft',
            start_date=now + timedelta(days=2),
            end_date=now + timedelta(days=5),
            fulfillment_type='store_pickup',
            total_rent_amount=Decimal('750.00'),
            total_deposit_amount=Decimal('3000.00')
        )
        RentalItem.objects.create(
            rental_order=o1,
            product=p1,
            quantity=3,
            unit_price=Decimal('250.00'),
            deposit_amount=Decimal('1000.00')
        )
        print("Seeded draft quotation order.")

    # Confirmed Order (generator)
    if not RentalOrder.objects.filter(status='confirmed').exists():
        o2 = RentalOrder.objects.create(
            client=client_user,
            status='confirmed',
            start_date=now + timedelta(days=1),
            end_date=now + timedelta(days=3),
            fulfillment_type='delivery',
            shipping_address='789 Construction Ave, Industrial Zone',
            total_rent_amount=Decimal('240.00'),
            total_deposit_amount=Decimal('36.00'),
            amount_paid=Decimal('240.00'),
            deposit_paid=Decimal('36.00')
        )
        RentalItem.objects.create(
            rental_order=o2,
            product=p2,
            quantity=2,
            unit_price=Decimal('120.00'),
            deposit_amount=Decimal('18.00')
        )
        DepositHistory.objects.create(
            rental_order=o2,
            amount=Decimal('36.00'),
            transaction_type='collect',
            notes="Initial deposit collected."
        )
        # Update stock manually for seeding
        p2.available_qty -= 2
        p2.save()
        print("Seeded confirmed order.")

    # Active Picked Up Order (scaffolding)
    if not RentalOrder.objects.filter(status='picked_up').exists():
        o3 = RentalOrder.objects.create(
            client=client_user,
            status='picked_up',
            start_date=now - timedelta(days=1),
            end_date=now + timedelta(days=2),
            fulfillment_type='store_pickup',
            total_rent_amount=Decimal('225.00'),
            total_deposit_amount=Decimal('750.00'),
            amount_paid=Decimal('225.00'),
            deposit_paid=Decimal('750.00')
        )
        RentalItem.objects.create(
            rental_order=o3,
            product=p3,
            quantity=5,
            unit_price=Decimal('45.00'),
            deposit_amount=Decimal('150.00')
        )
        DepositHistory.objects.create(
            rental_order=o3,
            amount=Decimal('750.00'),
            transaction_type='collect',
            notes="Initial deposit collected."
        )
        p3.available_qty -= 5
        p3.save()
        print("Seeded active picked up order.")

    # Overdue Order (scaffolding)
    if not RentalOrder.objects.filter(status='overdue').exists():
        o4 = RentalOrder.objects.create(
            client=client_user,
            status='overdue',
            start_date=now - timedelta(days=5),
            end_date=now - timedelta(days=2),
            fulfillment_type='store_pickup',
            total_rent_amount=Decimal('90.00'),
            total_deposit_amount=Decimal('300.00'),
            amount_paid=Decimal('90.00'),
            deposit_paid=Decimal('300.00'),
            late_fee_charged=Decimal('200.00')
        )
        RentalItem.objects.create(
            rental_order=o4,
            product=p3,
            quantity=2,
            unit_price=Decimal('45.00'),
            deposit_amount=Decimal('150.00')
        )
        DepositHistory.objects.create(
            rental_order=o4,
            amount=Decimal('300.00'),
            transaction_type='collect',
            notes="Initial deposit collected."
        )
        DepositHistory.objects.create(
            rental_order=o4,
            amount=Decimal('200.00'),
            transaction_type='deduct',
            notes="Late fee deduction calculated."
        )
        p3.available_qty -= 2
        p3.save()
        print("Seeded overdue order.")

    # Settled Order (excavator)
    if not RentalOrder.objects.filter(status='settled').exists():
        o5 = RentalOrder.objects.create(
            client=client_user,
            status='settled',
            start_date=now - timedelta(days=10),
            end_date=now - timedelta(days=5),
            actual_return_date=now - timedelta(days=5),
            fulfillment_type='delivery',
            shipping_address='101 Skyline Towers Road',
            total_rent_amount=Decimal('1250.00'),
            total_deposit_amount=Decimal('5000.00'),
            amount_paid=Decimal('1250.00'),
            deposit_paid=Decimal('5000.00'),
            deposit_refunded=Decimal('5000.00')
        )
        RentalItem.objects.create(
            rental_order=o5,
            product=p1,
            quantity=5,
            unit_price=Decimal('250.00'),
            deposit_amount=Decimal('1000.00')
        )
        DepositHistory.objects.create(
            rental_order=o5,
            amount=Decimal('5000.00'),
            transaction_type='collect',
            notes="Initial deposit collected."
        )
        RentalInspection.objects.create(
            rental_order=o5,
            inspector=admin_user,
            condition_rating='good'
        )
        DepositHistory.objects.create(
            rental_order=o5,
            amount=Decimal('5000.00'),
            transaction_type='refund',
            notes="Refunded full security deposit on-time return."
        )
        print("Seeded settled order.")

    print("Database seeding completed successfully.")


if __name__ == '__main__':
    seed()
