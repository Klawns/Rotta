'use client';

export const MOBILE_SIDEBAR_BREAKPOINT = 1024;
export const MOBILE_SIDEBAR_DRAWER_WIDTH = 288;
export const MOBILE_SIDEBAR_EDGE_SWIPE_WIDTH = 20;
export const MOBILE_SIDEBAR_IOS_BACK_GESTURE_INSET = 24;
export const MOBILE_SIDEBAR_AXIS_LOCK_THRESHOLD = 12;
export const MOBILE_SIDEBAR_GESTURE_THRESHOLD = 18;
export const MOBILE_SIDEBAR_OPEN_RATIO_THRESHOLD = 0.4;
export const MOBILE_SIDEBAR_VELOCITY_THRESHOLD = 450;

interface SidebarSwipeDecisionParams {
  drawerWidth: number;
  translateX: number;
  velocityX: number;
}

export function clampSidebarTranslateX(value: number, drawerWidth: number) {
  return Math.min(0, Math.max(-drawerWidth, value));
}

export function isSidebarSwipeMobileViewport() {
  return window.innerWidth < MOBILE_SIDEBAR_BREAKPOINT;
}

export function isSidebarSwipeIosViewport() {
  const platform = window.navigator.platform;
  const maxTouchPoints = window.navigator.maxTouchPoints ?? 0;
  const userAgent = window.navigator.userAgent;

  return (
    /iP(hone|ad|od)/i.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1)
  );
}

export function isSidebarSwipePointerType(pointerType: string) {
  return pointerType === 'touch' || pointerType === 'pen';
}

export function getSidebarEdgeSwipeOffset() {
  return isSidebarSwipeIosViewport() ? MOBILE_SIDEBAR_IOS_BACK_GESTURE_INSET : 0;
}

export function canStartSidebarEdgeSwipe(clientX: number) {
  const offset = getSidebarEdgeSwipeOffset();

  return (
    clientX >= offset &&
    clientX <= offset + MOBILE_SIDEBAR_EDGE_SWIPE_WIDTH
  );
}

export function getSidebarSwipeProgress(translateX: number, drawerWidth: number) {
  return 1 - Math.abs(translateX) / drawerWidth;
}

export function getSidebarOverlayOpacity(progress: number) {
  return progress * 0.6;
}

export function shouldOpenSidebarAfterSwipe({
  drawerWidth,
  translateX,
  velocityX,
}: SidebarSwipeDecisionParams) {
  const openRatio = getSidebarSwipeProgress(translateX, drawerWidth);

  if (velocityX >= MOBILE_SIDEBAR_VELOCITY_THRESHOLD) {
    return true;
  }

  if (velocityX <= -MOBILE_SIDEBAR_VELOCITY_THRESHOLD) {
    return false;
  }

  return openRatio >= MOBILE_SIDEBAR_OPEN_RATIO_THRESHOLD;
}
