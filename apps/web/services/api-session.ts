import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

export function applySessionHeaders(config: InternalAxiosRequestConfig) {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  headers.set('X-Requested-With', 'XMLHttpRequest');
  config.headers = headers;
  return config;
}
