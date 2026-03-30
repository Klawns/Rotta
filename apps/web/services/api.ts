import axios, { AxiosRequestConfig } from 'axios';
import {
  isRetriableUnauthorized,
  notifyUnauthorizedIfNeeded,
  refreshSession,
} from './api-auth';
import { createRefreshQueue } from './api-refresh-queue';
import { normalizeEnvelope, type ApiEnvelope, unwrapData } from './api-envelope';
import { applySessionHeaders, setSessionMode } from './api-session';
export type { ApiEnvelope } from './api-envelope';
export { setSessionMode };

declare module 'axios' {
  export interface AxiosRequestConfig {
    _skipRedirect?: boolean;
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL:
    typeof window !== 'undefined'
      ? '/api'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.request.use((config) => applySessionHeaders(config));

let isRefreshing = false;
const refreshQueue = createRefreshQueue();

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (isRetriableUnauthorized(error.response?.status, originalRequest)) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          refreshQueue.enqueue({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((refreshError) => Promise.reject(refreshError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshSession(api.defaults.baseURL);

        isRefreshing = false;
        refreshQueue.process(null);

        return api(originalRequest);
      } catch (refreshError: unknown) {
        refreshQueue.process(refreshError, null);
        isRefreshing = false;

        notifyUnauthorizedIfNeeded(originalRequest, refreshError);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export const apiClient = {
  async get<TData = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<TData> {
    const response = await api.get(url, config);
    return unwrapData<TData>(response.data);
  },

  async getPaginated<TData = unknown, TMeta = Record<string, unknown>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiEnvelope<TData, TMeta>> {
    const response = await api.get(url, config);
    return normalizeEnvelope<TData, TMeta>(response.data, response.data as TData);
  },

  async post<TData = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<TData> {
    const response = await api.post(url, data, config);
    return unwrapData<TData>(response.data);
  },

  async put<TData = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<TData> {
    const response = await api.put(url, data, config);
    return unwrapData<TData>(response.data);
  },

  async patch<TData = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<TData> {
    const response = await api.patch(url, data, config);
    return unwrapData<TData>(response.data);
  },

  async delete<TData = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<TData> {
    const response = await api.delete(url, config);
    return unwrapData<TData>(response.data);
  },
};
