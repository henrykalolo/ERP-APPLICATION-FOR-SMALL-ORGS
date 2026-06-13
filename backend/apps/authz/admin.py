from django.contrib import admin
from .models import Role, Permission, RolePermission, UserRole


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'codename', 'module']
    search_fields = ['name', 'codename', 'module']
    list_filter = ['module']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'tenant']
    search_fields = ['name', 'code']
    list_filter = ['is_active']
    raw_id_fields = ['permissions']


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ['role', 'permission']
    list_filter = ['role', 'permission']


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'assigned_at', 'tenant']
    list_filter = ['role', 'assigned_at']
    search_fields = ['user__email', 'role__code']
