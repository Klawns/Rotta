'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import { animate, useMotionValue, useTransform } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  canStartSidebarEdgeSwipe,
  clampSidebarTranslateX,
  getSidebarEdgeSwipeOffset,
  isSidebarSwipeMobileViewport,
  isSidebarSwipePointerType,
  MOBILE_SIDEBAR_AXIS_LOCK_THRESHOLD,
  MOBILE_SIDEBAR_DRAWER_WIDTH,
  MOBILE_SIDEBAR_GESTURE_THRESHOLD,
  shouldOpenSidebarAfterSwipe,
  getSidebarOverlayOpacity,
} from '../_services/sidebar-swipe-service';

interface UseSidebarSwipeParams {
  drawerWidth?: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface SidebarGestureState {
  pointerId: number;
  origin: 'edge' | 'drawer';
  startX: number;
  startY: number;
  lastX: number;
  lastTimestamp: number;
  isDragging: boolean;
}

export function useSidebarSwipe({
  drawerWidth = MOBILE_SIDEBAR_DRAWER_WIDTH,
  isOpen,
  setIsOpen,
}: UseSidebarSwipeParams) {
  const x = useMotionValue(isOpen ? 0 : -drawerWidth);
  const overlayOpacity = useTransform(
    x,
    [-drawerWidth, 0],
    [0, getSidebarOverlayOpacity(1)],
  );
  const [isOverlayVisible, setIsOverlayVisible] = useState(isOpen);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [edgeZoneOffset, setEdgeZoneOffset] = useState(0);
  const gestureRef = useRef<SidebarGestureState | null>(null);
  const removeWindowListenersRef = useRef<(() => void) | null>(null);
  const overlayClickTimeoutRef = useRef<number | null>(null);
  const shouldIgnoreOverlayClickRef = useRef(false);

  const finalizeSwipe = useCallback(
    (nextOpen: boolean, shouldAnimate: boolean = true) => {
      setIsOpen(nextOpen);
      setIsDragging(false);

      if (shouldAnimate) {
        animate(x, nextOpen ? 0 : -drawerWidth, {
          type: 'spring',
          stiffness: 420,
          damping: 38,
          mass: 0.8,
        });
      } else {
        x.set(nextOpen ? 0 : -drawerWidth);
      }
    },
    [drawerWidth, setIsOpen, x],
  );

  const clearOverlayClickSuppression = useCallback(() => {
    if (overlayClickTimeoutRef.current !== null) {
      window.clearTimeout(overlayClickTimeoutRef.current);
      overlayClickTimeoutRef.current = null;
    }

    shouldIgnoreOverlayClickRef.current = false;
  }, []);

  const suppressNextOverlayClick = useCallback(() => {
    clearOverlayClickSuppression();
    shouldIgnoreOverlayClickRef.current = true;
    overlayClickTimeoutRef.current = window.setTimeout(() => {
      shouldIgnoreOverlayClickRef.current = false;
      overlayClickTimeoutRef.current = null;
    }, 250);
  }, [clearOverlayClickSuppression]);

  useEffect(() => {
    if (isDragging) {
      return;
    }

    const animation = animate(x, isOpen ? 0 : -drawerWidth, {
      type: 'spring',
      stiffness: 420,
      damping: 38,
      mass: 0.8,
    });

    return () => animation.stop();
  }, [drawerWidth, isDragging, isOpen, x]);

  useEffect(() => {
    const syncViewportState = () => {
      setIsMobileViewport(isSidebarSwipeMobileViewport());
      setEdgeZoneOffset(getSidebarEdgeSwipeOffset());
    };

    syncViewportState();
    window.addEventListener('resize', syncViewportState);

    return () => window.removeEventListener('resize', syncViewportState);
  }, []);

  useEffect(() => {
    const unsubscribe = x.on('change', (latestX) => {
      setIsOverlayVisible(latestX > -drawerWidth + 1);
    });

    return () => unsubscribe();
  }, [drawerWidth, x]);

  const detachWindowListeners = useCallback(() => {
    removeWindowListenersRef.current?.();
    removeWindowListenersRef.current = null;
  }, []);

  const resetGesture = useCallback(() => {
    detachWindowListeners();
    gestureRef.current = null;
    setIsDragging(false);
  }, [detachWindowListeners]);

  useEffect(() => {
    return () => {
      detachWindowListeners();
      clearOverlayClickSuppression();
    };
  }, [clearOverlayClickSuppression, detachWindowListeners]);

  const updateGesture = useCallback(
    (event: PointerEvent) => {
      const gesture = gestureRef.current;

      if (!gesture || gesture.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (!gesture.isDragging) {
        if (
          absDeltaY >= MOBILE_SIDEBAR_AXIS_LOCK_THRESHOLD &&
          absDeltaY > absDeltaX
        ) {
          resetGesture();
          return;
        }

        if (
          absDeltaX < MOBILE_SIDEBAR_GESTURE_THRESHOLD ||
          absDeltaX <= absDeltaY
        ) {
          return;
        }

        gesture.isDragging = true;
        setIsDragging(true);
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      const nextTranslateX =
        gesture.origin === 'edge'
          ? clampSidebarTranslateX(-drawerWidth + Math.max(0, deltaX), drawerWidth)
          : clampSidebarTranslateX(deltaX, drawerWidth);

      gesture.lastX = event.clientX;
      gesture.lastTimestamp = performance.now();
      x.set(nextTranslateX);
    },
    [drawerWidth, resetGesture, x],
  );

  const endGesture = useCallback(
    (event: PointerEvent) => {
      const gesture = gestureRef.current;

      if (!gesture || gesture.pointerId !== event.pointerId) {
        return;
      }

      const now = performance.now();
      const elapsed = Math.max(now - gesture.lastTimestamp, 1);
      const velocityX = ((event.clientX - gesture.lastX) / elapsed) * 1000;

      if (!gesture.isDragging) {
        resetGesture();
        finalizeSwipe(isOpen, false);
        return;
      }

      const nextOpen = shouldOpenSidebarAfterSwipe({
        drawerWidth,
        translateX: x.get(),
        velocityX,
      });

      suppressNextOverlayClick();
      resetGesture();
      finalizeSwipe(nextOpen);
    },
    [drawerWidth, finalizeSwipe, isOpen, resetGesture, suppressNextOverlayClick, x],
  );

  const startGesture = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      origin: SidebarGestureState['origin'],
    ) => {
      if (
        !isSidebarSwipeMobileViewport() ||
        !isSidebarSwipePointerType(event.pointerType)
      ) {
        return;
      }

      if ((origin === 'edge' && isOpen) || (origin === 'drawer' && !isOpen)) {
        return;
      }

      if (origin === 'edge' && !canStartSidebarEdgeSwipe(event.clientX)) {
        return;
      }

      clearOverlayClickSuppression();
      gestureRef.current = {
        pointerId: event.pointerId,
        origin,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastTimestamp: performance.now(),
        isDragging: false,
      };

      if (!removeWindowListenersRef.current) {
        const handlePointerMove = (nativeEvent: PointerEvent) =>
          updateGesture(nativeEvent);
        const handlePointerUp = (nativeEvent: PointerEvent) =>
          endGesture(nativeEvent);
        const handlePointerCancel = () => resetGesture();

        window.addEventListener('pointermove', handlePointerMove, {
          passive: false,
        });
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerCancel);

        removeWindowListenersRef.current = () => {
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
          window.removeEventListener('pointercancel', handlePointerCancel);
        };
      }
    },
    [clearOverlayClickSuppression, endGesture, isOpen, resetGesture, updateGesture],
  );

  const edgeZoneProps = useMemo(
    () => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) =>
        startGesture(event, 'edge'),
    }),
    [startGesture],
  );

  const drawerGestureProps = useMemo(
    () => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) =>
        startGesture(event, 'drawer'),
    }),
    [startGesture],
  );

  return {
    canUseEdgeZone: isMobileViewport && !isOpen && !isDragging,
    drawerGestureProps,
    edgeZoneOffset,
    edgeZoneProps,
    handleOverlayClick: () => {
      if (shouldIgnoreOverlayClickRef.current) {
        clearOverlayClickSuppression();
        return;
      }

      setIsOpen(false);
    },
    isDragging,
    isMobileViewport,
    overlayOpacity,
    shouldLockBodyScroll: isMobileViewport && (isOpen || isDragging || isOverlayVisible),
    shouldShowOverlay: isOverlayVisible,
    x,
  };
}
