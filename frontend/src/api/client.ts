import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const unwrapPaginatedResponse = (response: { data: PaginatedResponse<any> | any }) => {
  if (
    response.data &&
    typeof response.data === 'object' &&
    'results' in response.data &&
    Array.isArray((response.data as PaginatedResponse<any>).results)
  ) {
    return {
      ...response,
      data: (response.data as PaginatedResponse<any>).results,
    };
  }
  return response;
};

export function requestPaginated<T>(path: string, params?: Record<string, any>): Promise<T[]> {
  return apiClient.get<PaginatedResponse<T>>(path, { params }).then(res => res.data.results)
}

export function request<T>(path: string, params?: Record<string, any>): Promise<T> {
  return apiClient.get<T>(path, { params }).then(res => res.data)
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
