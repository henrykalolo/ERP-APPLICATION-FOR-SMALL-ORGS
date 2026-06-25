from django.apps import apps
from django.db.models import Q
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from apps.core.threadlocals import set_current_request


class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        set_current_request(request)

        host = request.get_host().split(':')[0]
        subdomain = host.split('.')[0] if '.' in host else None
        path_tenant = request.path.strip('/').split('/')[0] if request.path.strip('/') else None

        tenant = None
        try:
            tenant_model = apps.get_model(settings.TENANT_MODEL)
            if subdomain:
                tenant = tenant_model.objects.filter(slug=subdomain, is_active=True).first()
            if tenant is None and path_tenant:
                tenant = tenant_model.objects.filter(slug=path_tenant, is_active=True).first()
        except Exception:
            tenant = None

        if tenant:
            request.tenant = tenant
            settings.tenant = tenant

        request.tenant_selector = self.TenantSelector

    def process_response(self, request, response):
        set_current_request(None)
        return response

    @property
    def TenantSelector(self):
        from django_tenants.querysets import TenantSelect
        return TenantSelect(Q(is_active=True))