import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

export type SessionMode = 'admin' | 'user';

let sessionMode: SessionMode = 'user';

export function setSessionMode(mode: SessionMode) {
  sessionMode = mode;
}

export function getSessionMode() {
  return sessionMode;
}

export function getSessionHeaders() {
  return sessionMode === 'admin' ? { 'X-Session-Mode': 'admin' } : {};
}

export function resolveSessionMode(pathname: string | null): SessionMode {
  if (!pathname) {
    return 'user';
  }

  return pathname.startsWith('/admin') || pathname.startsWith('/area-restrita')
    ? 'admin'
    : 'user';
}

export function applySessionHeaders(config: InternalAxiosRequestConfig) {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  headers.set('X-Requested-With', 'XMLHttpRequest');

  if (sessionMode === 'admin') {
    headers.set('X-Session-Mode', 'admin');
    config.headers = headers;
    return config;
  }

  headers.delete('X-Session-Mode');

  config.headers = headers;
  return config;
}
