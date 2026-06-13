from django.db import models
from apps.core.models import TenantScopedModel


class Report(TenantScopedModel):
    REPORT_TYPES = [
        ('hr', 'HR Report'),
        ('finance', 'Finance Report'),
        ('operations', 'Operations Report'),
        ('inventory', 'Inventory Report'),
        ('sales', 'Sales Report'),
        ('custom', 'Custom Report'),
    ]

    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField(blank=True)
    query = models.TextField(help_text='SQL query for the report')
    parameters = models.JSONField(default=dict, blank=True, help_text='Report parameters schema')
    is_scheduled = models.BooleanField(default=False)
    schedule_cron = models.CharField(max_length=50, blank=True, help_text='Cron expression for scheduled reports')
    last_run_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['tenant', 'report_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.report_type})"


class ReportExecution(TenantScopedModel):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='executions')
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('running', 'Running'), ('completed', 'Completed'), ('failed', 'Failed')], default='pending')
    parameters = models.JSONField(default=dict, blank=True)
    result_data = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    file_url = models.URLField(blank=True, help_text='URL to download the generated report file')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Report Execution'
        verbose_name_plural = 'Report Executions'

    def __str__(self):
        return f"{self.report.name} - {self.status}"
