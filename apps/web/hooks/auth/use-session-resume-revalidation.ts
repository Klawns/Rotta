'use client';

import { useEffect, useRef } from 'react';
import { shouldRevalidateSessionOnResume } from '@/services/auth-session-revalidation';

interface UseSessionResumeRevalidationProps {
  pathname: string | null;
  revalidate: () => Promise<unknown>;
}

export function useSessionResumeRevalidation({
  pathname,
  revalidate,
}: UseSessionResumeRevalidationProps) {
  const lastAttemptAtRef = useRef(0);

  useEffect(() => {
    const attemptRevalidation = () => {
      const now = Date.now();
      const isOnline =
        typeof navigator === 'undefined' ? true : navigator.onLine !== false;
      const isDocumentHidden =
        typeof document === 'undefined' ? false : document.hidden;

      if (
        !shouldRevalidateSessionOnResume({
          pathname,
          isDocumentHidden,
          isOnline,
          now,
          lastAttemptAt: lastAttemptAtRef.current,
        })
      ) {
        return;
      }

      lastAttemptAtRef.current = now;
      void revalidate();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptRevalidation();
      }
    };

    window.addEventListener('focus', attemptRevalidation);
    window.addEventListener('online', attemptRevalidation);
    window.addEventListener('pageshow', attemptRevalidation);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', attemptRevalidation);
      window.removeEventListener('online', attemptRevalidation);
      window.removeEventListener('pageshow', attemptRevalidation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, revalidate]);
}
