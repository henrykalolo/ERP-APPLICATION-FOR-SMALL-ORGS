from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, ReportExecutionViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'executions', ReportExecutionViewSet, basename='report-execution')

urlpatterns = [
    path('', include(router.urls)),
]
