from rest_framework import serializers
from .models import Report, ReportExecution


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'name', 'report_type', 'description', 'query', 'parameters', 
                  'is_scheduled', 'schedule_cron', 'last_run_at', 'is_active', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'last_run_at']


class ReportExecutionSerializer(serializers.ModelSerializer):
    report_name = serializers.CharField(source='report.name', read_only=True)

    class Meta:
        model = ReportExecution
        fields = ['id', 'report', 'report_name', 'status', 'parameters', 'result_data', 
                  'error_message', 'started_at', 'completed_at', 'file_url', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'started_at', 'completed_at']
