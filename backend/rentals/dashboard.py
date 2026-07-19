from django.core.cache import cache
from django.db.models import Sum
from rentals.repositories import RentalRepository


class DashboardService:
    CACHE_KEY = 'dashboard:admin:v1'
    CACHE_TTL_SECONDS = 300

    @classmethod
    def metrics(cls):
        cached = cache.get(cls.CACHE_KEY)
        if cached is not None:
            return cached
        from inventory.models import Product
        from django.contrib.auth import get_user_model
        from django.utils import timezone

        User = get_user_model()
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Revenue logic
        revenue_today = RentalRepository.get_all().filter(status__in=['returned', 'settled'], created_at__gte=today_start).aggregate(Sum('invoices__total'))['invoices__total__sum'] or 0
        revenue_this_month = RentalRepository.get_all().filter(status__in=['returned', 'settled'], created_at__gte=month_start).aggregate(Sum('invoices__total'))['invoices__total__sum'] or 0

        # Products
        total_products = Product.objects.count()
        products_available = 0  # To be calculated via stock moves if needed

        metrics = {
            'active_rentals': RentalRepository.get_active_rentals().count(),
            'overdue_rentals': RentalRepository.get_overdue_rentals().count(),
            'rentals_due_today': RentalRepository.get_rentals_due_today().count(),
            'upcoming_pickups': RentalRepository.get_upcoming_pickups().count(),
            'upcoming_returns': RentalRepository.get_upcoming_returns().count(),
            'revenue': RentalRepository.get_revenue_sum(),
            'revenue_today': revenue_today,
            'revenue_this_month': revenue_this_month,
            'security_deposits_held': RentalRepository.get_deposits_held_sum(),
            'late_fee_collection': RentalRepository.get_late_fees_collected_sum(),
            'total_products': total_products,
            'products_available': products_available,
            'total_customers': User.objects.filter(role='client').count(),
            'pending_quotations': RentalRepository.get_all().filter(status='draft').count(),
        }
        cache.set(cls.CACHE_KEY, metrics, cls.CACHE_TTL_SECONDS)
        return metrics

    @classmethod
    def invalidate(cls):
        cache.delete(cls.CACHE_KEY)
