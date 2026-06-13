from rest_framework import serializers
from .models import Role, Permission, RolePermission, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'description', 'module']
        read_only_fields = ['id']


class RolePermissionSerializer(serializers.ModelSerializer):
    permission_detail = PermissionSerializer(source='permission', read_only=True)

    class Meta:
        model = RolePermission
        fields = ['id', 'permission', 'permission_detail']
        read_only_fields = ['id']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True, source='role_permissions.permission')

    class Meta:
        model = Role
        fields = ['id', 'name', 'code', 'description', 'permissions', 'is_active', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class UserRoleSerializer(serializers.ModelSerializer):
    role_detail = RoleSerializer(source='role', read_only=True)
    assigned_by_email = serializers.EmailField(source='assigned_by.email', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role', 'role_detail', 'assigned_by', 'assigned_by_email', 'assigned_at', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'assigned_at']
