from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from apps.core.views import BaseModelViewSet
from .models import Department, Employee, LeaveType, LeaveRequest, Attendance
from .serializers import (DepartmentSerializer, EmployeeSerializer, LeaveTypeSerializer, 
                          LeaveRequestSerializer, AttendanceSerializer)


class DepartmentViewSet(BaseModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class EmployeeViewSet(BaseModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        department_id = self.request.query_params.get('department')
        employment_status = self.request.query_params.get('employment_status')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if employment_status:
            queryset = queryset.filter(employment_status=employment_status)
            
        return queryset.select_related('user', 'department')


class LeaveTypeViewSet(BaseModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer


class LeaveRequestViewSet(BaseModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee')
        status_filter = self.request.query_params.get('status')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.select_related('employee__user', 'leave_type', 'approved_by')

    def perform_create(self, serializer):
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        days_count = (end_date - start_date).days + 1
        serializer.save(days_count=days_count)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != 'pending':
            return Response({'error': 'Only pending requests can be approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        leave_request.status = 'approved'
        leave_request.approved_by = request.user
        leave_request.approved_at = timezone.now()
        leave_request.save()
        
        return Response({'message': 'Leave request approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != 'pending':
            return Response({'error': 'Only pending requests can be rejected'}, status=status.HTTP_400_BAD_REQUEST)
        
        rejection_reason = request.data.get('rejection_reason', '')
        leave_request.status = 'rejected'
        leave_request.approved_by = request.user
        leave_request.approved_at = timezone.now()
        leave_request.rejection_reason = rejection_reason
        leave_request.save()
        
        return Response({'message': 'Leave request rejected'})


class AttendanceViewSet(BaseModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee')
        date = self.request.query_params.get('date')
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if date:
            queryset = queryset.filter(date=date)
            
        return queryset.select_related('employee__user')

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        employee_id = request.data.get('employee_id')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        try:
            employee = Employee.objects.get(employee_id=employee_id, tenant=request.tenant)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        attendance = Attendance.objects.create(
            employee=employee,
            date=today,
            clock_in=timezone.now(),
            clock_type='in',
            latitude=latitude,
            longitude=longitude,
            tenant=request.tenant,
            created_by=request.user
        )
        
        return Response({'message': 'Clocked in successfully', 'attendance_id': attendance.id})

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        employee_id = request.data.get('employee_id')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        try:
            employee = Employee.objects.get(employee_id=employee_id, tenant=request.tenant)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        attendance = Attendance.objects.create(
            employee=employee,
            date=today,
            clock_out=timezone.now(),
            clock_type='out',
            latitude=latitude,
            longitude=longitude,
            tenant=request.tenant,
            created_by=request.user
        )
        
        return Response({'message': 'Clocked out successfully', 'attendance_id': attendance.id})
