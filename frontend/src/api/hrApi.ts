import apiClient from './client';

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  manager: number | null;
  manager_name: string | null;
  manager_email: string | null;
  is_active: boolean;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user: number;
  user_email: string;
  user_full_name: string;
  employee_id: string;
  department: number | null;
  department_name: string | null;
  job_title: string;
  hire_date: string;
  employment_status: 'active' | 'on_leave' | 'terminated' | 'resigned';
  salary: number | null;
  phone: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  description: string;
  days_allowed: number;
  is_paid: boolean;
  requires_approval: boolean;
  is_active: boolean;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_display: string;
  leave_type: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  rejection_reason: string;
  days_count: number;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_display: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  clock_type: 'in' | 'out';
  latitude: number | null;
  longitude: number | null;
  notes: string;
  is_geofence_valid: boolean;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export const hrApi = {
  departments: {
    list: async () => {
      const response = await apiClient.get<Department[]>('/hr/departments/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Department>(`/hr/departments/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Department>) => {
      const response = await apiClient.post<Department>('/hr/departments/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Department>) => {
      const response = await apiClient.patch<Department>(`/hr/departments/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/hr/departments/${id}/`);
    },
  },

  employees: {
    list: async (params?: { department?: string; employment_status?: string }) => {
      const response = await apiClient.get<Employee[]>('/hr/employees/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Employee>(`/hr/employees/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Employee>) => {
      const response = await apiClient.post<Employee>('/hr/employees/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Employee>) => {
      const response = await apiClient.patch<Employee>(`/hr/employees/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/hr/employees/${id}/`);
    },
  },

  leaveTypes: {
    list: async () => {
      const response = await apiClient.get<LeaveType[]>('/hr/leave-types/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<LeaveType>(`/hr/leave-types/${id}/`);
      return response.data;
    },
    create: async (data: Partial<LeaveType>) => {
      const response = await apiClient.post<LeaveType>('/hr/leave-types/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<LeaveType>) => {
      const response = await apiClient.patch<LeaveType>(`/hr/leave-types/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/hr/leave-types/${id}/`);
    },
  },

  leaveRequests: {
    list: async (params?: { employee?: string; status?: string }) => {
      const response = await apiClient.get<LeaveRequest[]>('/hr/leave-requests/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<LeaveRequest>(`/hr/leave-requests/${id}/`);
      return response.data;
    },
    create: async (data: Partial<LeaveRequest>) => {
      const response = await apiClient.post<LeaveRequest>('/hr/leave-requests/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<LeaveRequest>) => {
      const response = await apiClient.patch<LeaveRequest>(`/hr/leave-requests/${id}/`, data);
      return response.data;
    },
    approve: async (id: number) => {
      const response = await apiClient.post(`/hr/leave-requests/${id}/approve/`);
      return response.data;
    },
    reject: async (id: number, rejectionReason: string) => {
      const response = await apiClient.post(`/hr/leave-requests/${id}/reject/`, {
        rejection_reason: rejectionReason,
      });
      return response.data;
    },
  },

  attendance: {
    list: async (params?: { employee?: string; date?: string }) => {
      const response = await apiClient.get<Attendance[]>('/hr/attendance/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Attendance>(`/hr/attendance/${id}/`);
      return response.data;
    },
    clockIn: async (data: { employee_id: string; latitude?: number; longitude?: number }) => {
      const response = await apiClient.post('/hr/attendance/clock_in/', data);
      return response.data;
    },
    clockOut: async (data: { employee_id: string; latitude?: number; longitude?: number }) => {
      const response = await apiClient.post('/hr/attendance/clock_out/', data);
      return response.data;
    },
  },
};
