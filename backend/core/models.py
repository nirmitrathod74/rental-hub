from django.conf import settings
from django.db import models


class TimeStampedSoftDeleteModel(models.Model):
    """Base for operational entities that may be restored after deletion."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True, db_index=True)

    class Meta:
        abstract = True


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('create', 'Create'), ('update', 'Update'), ('delete', 'Delete'),
        ('login', 'Login'), ('logout', 'Logout'), ('transition', 'Transition'),
        ('payment', 'Payment'), ('pickup', 'Pickup'), ('return', 'Return'),
    )
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_events')
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=64)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ('-created_at',)
