import axios, { type AxiosRequestConfig } from 'axios';
import { authService } from './auth-service';

type RetriableRequestConfig = AxiosRequestConfig & {
  _skipRedirect?: boolean;
  _skipRefresh?: boolean;
  _retry?: boolean;
};

function getRequestUrl(request: RetriableRequestConfig) {
  return typeof request.url === 'string' ? request.url : '';
}

function isAuthLifecycleRequest(request: RetriableRequestConfig) {
  const url = getRequestUrl(request);

  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

export function isRetriableUnauthorized(
  status: number | undefined,
  request: RetriableRequestConfig,
) {
  return (
    status === 401 &&
    !request._retry &&
    !request._skipRefresh &&
    !isAuthLifecycleRequest(request)
  );
}

export async function refreshSession(baseURL: string | undefined) {
  const response = await axios.post(
    `${baseURL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      validateStatus: (status) => status < 500,
    },
  );

  if (response.status !== 200) {
    throw { response };
  }
}

export function notifyUnauthorizedIfNeeded(
  request: RetriableRequestConfig,
  error: unknown,
) {
  if (
    request._skipRedirect ||
    !error ||
    typeof error !== 'object' ||
    !('response' in error)
  ) {
    return;
  }

  authService.notifyUnauthorized();
}
