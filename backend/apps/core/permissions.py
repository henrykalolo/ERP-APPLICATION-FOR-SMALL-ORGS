from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

class IsTenantMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request, 'tenant') and request.tenant is not None

class IsTenantAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            hasattr(request, 'tenant') and
            request.tenant is not None and
            request.user.is_authenticated and
            getattr(request.user, 'is_tenant_admin', False)
        )

class DjangoModelPermissions(permissions.DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': ['%(app_label)s.view_%(model_name)s'],
        'HEAD': ['%(app_label)s.view_%(model_name)s'],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }