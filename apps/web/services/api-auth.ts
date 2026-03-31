import axios, { type AxiosRequestConfig } from 'axios';
import { authService } from './auth-service';

type RetriableRequestConfig = AxiosRequestConfig & {
  _skipRedirect?: boolean;
  _retry?: boolean;
};

export function isRetriableUnauthorized(
  status: number | undefined,
  request: RetriableRequestConfig,
) {
  return status === 401 && !request._retry;
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
