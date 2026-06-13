import apiClient from './client';

export interface Folder {
  id: number;
  name: string;
  parent: number | null;
  parent_name: string | null;
  path: string;
  description: string;
  is_public: boolean;
  children_count: number;
  documents_count: number;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  name: string;
  file: string | null;
  file_url: string | null;
  file_type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'presentation' | 'other';
  file_size: number;
  mime_type: string;
  folder: number | null;
  folder_name: string | null;
  folder_path: string | null;
  description: string;
  tags: string[];
  is_public: boolean;
  version: number;
  storage_path: string;
  ocr_processed: boolean;
  ocr_text: string;
  tenant: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: number;
  document: number;
  version_number: number;
  file: string | null;
  file_url: string | null;
  file_size: number;
  uploaded_by: number | null;
  uploaded_by_email: string | null;
  change_notes: string;
  created_at: string;
  tenant: number;
  updated_at: string;
}

export const dmsApi = {
  folders: {
    list: async (params?: { parent?: string }) => {
      const response = await apiClient.get<Folder[]>('/dms/folders/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Folder>(`/dms/folders/${id}/`);
      return response.data;
    },
    create: async (data: Partial<Folder>) => {
      const response = await apiClient.post<Folder>('/dms/folders/', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Folder>) => {
      const response = await apiClient.patch<Folder>(`/dms/folders/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/dms/folders/${id}/`);
    },
    contents: async (id: number) => {
      const response = await apiClient.get<{ folders: Folder[]; documents: Document[] }>(`/dms/folders/${id}/contents/`);
      return response.data;
    },
  },

  documents: {
    list: async (params?: { folder?: string; file_type?: string; tags?: string }) => {
      const response = await apiClient.get<Document[]>('/dms/documents/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<Document>(`/dms/documents/${id}/`);
      return response.data;
    },
    create: async (data: FormData) => {
      const response = await apiClient.post<Document>('/dms/documents/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    uploadUrl: async (data: FormData) => {
      const response = await apiClient.post('/dms/documents/upload-url/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    update: async (id: number, data: Partial<Document>) => {
      const response = await apiClient.patch<Document>(`/dms/documents/${id}/`, data);
      return response.data;
    },
    delete: async (id: number) => {
      await apiClient.delete(`/dms/documents/${id}/`);
    },
    downloadUrl: async (id: number) => {
      const response = await apiClient.get<{ download_url: string }>(`/dms/documents/${id}/download_url/`);
      return response.data;
    },
    uploadVersion: async (id: number, data: FormData) => {
      const response = await apiClient.post(`/dms/documents/${id}/upload_version/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    move: async (id: number, data: { folder_id: number }) => {
      const response = await apiClient.post(`/dms/documents/${id}/move/`, data);
      return response.data;
    },
    search: async (query: string) => {
      const response = await apiClient.get<Document[]>('/dms/documents/search/', { params: { q: query } });
      return response.data;
    },
  },

  versions: {
    list: async (params?: { document?: string }) => {
      const response = await apiClient.get<DocumentVersion[]>('/dms/versions/', { params });
      return response.data;
    },
    get: async (id: number) => {
      const response = await apiClient.get<DocumentVersion>(`/dms/versions/${id}/`);
      return response.data;
    },
  },
};
