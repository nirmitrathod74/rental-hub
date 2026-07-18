import os
import django
from decimal import Decimal
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rentalhub.settings')
django.setup()

from django.contrib.auth import get_user_model
from inventory.models import Product, ProductVariant, PriceList, PriceListItem, RentalPeriod, Category
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
        RentalPeriod.objects.get_or_create(name=name, defaults={'duration': days, 'unit': 'Days'})
    print("Seeded rental periods.")

    # 3. Categories and Products
    cat_heavy, _ = Category.objects.get_or_create(name='Heavy Machinery')
    cat_power, _ = Category.objects.get_or_create(name='Power Equipment')
    cat_access, _ = Category.objects.get_or_create(name='Access Equipment')
    cat_tools, _ = Category.objects.get_or_create(name='Power Tools')

    products_data = [
        ('EXC-001', 'Heavy Duty Excavator', 'Industrial excavator for massive building construction and excavation works.', Decimal('250.00'), 5, cat_heavy, 'Yellow', '#f3752e'),
        ('GEN-50K', '50kW Silent Diesel Generator', 'Super silent diesel backup power generator with output of 50 kilowatts.', Decimal('120.00'), 10, cat_power, 'Cummins', '#0b4e54'),
        ('SCA-05', 'Aluminium Scaffolding Set', 'Mobile tower aluminium scaffolding for painters, plasterers, and electricians.', Decimal('45.00'), 20, cat_access, 'Height 5m', '#8c7df7'),
        ('BLD-01', 'Bulldozer D8', 'Heavy bulldozer for earthmoving and grading.', Decimal('300.00'), 2, cat_heavy, 'Caterpillar', '#f3752e'),
        ('LOD-02', 'Wheel Loader', 'Front-end wheel loader with high capacity bucket.', Decimal('210.00'), 4, cat_heavy, 'Volvo', '#0b4e54'),
        ('GEN-10K', '10kW Portable Generator', 'Compact gasoline generator for small sites.', Decimal('40.00'), 15, cat_power, 'Honda', '#6c431b'),
        ('SCA-10', 'High Reach Scaffolding 10m', 'Double height mobile tower scaffolding.', Decimal('85.00'), 12, cat_access, 'Height 10m', '#8c7df7'),
        ('BOM-45', '45ft Articulating Boom Lift', 'Aerial work platform for high reach access.', Decimal('180.00'), 6, cat_access, 'Genie', '#f3752e'),
        ('DRL-01', 'Heavy Duty Jackhammer', 'Pneumatic demolition hammer for concrete breaking.', Decimal('35.00'), 25, cat_tools, 'Bosch', '#0b4e54'),
        ('SAW-01', 'Concrete Saw', 'Gas powered walk-behind concrete saw.', Decimal('65.00'), 8, cat_tools, 'Husqvarna', '#f3752e'),
        ('WLD-01', 'Industrial Welder 300A', 'Multi-process welding machine for structural steel.', Decimal('75.00'), 10, cat_tools, 'Lincoln Electric', '#8c7df7'),
        ('CMP-01', 'Plate Compactor', 'Heavy duty vibratory plate compactor for soil.', Decimal('55.00'), 14, cat_heavy, 'Wacker Neuson', '#6c431b'),
    ]

    for sku, name, desc, price, qty, cat, var_val, color_code in products_data:
        p, _ = Product.objects.get_or_create(
            sku=sku,
            defaults={
                'name': name,
                'description': desc,
                'base_price': price,
                'stock_qty': qty,
                'category': cat
            }
        )
        ProductVariant.objects.get_or_create(product=p, attribute_name='Feature', attribute_value=var_val)
        if color_code:
            ProductVariant.objects.get_or_create(product=p, attribute_name='Color', attribute_value=color_code)

    p1 = Product.objects.get(sku='EXC-001')
    p2 = Product.objects.get(sku='GEN-50K')
    p3 = Product.objects.get(sku='SCA-05')
    print("Seeded rental products, categories, and variants.")

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
    from rentals.models import RentalOrder, RentalItem, RentalInspection
    from finance.models import Payment, SecurityDeposit
    from django.utils import timezone
    from datetime import timedelta

    now = timezone.now()

    if not RentalOrder.objects.filter(status='draft').exists():
        o1 = RentalOrder.objects.create(
            client=client_user,
            status='draft',
            start_date=now + timedelta(days=2),
            end_date=now + timedelta(days=5),
            fulfillment_type='store_pickup'
        )
        RentalItem.objects.create(
            rental_order=o1,
            product=p1,
            quantity=3,
            unit_price=Decimal('250.00'),
            deposit_amount=Decimal('1000.00')
        )
        print("Seeded draft quotation order.")

    if not RentalOrder.objects.filter(status='confirmed').exists():
        o2 = RentalOrder.objects.create(
            client=client_user,
            status='confirmed',
            start_date=now + timedelta(days=1),
            end_date=now + timedelta(days=3),
            fulfillment_type='delivery',
            shipping_address='789 Construction Ave, Industrial Zone'
        )
        RentalItem.objects.create(
            rental_order=o2,
            product=p2,
            quantity=2,
            unit_price=Decimal('120.00'),
            deposit_amount=Decimal('18.00')
        )
        Payment.objects.create(rental_order=o2, payment_type='deposit', amount=Decimal('36.00'), status='paid')
        SecurityDeposit.objects.create(order=o2, amount=Decimal('36.00'), status='Held')
        print("Seeded confirmed order.")

    if not RentalOrder.objects.filter(status='picked_up').exists():
        o3 = RentalOrder.objects.create(
            client=client_user,
            status='picked_up',
            start_date=now - timedelta(days=1),
            end_date=now + timedelta(days=2),
            fulfillment_type='store_pickup'
        )
        RentalItem.objects.create(
            rental_order=o3,
            product=p3,
            quantity=5,
            unit_price=Decimal('45.00'),
            deposit_amount=Decimal('150.00')
        )
        Payment.objects.create(rental_order=o3, payment_type='deposit', amount=Decimal('750.00'), status='paid')
        SecurityDeposit.objects.create(order=o3, amount=Decimal('750.00'), status='Held')
        print("Seeded active picked up order.")

    if not RentalOrder.objects.filter(status='overdue').exists():
        o4 = RentalOrder.objects.create(
            client=client_user,
            status='overdue',
            start_date=now - timedelta(days=5),
            end_date=now - timedelta(days=2),
            fulfillment_type='store_pickup'
        )
        RentalItem.objects.create(
            rental_order=o4,
            product=p3,
            quantity=2,
            unit_price=Decimal('45.00'),
            deposit_amount=Decimal('150.00')
        )
        Payment.objects.create(rental_order=o4, payment_type='deposit', amount=Decimal('300.00'), status='paid')
        SecurityDeposit.objects.create(order=o4, amount=Decimal('300.00'), status='Held')
        Payment.objects.create(rental_order=o4, payment_type='late_fee', amount=Decimal('200.00'), status='paid')
        print("Seeded overdue order.")

    if not RentalOrder.objects.filter(status='settled').exists():
        o5 = RentalOrder.objects.create(
            client=client_user,
            status='settled',
            start_date=now - timedelta(days=10),
            end_date=now - timedelta(days=5),
            actual_return_date=now - timedelta(days=5),
            fulfillment_type='delivery',
            shipping_address='101 Skyline Towers Road'
        )
        RentalItem.objects.create(
            rental_order=o5,
            product=p1,
            quantity=5,
            unit_price=Decimal('250.00'),
            deposit_amount=Decimal('1000.00')
        )
        Payment.objects.create(rental_order=o5, payment_type='deposit', amount=Decimal('5000.00'), status='paid')
        SecurityDeposit.objects.create(order=o5, amount=Decimal('5000.00'), status='Refunded')
        RentalInspection.objects.create(
            rental_order=o5,
            inspector=admin_user,
            condition_rating='good'
        )
        print("Seeded settled order.")

    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed()
