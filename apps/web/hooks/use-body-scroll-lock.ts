'use client';

import { useEffect } from 'react';
import {
  BACKGROUND_SCROLL_LOCK_TARGET_SELECTOR,
  getDashboardScrollRoot,
} from '@/lib/dashboard-scroll-root';

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return;
    }

    const dashboardScrollRoot = getDashboardScrollRoot();
    const scrollLockTargets = Array.from(
      document.querySelectorAll<HTMLElement>(BACKGROUND_SCROLL_LOCK_TARGET_SELECTOR),
    );
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousRootOverflow = dashboardScrollRoot?.style.overflow ?? '';
    const previousTargetOverflows = scrollLockTargets.map((element) => ({
      element,
      overflow: element.style.overflow,
    }));

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    if (dashboardScrollRoot) {
      dashboardScrollRoot.style.overflow = 'hidden';
    }

    previousTargetOverflows.forEach(({ element }) => {
      element.style.overflow = 'hidden';
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      if (dashboardScrollRoot) {
        dashboardScrollRoot.style.overflow = previousRootOverflow;
      }

      previousTargetOverflows.forEach(({ element, overflow }) => {
        element.style.overflow = overflow;
      });
    };
  }, [locked]);
}
