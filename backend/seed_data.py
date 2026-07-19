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
            'role': 'customer',
            'address': '123 Portal Lane, Cityville',
            'phone_number': '+15550199'
        }
    )
    if created:
        client_user.set_password('client123')
        client_user.save()
        print("Created client user: client/client123")
    else:
        # Data migration for existing 'client' roles
        if client_user.role == 'client':
            client_user.role = 'customer'
            client_user.save()
        print("Client user already exists")

    # Migrate any other users with role='client'
    User.objects.filter(role='client').update(role='customer')

    # 2. Rental Periods
    periods = [
        ('Daily Rental', 1),
        ('Weekly Rental', 7),
        ('Monthly Rental', 30)
    ]
    for name, days in periods:
        RentalPeriod.objects.get_or_create(name=name, defaults={'duration': days, 'unit': 'Days'})
    print("Seeded rental periods.")

    vendor_user, created = User.objects.get_or_create(
        username='vendor',
        defaults={
            'email': 'vendor@rentalhub.com',
            'role': 'vendor',
            'phone_number': '+15550299'
        }
    )
    if created:
        vendor_user.set_password('vendor123')
        vendor_user.save()
        print("Created vendor user: vendor/vendor123")
    else:
        print("Vendor user already exists")
    # 3. Categories and Products
    cat_heavy, _ = Category.objects.get_or_create(name='Heavy Machinery')
    cat_power, _ = Category.objects.get_or_create(name='Power Equipment')
    cat_access, _ = Category.objects.get_or_create(name='Access Equipment')
    cat_tools, _ = Category.objects.get_or_create(name='Power Tools')

    products_data = [
        ('EXC-001', 'Heavy Duty Excavator', 'Industrial excavator for massive building construction and excavation works.', Decimal('250.00'), 5, cat_heavy, 'Yellow', '#f3752e', 'Daily'),
        ('GEN-50K', '50kW Silent Diesel Generator', 'Super silent diesel backup power generator with output of 50 kilowatts.', Decimal('120.00'), 10, cat_power, 'Cummins', '#0b4e54', 'Weekly'),
        ('SCA-05', 'Aluminium Scaffolding Set', 'Mobile tower aluminium scaffolding for painters, plasterers, and electricians.', Decimal('45.00'), 20, cat_access, 'Height 5m', '#8c7df7', 'Monthly'),
        ('BLD-01', 'Bulldozer D8', 'Heavy bulldozer for earthmoving and grading.', Decimal('300.00'), 2, cat_heavy, 'Caterpillar', '#f3752e', 'Daily'),
        ('LOD-02', 'Wheel Loader', 'Front-end wheel loader with high capacity bucket.', Decimal('210.00'), 4, cat_heavy, 'Volvo', '#0b4e54', 'Daily'),
        ('GEN-10K', '10kW Portable Generator', 'Compact gasoline generator for small sites.', Decimal('40.00'), 15, cat_power, 'Honda', '#6c431b', 'Hourly'),
        ('SCA-10', 'High Reach Scaffolding 10m', 'Double height mobile tower scaffolding.', Decimal('85.00'), 12, cat_access, 'Height 10m', '#8c7df7', 'Monthly'),
        ('BOM-45', '45ft Articulating Boom Lift', 'Aerial work platform for high reach access.', Decimal('180.00'), 6, cat_access, 'Genie', '#f3752e', 'Weekly'),
        ('DRL-01', 'Heavy Duty Jackhammer', 'Pneumatic demolition hammer for concrete breaking.', Decimal('35.00'), 25, cat_tools, 'Bosch', '#0b4e54', 'Hourly'),
        ('SAW-01', 'Concrete Saw', 'Gas powered walk-behind concrete saw.', Decimal('65.00'), 8, cat_tools, 'Husqvarna', '#f3752e', 'Hourly'),
        ('WLD-01', 'Industrial Welder 300A', 'Multi-process welding machine for structural steel.', Decimal('75.00'), 10, cat_tools, 'Lincoln Electric', '#8c7df7', 'Weekly'),
        ('CMP-01', 'Plate Compactor', 'Heavy duty vibratory plate compactor for soil.', Decimal('55.00'), 14, cat_heavy, 'Wacker Neuson', '#6c431b', 'Daily'),
        ('CRN-100', '100 Ton Mobile Crane', 'Heavy lifting mobile crane for large scale construction.', Decimal('1500.00'), 1, cat_heavy, 'Liebherr', '#f3752e', 'Daily'),
        ('CRN-50', '50 Ton Mobile Crane', 'Medium lifting mobile crane.', Decimal('800.00'), 2, cat_heavy, 'Tadano', '#f3752e', 'Weekly'),
        ('FRK-03', '3 Ton Forklift', 'Diesel powered forklift for warehouse operations.', Decimal('90.00'), 8, cat_heavy, 'Toyota', '#0b4e54', 'Monthly'),
        ('FRK-05', '5 Ton Forklift', 'Heavy duty diesel forklift.', Decimal('140.00'), 5, cat_heavy, 'Hyster', '#0b4e54', 'Weekly'),
        ('LHT-01', 'Towable Light Tower', 'Diesel light tower for night time construction.', Decimal('60.00'), 15, cat_power, 'Wacker Neuson', '#f3752e', 'Weekly'),
        ('LHT-02', 'Portable LED Light', 'Battery powered high intensity LED light.', Decimal('15.00'), 30, cat_power, 'Milwaukee', '#6c431b', 'Hourly'),
        ('GEN-2K', '2kW Inverter Generator', 'Super quiet portable generator for events.', Decimal('25.00'), 20, cat_power, 'Honda', '#6c431b', 'Daily'),
        ('PMP-01', '3" Trash Pump', 'Centrifugal trash pump for dewatering.', Decimal('45.00'), 12, cat_power, 'Subaru', '#8c7df7', 'Weekly'),
        ('PMP-02', 'Submersible Water Pump', 'Electric submersible pump for clear water.', Decimal('20.00'), 18, cat_power, 'Tsurumi', '#8c7df7', 'Hourly'),
        ('SZR-19', '19ft Scissor Lift', 'Electric slab scissor lift for indoor maintenance.', Decimal('110.00'), 10, cat_access, 'JLG', '#f3752e', 'Weekly'),
        ('SZR-32', '32ft Rough Terrain Scissor Lift', 'Diesel scissor lift for outdoor construction.', Decimal('160.00'), 7, cat_access, 'Genie', '#f3752e', 'Monthly'),
        ('BOM-65', '65ft Telescopic Boom Lift', 'Straight boom lift for maximum reach.', Decimal('250.00'), 4, cat_access, 'JLG', '#0b4e54', 'Weekly'),
        ('DRL-02', 'Rotary Hammer Drill', 'SDS Max rotary hammer for drilling concrete.', Decimal('25.00'), 30, cat_tools, 'Makita', '#0b4e54', 'Hourly'),
        ('SAW-02', 'Tile Saw', 'Wet tile saw with stand for precise cutting.', Decimal('30.00'), 15, cat_tools, 'DeWalt', '#6c431b', 'Daily'),
        ('SND-01', 'Floor Sander', 'Drum floor sander for hardwood floor refinishing.', Decimal('50.00'), 8, cat_tools, 'Clarke', '#6c431b', 'Daily'),
        ('VAC-01', 'Industrial Wet/Dry Vac', 'High capacity vacuum for jobsite cleanup.', Decimal('35.00'), 20, cat_tools, 'Shop-Vac', '#8c7df7', 'Daily'),
    ]

    import os
    from django.conf import settings

    for sku, name, desc, price, qty, cat, var_val, color_code, duration in products_data:
        p, created = Product.objects.get_or_create(
            sku=sku,
            defaults={
                'name': name,
                'description': desc,
                'base_price': price,
                'stock_qty': qty,
                'category': cat,
                'vendor': vendor_user
            }
        )
        
        # Add images
        image_name = f"{sku.lower()}.png"
        image_path = os.path.join(settings.MEDIA_ROOT, 'products', image_name)
        if os.path.exists(image_path):
            p.image = f"products/{image_name}"
        else:
            # Fallback to a high-quality unsplash image instead of the red test_img
            fallback_img = "products/borna-bevanda-CsbWQx1rzJI-unsplash.jpg"
            p.image = fallback_img
        p.save()

        ProductVariant.objects.get_or_create(product=p, attribute_name='Feature', attribute_value=var_val)
        if color_code:
            ProductVariant.objects.get_or_create(product=p, attribute_name='Color', attribute_value=color_code)
        if duration:
            ProductVariant.objects.get_or_create(product=p, attribute_name='Duration', attribute_value=duration)

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
