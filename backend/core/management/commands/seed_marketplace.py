import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

# Models
from accounts.models import User, UserProfile, VendorProfile
from inventory.models import Category, Product, RentalPeriod, RentalPolicy
from rentals.models import RentalOrder, RentalItem, Review, RentalInspection
from finance.models import Payment, SecurityDeposit, PlatformSettings, PlatformRevenue

class Command(BaseCommand):
    help = 'Seeds the Multi-Vendor Rental Marketplace with highly consistent, relational mock data.'

    def handle(self, *args, **options):
        fake = Faker()
        Faker.seed(42)
        random.seed(42)

        self.stdout.write(self.style.WARNING('Starting Database Cleanup...'))
        
        # 1. Database Cleanup
        Payment.objects.all().delete()
        SecurityDeposit.objects.all().delete()
        PlatformRevenue.objects.all().delete()
        Review.objects.all().delete()
        RentalInspection.objects.all().delete()
        RentalItem.objects.all().delete()
        RentalOrder.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        RentalPeriod.objects.all().delete()
        RentalPolicy.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        
        # Optional: wipe superuser to recreate exact specified Admin, or leave if one exists
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser('admin', 'admin@rentalhub.com', 'admin123', role='admin')
            UserProfile.objects.create(user=admin, phone_number=fake.numerify('##########'), address=fake.address())
            self.stdout.write(self.style.SUCCESS('Created 1 Admin Superuser.'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin Superuser already exists. Skipping.'))

        # Create Users
        vendors = []
        for i in range(5):
            v = User.objects.create_user(username=fake.unique.user_name(), email=fake.unique.email(), password='password123', role='vendor')
            UserProfile.objects.create(user=v, phone_number=fake.numerify('##########'), address=fake.address())
            VendorProfile.objects.create(user=v, status='approved', business_name=fake.company(), product_category='General')
            vendors.append(v)
        self.stdout.write(self.style.SUCCESS('Created 5 Vendors.'))

        customers = []
        for i in range(10):
            c = User.objects.create_user(username=fake.unique.user_name(), email=fake.unique.email(), password='password123', role='customer')
            UserProfile.objects.create(user=c, phone_number=fake.numerify('##########'), address=fake.address())
            customers.append(c)
        self.stdout.write(self.style.SUCCESS('Created 10 Customers.'))

        # 2. System Configurations & Inventory
        settings = PlatformSettings.get_settings()
        settings.platform_commission_percentage = Decimal('15.00')
        settings.save()
        self.stdout.write(self.style.SUCCESS('Configured PlatformSettings (15.00% Commission).'))

        rp_daily = RentalPeriod.objects.create(name='Daily', duration=1, unit='Days')
        rp_weekly = RentalPeriod.objects.create(name='Weekly', duration=1, unit='Weeks')
        self.stdout.write(self.style.SUCCESS('Created RentalPeriods (Daily, Weekly).'))

        policy = RentalPolicy.objects.create(
            name='Standard Policy', 
            security_deposit_type='fixed', 
            security_deposit_value=Decimal('50.00'),
            late_fee_type='daily',
            late_fee_rate=Decimal('10.00')
        )

        categories = [
            Category.objects.create(name=cat, description=fake.catch_phrase()) 
            for cat in ['Photography', 'Heavy Tools', 'Camping', 'Party Supplies', 'Electronics', 'Sports', 'Vehicles']
        ]
        self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} Categories.'))

        products = []
        condition_choices = ['New', 'Like New', 'Good', 'Fair']
        for _ in range(30):
            status = 'Approved' if random.random() < 0.8 else 'Pending'
            p = Product.objects.create(
                vendor=random.choice(vendors),
                approval_status=status,
                condition=random.choice(condition_choices),
                pickup_address=fake.address(),
                category=random.choice(categories),
                rental_policy=policy,
                name=fake.word().capitalize() + ' ' + fake.word().capitalize(),
                sku=fake.unique.ean8(),
                description=fake.text(),
                base_price=Decimal(random.randint(10, 100)),
                stock_qty=random.randint(1, 5)
            )
            products.append(p)
        approved_products = [p for p in products if p.approval_status == 'Approved']
        self.stdout.write(self.style.SUCCESS(f'Created 30 Products (80% Approved, 20% Pending).'))

        # 3. Orders
        now = timezone.now()
        
        # Helper for creating order
        def create_order(status, start, end, actual_pickup=None, actual_return=None):
            client = random.choice(customers)
            order = RentalOrder.objects.create(
                client=client,
                status=status,
                start_date=start,
                end_date=end,
                actual_pickup=actual_pickup,
                actual_return_date=actual_return,
                fulfillment_type='store_pickup'
            )
            product = random.choice(approved_products)
            qty = 1
            rent_amount = product.base_price * Decimal((end - start).days)
            deposit_amount = policy.security_deposit_value
            
            RentalItem.objects.create(
                rental_order=order,
                product=product,
                quantity=qty,
                unit_price=product.base_price,
                deposit_amount=deposit_amount
            )
            
            return order, rent_amount, deposit_amount

        # 10 Pending (Future)
        for _ in range(10):
            start = now + timedelta(days=random.randint(1, 5))
            end = start + timedelta(days=random.randint(1, 5))
            create_order('confirmed', start, end)
        self.stdout.write(self.style.SUCCESS('Generated 10 Pending Orders.'))

        # 10 Active (Past pickup, future return)
        active_orders = []
        for _ in range(10):
            start = now - timedelta(days=random.randint(1, 3))
            end = now + timedelta(days=random.randint(1, 5))
            order, rent, dep = create_order('picked_up', start, end, actual_pickup=start)
            active_orders.append((order, rent, dep))
        self.stdout.write(self.style.SUCCESS('Generated 10 Active Orders.'))

        # 5 Overdue (Past return)
        overdue_orders = []
        for _ in range(5):
            start = now - timedelta(days=random.randint(5, 10))
            end = now - timedelta(days=random.randint(1, 4))
            order, rent, dep = create_order('overdue', start, end, actual_pickup=start)
            overdue_orders.append((order, rent, dep))
        self.stdout.write(self.style.SUCCESS('Generated 5 Overdue Orders.'))

        # 15 Completed (Past pickup and return)
        completed_orders = []
        for _ in range(15):
            start = now - timedelta(days=random.randint(10, 20))
            end = start + timedelta(days=random.randint(1, 5))
            actual_ret = end + timedelta(hours=random.randint(0, 5)) # returned on time
            order, rent, dep = create_order('returned', start, end, actual_pickup=start, actual_return=actual_ret)
            completed_orders.append((order, rent, dep))
        self.stdout.write(self.style.SUCCESS('Generated 15 Completed Orders.'))

        # 4. Financial Consistency & Reviews
        # Active
        for order, rent, dep in active_orders:
            SecurityDeposit.objects.create(order=order, amount=dep, status='Held')
        
        # Overdue
        for order, rent, dep in overdue_orders:
            SecurityDeposit.objects.create(order=order, amount=dep, status='Held')
            
        # Completed
        for order, rent, dep in completed_orders:
            # Security Deposit Refunded
            SecurityDeposit.objects.create(order=order, amount=dep, status='Refunded')
            
            # Payment
            Payment.objects.create(
                rental_order=order, 
                payment_type='rental', 
                amount=rent, 
                status='paid',
                provider='stripe'
            )
            
            # Platform Revenue & Payout (Created by signal on Payment)
            pr = PlatformRevenue.objects.get(order=order)
            pr.is_paid_out = True
            pr.save()

            # 5. Trust Ecosystem (Reviews)
            vendor = order.items.first().product.vendor
            
            # Customer -> Vendor
            Review.objects.create(
                rental_order=order,
                reviewer=order.client,
                reviewee=vendor,
                rating=random.randint(3, 5),
                comment=fake.sentence()
            )
            # Vendor -> Customer
            Review.objects.create(
                rental_order=order,
                reviewer=vendor,
                reviewee=order.client,
                rating=random.randint(3, 5),
                comment=fake.sentence()
            )
            
        self.stdout.write(self.style.SUCCESS('Generated Financials, Splits, and Reviews for all relevant orders.'))
        self.stdout.write(self.style.SUCCESS('Marketplace Seed Completed Successfully!'))
