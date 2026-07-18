from django.core.cache import cache
from rentals.repositories import RentalRepository


class DashboardService:
    CACHE_KEY = 'dashboard:admin:v1'
    CACHE_TTL_SECONDS = 300

    @classmethod
    def metrics(cls):
        cached = cache.get(cls.CACHE_KEY)
        if cached is not None:
            return cached
        metrics = {
            'active_rentals': RentalRepository.get_active_rentals().count(),
            'overdue_rentals': RentalRepository.get_overdue_rentals().count(),
            'rentals_due_today': RentalRepository.get_rentals_due_today().count(),
            'upcoming_pickups': RentalRepository.get_upcoming_pickups().count(),
            'upcoming_returns': RentalRepository.get_upcoming_returns().count(),
            'revenue': RentalRepository.get_revenue_sum(),
            'security_deposits_held': RentalRepository.get_deposits_held_sum(),
            'late_fee_collection': RentalRepository.get_late_fees_collected_sum(),
        }
        cache.set(cls.CACHE_KEY, metrics, cls.CACHE_TTL_SECONDS)
        return metrics

    @classmethod
    def invalidate(cls):
        cache.delete(cls.CACHE_KEY)
