from rest_framework.permissions import IsAuthenticated
from apps.core.views import ReadOnlyModelViewSet
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related('user', 'tenant')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'tenant') and self.request.tenant is not None:
            return queryset.filter(tenant=self.request.tenant)
        return queryset.none()
