from celery import shared_task
from django.utils import timezone
from rentals.models import RentalOrder
from rentals.state_machine import RentalStateMachine, TransitionError
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_overdue_rentals():
    now = timezone.now()
    # Find all rentals currently marked as picked_up that have expired
    overdue_orders = RentalOrder.objects.filter(
        status='picked_up',
        end_date__lt=now
    )
    
    count = 0
    for order in overdue_orders:
        try:
            sm = RentalStateMachine(order)
            sm.transition_to('overdue')
            count += 1
        except TransitionError as e:
            logger.error(f"Failed to mark order #{order.id} as overdue: {e}")
            
    logger.info(f"Overdue check job completed. Marked {count} orders as overdue.")
    return f"Marked {count} orders overdue."
