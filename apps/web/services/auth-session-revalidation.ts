const SESSION_RESUME_REVALIDATION_COOLDOWN_MS = 15 * 1000;

export interface ShouldRevalidateSessionOnResumeParams {
  pathname: string | null;
  isDocumentHidden: boolean;
  isOnline: boolean;
  now: number;
  lastAttemptAt: number;
}

export function shouldRevalidateSessionOnResume({
  pathname,
  isDocumentHidden,
  isOnline,
  now,
  lastAttemptAt,
}: ShouldRevalidateSessionOnResumeParams) {
  if (!pathname || isDocumentHidden || !isOnline) {
    return false;
  }

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/area-restrita');

  if (!isProtectedPath) {
    return false;
  }

  return now - lastAttemptAt >= SESSION_RESUME_REVALIDATION_COOLDOWN_MS;
}
