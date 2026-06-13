from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from apps.core.views import BaseModelViewSet
from .models import Report, ReportExecution
from .serializers import ReportSerializer, ReportExecutionSerializer
from .tasks import generate_report


class ReportViewSet(BaseModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        report = self.get_object()
        execution = ReportExecution.objects.create(
            report=report,
            tenant=request.tenant,
            created_by=request.user,
            parameters=request.data.get('parameters', {}),
            status='pending'
        )
        generate_report.delay(execution.id)
        return Response({'message': 'Report execution started', 'execution_id': execution.id})

    @action(detail=True, methods=['get'])
    def executions(self, request, pk=None):
        report = self.get_object()
        executions = report.executions.all().order_by('-created_at')
        page = self.paginate_queryset(executions)
        if page is not None:
            serializer = ReportExecutionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ReportExecutionSerializer(executions, many=True)
        return Response(serializer.data)


class ReportExecutionViewSet(BaseModelViewSet):
    queryset = ReportExecution.objects.all()
    serializer_class = ReportExecutionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('report')
