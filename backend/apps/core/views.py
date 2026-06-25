from django.http import JsonResponse
from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.finance.models import Invoice
from apps.hr.models import Employee
from apps.operations.models import Project
from .permissions import IsTenantMember
from .pagination import StandardResultsSetPagination
from .mixins import TenantContextMixin


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'SmallOrg Central API'})


@api_view(['GET'])
def dashboard_summary(request):
    tenant = getattr(request, 'tenant', None)
    if tenant is None:
        return Response({'error': 'Tenant context required'}, status=status.HTTP_400_BAD_REQUEST)

    employees = Employee.objects.filter(tenant=tenant).count()
    projects = Project.objects.filter(tenant=tenant).count()
    pending_invoices = Invoice.objects.filter(tenant=tenant, status__in=['draft', 'sent', 'overdue']).count()
    total_revenue = Invoice.objects.filter(tenant=tenant).aggregate(total=Sum('total_amount'))['total'] or 0

    return Response({
        'employees': employees,
        'projects': projects,
        'pending_invoices': pending_invoices,
        'total_revenue': str(total_revenue),
    })


@api_view(['GET'])
def api_root(request):
    return Response({
        'name': 'SmallOrg Central API',
        'version': 'v1',
        'links': {
            'auth': '/api/v1/auth/',
            'tenants': '/api/v1/tenants/',
            'authz': '/api/v1/authz/',
            'notifications': '/api/v1/notifications/',
            'hr': '/api/v1/hr/',
            'finance': '/api/v1/finance/',
            'operations': '/api/v1/operations/',
            'dms': '/api/v1/dms/',
            'reports': '/api/v1/reports/',
        },
    })

class TenantViewSetMixin:
    permission_classes = [IsAuthenticated, IsTenantMember]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'tenant'):
            return queryset.filter(tenant=self.request.tenant)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant, created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

class BaseModelViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    pass

class ReadOnlyModelViewSet(TenantViewSetMixin, viewsets.ReadOnlyModelViewSet):
    pass

class TenantModelViewSet(BaseModelViewSet):
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context