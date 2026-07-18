from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from finance.models import Payment, Invoice
from rentals.repositories import DepositRepository


class FinanceService:
    @staticmethod
    @transaction.atomic
    def record_payment(*, order, amount, payment_type, provider='manual', provider_reference=''):
        payment = Payment.objects.create(rental_order=order, amount=Decimal(str(amount)), payment_type=payment_type, provider=provider, provider_reference=provider_reference, status='paid', settled_at=timezone.now())
        if payment_type == 'deposit':
            order.deposit_paid += payment.amount
            DepositRepository.log_transaction(order, payment.amount, 'collect', f'Payment {payment.reference}')
        elif payment_type == 'rental':
            order.amount_paid += payment.amount
        order.save(update_fields=['amount_paid', 'deposit_paid', 'updated_at'])
        return payment

    @staticmethod
    def create_invoice(order):
        number = f'RH-{order.id:06d}-{Invoice.objects.filter(rental_order=order).count() + 1}'
        return Invoice.objects.create(rental_order=order, number=number, subtotal=order.total_rent_amount, total=order.total_rent_amount)
