from abc import ABC, abstractmethod
from decimal import Decimal
import math
from datetime import timedelta

class LateFeeStrategy(ABC):
    @abstractmethod
    def calculate(self, overdue_delta: timedelta, rate: Decimal, grace_hours: int) -> Decimal:
        pass

class HourlyLateFeeStrategy(LateFeeStrategy):
    def calculate(self, overdue_delta: timedelta, rate: Decimal, grace_hours: int) -> Decimal:
        total_seconds = overdue_delta.total_seconds()
        if total_seconds <= 0:
            return Decimal('0.00')
            
        overdue_hours = total_seconds / 3600.0
        if overdue_hours <= grace_hours:
            return Decimal('0.00')
            
        # Round up hours for fractional usage
        chargeable_hours = math.ceil(overdue_hours)
        return Decimal(str(chargeable_hours)) * rate

class DailyLateFeeStrategy(LateFeeStrategy):
    def calculate(self, overdue_delta: timedelta, rate: Decimal, grace_hours: int) -> Decimal:
        total_seconds = overdue_delta.total_seconds()
        if total_seconds <= 0:
            return Decimal('0.00')
            
        overdue_hours = total_seconds / 3600.0
        if overdue_hours <= grace_hours:
            return Decimal('0.00')
            
        overdue_days = total_seconds / 86400.0
        # Round up days
        chargeable_days = math.ceil(overdue_days)
        return Decimal(str(chargeable_days)) * rate

class WeeklyLateFeeStrategy(LateFeeStrategy):
    def calculate(self, overdue_delta: timedelta, rate: Decimal, grace_hours: int) -> Decimal:
        total_seconds = overdue_delta.total_seconds()
        if total_seconds <= 0:
            return Decimal('0.00')
            
        overdue_hours = total_seconds / 3600.0
        if overdue_hours <= grace_hours:
            return Decimal('0.00')
            
        overdue_weeks = total_seconds / (86400.0 * 7)
        chargeable_weeks = math.ceil(overdue_weeks)
        return Decimal(str(chargeable_weeks)) * rate

class MonthlyLateFeeStrategy(LateFeeStrategy):
    def calculate(self, overdue_delta: timedelta, rate: Decimal, grace_hours: int) -> Decimal:
        total_seconds = overdue_delta.total_seconds()
        if total_seconds <= 0:
            return Decimal('0.00')
            
        overdue_hours = total_seconds / 3600.0
        if overdue_hours <= grace_hours:
            return Decimal('0.00')
            
        overdue_months = total_seconds / (86400.0 * 30) # standard approximation
        chargeable_months = math.ceil(overdue_months)
        return Decimal(str(chargeable_months)) * rate


class LateFeeCalculator:
    _STRATEGIES = {
        'hourly': HourlyLateFeeStrategy(),
        'daily': DailyLateFeeStrategy(),
        'weekly': WeeklyLateFeeStrategy(),
        'monthly': MonthlyLateFeeStrategy(),
    }

    @classmethod
    def calculate_item_fee(cls, item, return_time):
        order = item.rental_order
        if return_time <= order.end_date:
            return Decimal('0.00')

        overdue_delta = return_time - order.end_date
        strategy = cls._STRATEGIES.get(item.product.late_fee_type, DailyLateFeeStrategy())
        
        raw_fee = strategy.calculate(
            overdue_delta=overdue_delta,
            rate=item.product.late_fee_rate,
            grace_hours=item.product.grace_period_hours
        )
        
        # Max late fee limit: cap it at the item's total security deposit value
        max_fee = item.deposit_amount * Decimal(str(item.quantity))
        return min(raw_fee, max_fee)

    @classmethod
    def calculate_order_fees(cls, order, return_time):
        total_fee = Decimal('0.00')
        for item in order.items.all():
            total_fee += cls.calculate_item_fee(item, return_time)
        return total_fee
