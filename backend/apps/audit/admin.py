from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'tenant', 'user', 'action', 'model', 'object_id']
    list_filter = ['action', 'model', 'tenant']
    search_fields = ['object_id', 'user__email', 'model', 'changes']
    readonly_fields = ['tenant', 'user', 'action', 'model', 'object_id', 'changes', 'ip_address', 'extra_data', 'timestamp']
