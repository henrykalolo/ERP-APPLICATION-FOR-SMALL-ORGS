from rest_framework import serializers
from .models import Department, Employee, LeaveType, LeaveRequest, Attendance


class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    manager_email = serializers.EmailField(source='manager.email', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'manager', 'manager_name', 'manager_email', 
                  'is_active', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class EmployeeSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'user', 'user_email', 'user_full_name', 'employee_id', 'department', 
                  'department_name', 'job_title', 'hire_date', 'employment_status', 'salary', 
                  'phone', 'address', 'emergency_contact_name', 'emergency_contact_phone', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name', 'code', 'description', 'days_allowed', 'is_paid', 
                  'requires_approval', 'is_active', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id_display = serializers.CharField(source='employee.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = ['id', 'employee', 'employee_name', 'employee_id_display', 'leave_type', 
                  'leave_type_name', 'start_date', 'end_date', 'reason', 'status', 
                  'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason', 
                  'days_count', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'approved_at']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id_display = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_id_display', 'date', 
                  'clock_in', 'clock_out', 'clock_type', 'latitude', 'longitude', 
                  'notes', 'is_geofence_valid', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']
