from django.conf import settings
from django.db import models


class Notification(models.Model):
    CHANNELS = (('in_app', 'In app'), ('email', 'Email'), ('sms', 'SMS'), ('whatsapp', 'WhatsApp'))
    STATUS = (('queued', 'Queued'), ('sent', 'Sent'), ('failed', 'Failed'))
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    channel = models.CharField(max_length=16, choices=CHANNELS, default='in_app')
    event = models.CharField(max_length=64)
    subject = models.CharField(max_length=200)
    body = models.TextField()
    status = models.CharField(max_length=16, choices=STATUS, default='queued')
    payload = models.JSONField(default=dict, blank=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
