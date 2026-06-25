from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Report, ReportExecution
from .serializers import ReportSerializer, ReportExecutionSerializer
from .tasks import generate_report


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        report_type = self.request.query_params.get('report_type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        return queryset

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        report = self.get_object()
        execution = ReportExecution.objects.create(
            report=report,
            tenant=request.tenant,
            created_by=request.user,
            status='pending',
            parameters=request.data.get('parameters', {}),
        )
        try:
            generate_report.delay(execution.id)
            execution.status = 'running'
            execution.save()
        except Exception:
            execution.status = 'failed'
            execution.save()
        return Response({'execution_id': execution.id, 'status': execution.status})


class ReportExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReportExecution.objects.all().select_related('report', 'triggered_by')
    serializer_class = ReportExecutionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        report_id = self.request.query_params.get('report')
        if report_id:
            queryset = queryset.filter(report_id=report_id)
        return queryset
