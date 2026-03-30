'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import { animate, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isSidebarSwipeMobileViewport,
  isSidebarSwipePointerType,
  MOBILE_SIDEBAR_DRAWER_WIDTH,
  shouldOpenSidebarAfterSwipe,
  getSidebarOverlayOpacity,
} from '../_services/sidebar-swipe-service';
import type { PanInfo } from 'framer-motion';

interface UseSidebarSwipeParams {
  drawerWidth?: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function useSidebarSwipe({
  drawerWidth = MOBILE_SIDEBAR_DRAWER_WIDTH,
  isOpen,
  setIsOpen,
}: UseSidebarSwipeParams) {
  const dragControls = useDragControls();
  const x = useMotionValue(isOpen ? 0 : -drawerWidth);
  const overlayOpacity = useTransform(
    x,
    [-drawerWidth, 0],
    [0, getSidebarOverlayOpacity(1)],
  );
  const [isOverlayVisible, setIsOverlayVisible] = useState(isOpen);
  const [isDragging, setIsDragging] = useState(false);

  const finalizeSwipe = useCallback(
    (nextOpen: boolean) => {
      setIsOpen(nextOpen);
      setIsDragging(false);

      animate(x, nextOpen ? 0 : -drawerWidth, {
        type: 'spring',
        stiffness: 420,
        damping: 38,
        mass: 0.8,
      });
    },
    [drawerWidth, setIsOpen, x],
  );

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
    const unsubscribe = x.on('change', (latestX) => {
      setIsOverlayVisible(latestX > -drawerWidth + 1);
    });

    return () => unsubscribe();
  }, [drawerWidth, x]);

  const startEdgeSwipe = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        !isSidebarSwipeMobileViewport() ||
        !isSidebarSwipePointerType(event.pointerType)
      ) {
        return;
      }

      if (isOpen) {
        return;
      }

      dragControls.start(event, { snapToCursor: false });
    },
    [dragControls, isOpen],
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const nextOpen = shouldOpenSidebarAfterSwipe({
        drawerWidth,
        translateX: x.get(),
        velocityX: info.velocity.x,
      });

      finalizeSwipe(nextOpen);
    },
    [drawerWidth, finalizeSwipe, x],
  );

  const edgeZoneProps = useMemo(
    () => ({
      onPointerDown: startEdgeSwipe,
    }),
    [startEdgeSwipe],
  );

  return {
    dragControls,
    edgeZoneProps,
    handleDragEnd,
    handleDragStart,
    isDragging,
    overlayOpacity,
    shouldShowOverlay: isOverlayVisible,
    x,
  };
}
