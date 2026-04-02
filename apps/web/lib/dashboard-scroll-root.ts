export const DASHBOARD_SCROLL_ROOT_SELECTOR = '[data-dashboard-scroll-root="true"]';
export const BACKGROUND_SCROLL_LOCK_TARGET_SELECTOR =
  '[data-scroll-lock-root="true"]';

export function getDashboardScrollRoot() {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector<HTMLElement>(DASHBOARD_SCROLL_ROOT_SELECTOR);
}
