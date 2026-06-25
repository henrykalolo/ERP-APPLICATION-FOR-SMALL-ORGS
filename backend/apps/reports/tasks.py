from celery import shared_task
from django.db import connection
from django.utils import timezone
from .models import ReportExecution


@shared_task
def generate_report(execution_id):
    try:
        execution = ReportExecution.objects.select_related('report').get(id=execution_id)
        execution.status = 'running'
        execution.started_at = timezone.now()
        execution.save()

        report = execution.report
        query = (execution.parameters or {}).get('query') or report.query
        if not query or not query.strip().lower().startswith('select'):
            raise ValueError('Report query must be a SELECT statement.')

        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description] if cursor.description else []
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

        execution.result_data = {
            'rows': rows,
            'columns': columns,
            'row_count': len(rows),
        }
        execution.status = 'completed'
        execution.completed_at = timezone.now()
        execution.error_message = ''
        execution.save()
    except Exception as e:
        execution.status = 'failed'
        execution.error_message = str(e)
        execution.completed_at = timezone.now()
        execution.save()
