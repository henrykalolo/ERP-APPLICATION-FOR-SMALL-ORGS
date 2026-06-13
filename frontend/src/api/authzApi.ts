import apiClient from './client';

export interface Permission {
  id: number;
  name: string;
  codename: string;
  description: string;
  module: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: number;
  user: number;
  role: number;
  role_detail: Role;
  assigned_by: number;
  assigned_by_email: string;
  assigned_at: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export const authzApi = {
  permissions: {
    list: async () => {
      const response = await apiClient.get<Permission[]>('/authz/permissions/');
      return response.data;
    },
  },

  roles: {
    list: async () => {
      const response = await apiClient.get<Role[]>('/authz/roles/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Role>(`/authz/roles/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Role>) => {
      const response = await apiClient.post<Role>('/authz/roles/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Role>) => {
      const response = await apiClient.patch<Role>(`/authz/roles/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/authz/roles/${id}/`);
    },
    assignPermission: async (id: number, permissionId: number) => {
      const response = await apiClient.post(`/authz/roles/${id}/assign_permission/`, {
        permission_id: permissionId,
      });
      return response.data;
    },
    removePermission: async (id: number, permissionId: number) => {
      const response = await apiClient.post(`/authz/roles/${id}/remove_permission/`, {
        permission_id: permissionId,
      });
      return response.data;
    },
  },

  userRoles: {
    list: async () => {
      const response = await apiClient.get<UserRole[]>('/authz/user-roles/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<UserRole>(`/authz/user-roles/${id}/`);
      return response.data;
    },
    create: async (data: Partial<UserRole>) => {
      const response = await apiClient.post<UserRole>('/authz/user-roles/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<UserRole>) => {
      const response = await apiClient.patch<UserRole>(`/authz/user-roles/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/authz/user-roles/${id}/`);
    },
  },
};
