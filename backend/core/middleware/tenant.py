from django_tenants.middleware import TenantMiddleware
from django_tenants.models import Tenant
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Get tenant identifier from subdomain or URL path
        subdomain = request.get_host().split('.')[0] if '.' in request.get_host() else None
        path_tenant = request.path.strip('/').split('/')[0] if '/' in request.path else None

        # Resolve tenant from subdomain or path
        tenant = None
        if subdomain:
            tenant = settings.TENANT_MODEL.get_queryset().get(slug=subdomain)
        elif path_tenant:
            tenant = settings.TENANT_MODEL.get_queryset().get(slug=path_tenant)

        # Set tenant context
        if tenant:
            request.tenant = tenant
            settings.tenant = tenant
            # Switch database schema using django_tenants
            from django_tenants.backends.postgresql import context
            context.switch_context(tenant.schema_name)

        # Add tenant selector to request
        request.tenant_selector = TenantMiddleware.TenantSelector()

    @property
    def TenantSelector(self):
        """Filter form choices to active tenants"""
        from django_tenants.querysets import TenantSelect
        return TenantSelect(Q(is_active=True))