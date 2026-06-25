from rest_framework import viewsets
from .models import Tenant
from .serializers import TenantSerializer, TenantCreateSerializer


class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        return TenantSerializer
