from rest_framework import viewsets
from apps.core.views import BaseModelViewSet
from .models import Tenant
from .serializers import TenantSerializer, TenantCreateSerializer


class TenantViewSet(BaseModelViewSet):
    queryset = Tenant.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        return TenantSerializer
