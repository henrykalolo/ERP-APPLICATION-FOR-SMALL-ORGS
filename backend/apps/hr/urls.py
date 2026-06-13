from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (DepartmentViewSet, EmployeeViewSet, LeaveTypeViewSet, 
                    LeaveRequestViewSet, AttendanceViewSet)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'leave-types', LeaveTypeViewSet, basename='leavetype')
router.register(r'leave-requests', LeaveRequestViewSet, basename='leaverequest')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

leave_request_router = DefaultRouter()
leave_request_router.register(r'leave/request', LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(leave_request_router.urls)),
]
