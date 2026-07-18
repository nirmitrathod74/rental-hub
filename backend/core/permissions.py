from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    message = 'Administrator role required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_admin_role or getattr(obj, 'client_id', None) == request.user.id)
