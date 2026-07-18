from django.utils import timezone
from notifications.models import Notification


class NotificationService:
    @staticmethod
    def queue(*, recipient, event, subject, body, channel='in_app', payload=None):
        return Notification.objects.create(recipient=recipient, event=event, subject=subject, body=body, channel=channel, payload=payload or {})

    @staticmethod
    def mark_sent(notification):
        notification.status = 'sent'
        notification.sent_at = timezone.now()
        notification.save(update_fields=['status', 'sent_at'])
        return notification
