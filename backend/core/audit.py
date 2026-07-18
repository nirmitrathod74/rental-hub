from core.models import AuditLog


class AuditService:
    """Single write gateway for audit records; failures must not block operations."""
    @staticmethod
    def record(*, action, entity, actor=None, metadata=None, request=None):
        ip_address = None
        if request:
            forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
            ip_address = forwarded.split(',')[0].strip() or request.META.get('REMOTE_ADDR')
        return AuditLog.objects.create(
            actor=actor if getattr(actor, 'is_authenticated', False) else None,
            action=action,
            entity_type=entity._meta.label_lower,
            entity_id=str(entity.pk),
            metadata=metadata or {},
            ip_address=ip_address,
        )
