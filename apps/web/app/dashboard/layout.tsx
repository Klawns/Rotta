"use client";

import type { CSSProperties } from "react";
import { QueryErrorState } from "@/components/query-error-state";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { BottomNav } from "./_components/layout/bottom-nav";
import { MobileHeader } from "./_components/layout/mobile-header";
import { PopupsManager } from "./_components/layout/popups-manager";
import { Sidebar } from "./_components/layout/sidebar";
import { StatusBanners } from "./_components/layout/status-banners";
import { useLayoutAuth } from "./_hooks/use-layout-auth";
import { useLayoutSubscription } from "./_hooks/use-layout-subscription";
import { useSidebarState } from "./_hooks/use-sidebar-state";
import { DASHBOARD_MOBILE_NAV_PADDING } from "./_lib/dashboard-navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading, isAuthenticated, isAuthError, authError, verify } = useAuth();

    useLayoutAuth({ user, isLoading, isAuthenticated, isAuthError });
    const sub = useLayoutSubscription(user);
    const navigation = useSidebarState(user);
    const layoutStyle = {
        "--dashboard-mobile-nav-padding": DASHBOARD_MOBILE_NAV_PADDING,
    } as CSSProperties;

    if (isAuthError && authError) {
        return (
            <div className="min-h-dvh bg-background p-6">
                <QueryErrorState
                    error={authError}
                    title="Nao foi possivel validar sua sessao"
                    description="A autenticacao falhou por uma indisponibilidade operacional. Tente novamente."
                    onRetry={() => {
                        void verify();
                    }}
                    fullHeight
                />
            </div>
        );
    }

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-dvh bg-background flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div
            className="flex h-dvh min-h-dvh overflow-hidden overflow-x-clip bg-background text-foreground"
            style={layoutStyle}
        >
            <PopupsManager
                user={user}
                isLoading={isLoading}
                showExpiringPopup={sub.showExpiringPopup}
                daysRemaining={sub.daysRemaining}
            />

            <Sidebar
                isOpen={navigation.isDesktopSidebarOpen}
                setIsOpen={navigation.setIsDesktopSidebarOpen}
                user={user}
                menuItems={navigation.menuItems}
                logout={logout}
            />

            <main
                data-dashboard-scroll-root="true"
                className={cn(
                    "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden scrollbar-hide",
                    navigation.isDesktopSidebarOpen ? "lg:ml-72" : "lg:ml-[88px]",
                )}
            >
                <StatusBanners
                    isExpired={sub.isExpired}
                    isExpiringSoon={sub.isExpiringSoon}
                    daysRemaining={sub.daysRemaining}
                    trial={sub.trial}
                />

                <MobileHeader
                    onOpenNavigationMenu={navigation.toggleMobileNavigation}
                    isNavigationMenuOpen={navigation.isMobileNavigationOpen}
                    userName={user?.name}
                />

                <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 pb-[var(--dashboard-mobile-nav-padding)] pt-4 sm:px-6 sm:pt-6 lg:p-10">
                    {children}
                </div>
            </main>

            <BottomNav
                primaryItems={navigation.primaryMenuItems}
                secondaryItems={navigation.secondaryMenuItems}
                user={user}
                isSheetOpen={navigation.isMobileNavigationOpen}
                onOpenChange={navigation.setIsMobileNavigationOpen}
                onLogout={logout}
            />
        </div>
    );
}
