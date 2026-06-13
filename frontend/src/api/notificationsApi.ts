import apiClient from './client';

export interface Notification {
  id: number;
  recipient: number;
  recipient_email: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  read_at: string | null;
  action_url: string;
  metadata: Record<string, any>;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: number;
  user: number;
  user_email: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  digest_frequency: 'immediate' | 'daily' | 'weekly';
  tenant: number;
  created_at: string;
  updated_at: string;
}

export const notificationsApi = {
  notifications: {
    list: async () => {
      const response = await apiClient.get<Notification[]>('/notifications/notifications/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Notification>(`/notifications/notifications/${id}/`);
      return response.data;
    },
    unread: async () => {
      const response = await apiClient.get<Notification[]>('/notifications/notifications/unread/');
      return response.data;
    },
    markRead: async (id: number) => {
      const response = await apiClient.post(`/notifications/notifications/${id}/mark_read/`);
      return response.data;
    },
    markAllRead: async () => {
      const response = await apiClient.post('/notifications/notifications/mark_all_read/');
      return response.data;
    },
  },

  preferences: {
    list: async () => {
      const response = await apiClient.get<NotificationPreference[]>('/notifications/preferences/');
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<NotificationPreference>(`/notifications/preferences/${id}/`);
      return response.data;
    },
    create: async (data: Partial<NotificationPreference>) => {
      const response = await apiClient.post<NotificationPreference>('/notifications/preferences/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<NotificationPreference>) => {
      const response = await apiClient.patch<NotificationPreference>(`/notifications/preferences/${id}/`, data);
      return response.data;
    },
  },
};
