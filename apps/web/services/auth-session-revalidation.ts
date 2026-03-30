import { type SessionMode } from './api-session';

const SESSION_RESUME_REVALIDATION_COOLDOWN_MS = 15 * 1000;

export interface ShouldRevalidateSessionOnResumeParams {
  pathname: string | null;
  sessionMode: SessionMode;
  isSessionModeReady: boolean;
  isDocumentHidden: boolean;
  isOnline: boolean;
  now: number;
  lastAttemptAt: number;
}

export function shouldRevalidateSessionOnResume({
  pathname,
  sessionMode,
  isSessionModeReady,
  isDocumentHidden,
  isOnline,
  now,
  lastAttemptAt,
}: ShouldRevalidateSessionOnResumeParams) {
  if (!pathname || !isSessionModeReady || isDocumentHidden || !isOnline) {
    return false;
  }

  const isProtectedPath =
    (sessionMode === 'user' && pathname.startsWith('/dashboard')) ||
    (sessionMode === 'admin' &&
      (pathname.startsWith('/admin') || pathname.startsWith('/area-restrita')));

  if (!isProtectedPath) {
    return false;
  }

  return now - lastAttemptAt >= SESSION_RESUME_REVALIDATION_COOLDOWN_MS;
}
