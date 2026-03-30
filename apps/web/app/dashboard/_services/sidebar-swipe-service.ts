'use client';

export const MOBILE_SIDEBAR_BREAKPOINT = 1024;
export const MOBILE_SIDEBAR_DRAWER_WIDTH = 288;
export const MOBILE_SIDEBAR_EDGE_SWIPE_WIDTH = 24;
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

export function isSidebarSwipePointerType(pointerType: string) {
  return pointerType === 'touch' || pointerType === 'pen';
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
