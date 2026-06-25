import apiClient, { requestPaginated } from './client';

export interface Report {
  id: number;
  name: string;
  report_type: 'hr' | 'finance' | 'operations' | 'inventory' | 'sales' | 'custom';
  description: string;
  query: string;
  parameters: Record<string, any>;
  is_scheduled: boolean;
  schedule_cron: string;
  last_run_at: string | null;
  is_active: boolean;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: number;
  report: number;
  report_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  result_data: Record<string, any>;
  error_message: string;
  started_at: string | null;
  completed_at: string | null;
  file_url: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export const reportsApi = {
  reports: {
    list: async () => {
      const response = await apiClient.get<Report[]>('/reports/reports/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Report>(`/reports/reports/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Report>) => {
      const response = await apiClient.post<Report>('/reports/reports/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Report>) => {
      const response = await apiClient.patch<Report>(`/reports/reports/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/reports/reports/${id}/`);
    },
    execute: async (id: number, parameters?: Record<string, any>) => {
      const response = await apiClient.post(`/reports/reports/${id}/execute/`, { parameters });
      return response.data;
    },
    executions: async (id: number) => {
      const response = await apiClient.get<ReportExecution[]>(`/reports/reports/${id}/executions/`);
      return response.data;
    },
  },

  executions: {
    list: async () => {
      const response = await apiClient.get<ReportExecution[]>('/reports/executions/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<ReportExecution>(`/reports/executions/${id}/`);
      return response.data;
    },
  },
};
