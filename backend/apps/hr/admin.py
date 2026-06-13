from django.contrib import admin
from .models import Department, Employee, LeaveType, LeaveRequest, Attendance


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'manager', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'user', 'department', 'job_title', 'employment_status']
    list_filter = ['employment_status', 'department', 'hire_date']
    search_fields = ['employee_id', 'user__email', 'user__first_name', 'user__last_name']


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'days_allowed', 'is_paid', 'is_active']
    list_filter = ['is_paid', 'is_active']
    search_fields = ['name', 'code']


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'leave_type', 'start_date']
    search_fields = ['employee__employee_id', 'employee__user__email']
    readonly_fields = ['approved_at']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'clock_in', 'clock_out', 'clock_type']
    list_filter = ['date', 'clock_type']
    search_fields = ['employee__employee_id', 'employee__user__email']
    readonly_fields = ['created_at', 'updated_at']
