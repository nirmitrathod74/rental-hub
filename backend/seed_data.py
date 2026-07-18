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
    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed()
