from django.http import JsonResponse
from rest_framework.exceptions import PermissionDenied

class TenantContextMixin:
    def dispatch(self, request, *args, **kwargs):
        if not hasattr(request, 'tenant') or request.tenant is None:
            if hasattr(request, 'user') and request.user.is_authenticated:
                return JsonResponse(
                    {'error': 'Tenant context required', 'code': 'tenant_required'},
                    status=400
                )
            raise PermissionDenied('Authentication required')
        return super().dispatch(request, *args, **kwargs)