import apiClient from './client';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  schema_name: string;
  is_active: boolean;
  plan: string;
  created_at: string;
  updated_at: string;
}

export const tenantApi = {
  list: async () => {
    const response = await apiClient.get<Tenant[]>('/tenants/');
    return response.data;
  },

  get: async (id: number) => {
    const response = await apiClient.get<Tenant>(`/tenants/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Tenant>) => {
    const response = await apiClient.post<Tenant>('/tenants/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Tenant>) => {
    const response = await apiClient.patch<Tenant>(`/tenants/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/tenants/${id}/`);
  },
};
