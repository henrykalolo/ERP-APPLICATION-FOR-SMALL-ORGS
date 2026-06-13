from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.views import BaseModelViewSet
from .models import Role, Permission, RolePermission, UserRole
from .serializers import RoleSerializer, PermissionSerializer, RolePermissionSerializer, UserRoleSerializer


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    pagination_class = None


class RoleViewSet(BaseModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.prefetch_related('role_permissions__permission')

    @action(detail=True, methods=['post'])
    def assign_permission(self, request, pk=None):
        role = self.get_object()
        permission_id = request.data.get('permission_id')
        try:
            permission = Permission.objects.get(id=permission_id)
            RolePermission.objects.get_or_create(role=role, permission=permission, tenant=request.tenant)
            return Response({'message': 'Permission assigned successfully'})
        except Permission.DoesNotExist:
            return Response({'error': 'Permission not found'}, status=400)

    @action(detail=True, methods=['post'])
    def remove_permission(self, request, pk=None):
        role = self.get_object()
        permission_id = request.data.get('permission_id')
        try:
            permission = Permission.objects.get(id=permission_id)
            RolePermission.objects.filter(role=role, permission=permission, tenant=request.tenant).delete()
            return Response({'message': 'Permission removed successfully'})
        except Permission.DoesNotExist:
            return Response({'error': 'Permission not found'}, status=400)


class UserRoleViewSet(BaseModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)
