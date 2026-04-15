"use client";

import { useCallback, useMemo, useState } from "react";
import { type User } from "@/hooks/use-auth";
import {
  getDashboardNavigationItems,
  type DashboardNavItem,
} from "../_lib/dashboard-navigation";

export type MenuItem = DashboardNavItem;

export function useSidebarState(user: User | null) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  const menuItems = useMemo(() => getDashboardNavigationItems(user), [user]);
  const primaryMenuItems = useMemo(
    () => menuItems.filter((item) => item.slot === "primary"),
    [menuItems],
  );
  const secondaryMenuItems = useMemo(
    () => menuItems.filter((item) => item.slot === "secondary"),
    [menuItems],
  );

  const toggleDesktopSidebar = useCallback(() => {
    setIsDesktopSidebarOpen((previousState) => !previousState);
  }, []);

  const closeDesktopSidebar = useCallback(() => {
    setIsDesktopSidebarOpen(false);
  }, []);

  const toggleMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen((previousState) => !previousState);
  }, []);

  const closeMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(false);
  }, []);

  return {
    isDesktopSidebarOpen,
    setIsDesktopSidebarOpen,
    toggleDesktopSidebar,
    closeDesktopSidebar,
    isMobileNavigationOpen,
    setIsMobileNavigationOpen,
    toggleMobileNavigation,
    closeMobileNavigation,
    menuItems,
    primaryMenuItems,
    secondaryMenuItems,
  };
}
