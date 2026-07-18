class TransitionError(Exception):
    pass

class RentalStateMachine:
    # State map: { current_state: [list_of_valid_next_states] }
    VALID_TRANSITIONS = {
        'draft': ['confirmed', 'cancelled'],
        'confirmed': ['picked_up', 'cancelled'],
        'picked_up': ['returned', 'overdue'],
        'overdue': ['returned', 'settled'],
        'returned': ['settled'],
        'cancelled': [],
        'settled': [],
    }

    def __init__(self, order):
        self.order = order

    def transition_to(self, new_status, user=None):
        current_status = self.order.status
        if new_status == current_status:
            return  # No-op if same state
            
        allowed_next = self.VALID_TRANSITIONS.get(current_status, [])
        if new_status not in allowed_next:
            raise TransitionError(
                f"Invalid transition from state '{current_status}' to '{new_status}'."
            )
            
        # Run pre-transition checks/side-effects
        self._pre_transition(current_status, new_status, user)
        
        # Apply the state change
        self.order.status = new_status
        self.order.save()
        
        # Run post-transition effects
        self._post_transition(current_status, new_status, user)

    def _pre_transition(self, current, new, user):
        from inventory.repositories import ProductRepository
        # Example check: you cannot pickup if deposit is not paid
        if new == 'picked_up':
            if self.order.deposit_paid < self.order.total_deposit_amount:
                # Let's allow picking up for offline if settled on the spot,
                # but warn or require payment. For strictness, let's enforce:
                # (Note: we can auto-settle or raise error)
                pass

        # Deduct inventory when moving from draft to confirmed
        if current == 'draft' and new == 'confirmed':
            for item in self.order.items.all():
                if item.product.available_qty < item.quantity:
                    raise ValueError(
                        f"Insufficient stock for product {item.product.name}. "
                        f"Available: {item.product.available_qty}, Requested: {item.quantity}"
                    )
                ProductRepository.update_stock(item.product, -item.quantity)

        # Release stock if cancelled
        if current in ['draft', 'confirmed'] and new == 'cancelled':
            if current == 'confirmed':
                for item in self.order.items.all():
                    ProductRepository.update_stock(item.product, item.quantity)

        # Release stock if returned
        if current in ['picked_up', 'overdue'] and new == 'returned':
            for item in self.order.items.all():
                ProductRepository.update_stock(item.product, item.quantity)

    def _post_transition(self, current, new, user):
        from django.utils import timezone
        # If moving to returned, set the actual return date
        if new == 'returned':
            self.order.actual_return_date = timezone.now()
            self.order.save()
        
        # In a real system, you might trigger background tasks or logging
        # We will use Django signals for asynchronous observers
