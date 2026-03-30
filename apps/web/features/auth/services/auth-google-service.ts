import { normalizeCellphone } from '../utils/cellphone';

interface StartGoogleAuthOptions {
  plan?: string;
  cellphone?: string;
}

export function buildGoogleAuthUrl(options: StartGoogleAuthOptions = {}) {
  const searchParams = new URLSearchParams();

  if (options.plan) {
    searchParams.set('plan', options.plan);
  }

  if (options.cellphone) {
    searchParams.set('cellphone', normalizeCellphone(options.cellphone));
  }

  const query = searchParams.toString();

  return query ? `/api/auth/google?${query}` : '/api/auth/google';
}

export function startGoogleAuth(options: StartGoogleAuthOptions = {}) {
  window.location.assign(buildGoogleAuthUrl(options));
}
