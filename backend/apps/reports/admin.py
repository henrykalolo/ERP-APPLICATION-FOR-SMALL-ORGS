from django.contrib import admin
from .models import Report, ReportExecution


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['name', 'report_type', 'is_scheduled', 'is_active', 'last_run_at']
    list_filter = ['report_type', 'is_scheduled', 'is_active']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'last_run_at']


@admin.register(ReportExecution)
class ReportExecutionAdmin(admin.ModelAdmin):
    list_display = ['report', 'status', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at']
    search_fields = ['report__name', 'error_message']
    readonly_fields = ['created_at', 'updated_at']
