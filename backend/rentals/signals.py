from django.db.models.signals import post_save
from django.dispatch import receiver
from rentals.models import RentalOrder, RentalInspection, DepositHistory
from inventory.repositories import ProductRepository
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=RentalOrder)
def handle_order_status_change(sender, instance, created, **kwargs):
    # This signal implements the Observer Pattern
    # It monitors order changes and handles peripheral events
    if created:
        logger.info(f"RentalOrder #{instance.id} created in state: {instance.status}")
        return

    # Trigger custom events based on status
    if instance.status == 'overdue':
        # E.g. enqueue asynchronous customer reminders or warnings
        logger.warning(f"ALERT: RentalOrder #{instance.id} is OVERDUE! Customer: {instance.client.username}")
        # In production, we'd trigger a Celery task to send email/SMS:
        # send_overdue_alert_email.delay(instance.id)

    elif instance.status == 'settled':
        logger.info(f"RentalOrder #{instance.id} settled and closed.")


@receiver(post_save, sender=RentalInspection)
def handle_inspection_results(sender, instance, created, **kwargs):
    # Observer pattern: respond to inspection flags
    if created:
        order = instance.rental_order
        logger.info(f"Inspection logged for order #{order.id} by {instance.inspector.username}")
        
        # If product condition needs repair, trigger damage actions
        if instance.condition_rating in ['damaged', 'needs_repair']:
            instance.repair_initiated = True
            instance.save(update_fields=['repair_initiated'])
            logger.warning(f"Repair workflow automatically initiated for order #{order.id} items due to damage.")
            # Trigger stock reduction if product is completely unusable, or adjust available quantities:
            for item in order.items.all():
                # For this prototype, lock stock in maintenance
                logger.info(f"Locking product {item.product.name} items in repair cycle.")
