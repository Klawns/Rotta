"use client";

import { QueryErrorBoundary } from "@/components/query-error-boundary";
import { DashboardDesktopView } from "./_components/desktop-view";
import { DashboardMobileView } from "./_components/mobile-view";
import { DashboardModals } from "./_components/dashboard-modals";
import { useDashboard } from "./_hooks/use-dashboard";

export default function DashboardPage() {
    const dashboard = useDashboard();

    return (
        <QueryErrorBoundary message="Nao foi possivel carregar seu dashboard. Por favor, tente novamente.">
            {dashboard.isMobile ? (
                <DashboardMobileView
                    user={dashboard.user}
                    stats={dashboard.mobileStats}
                    onRideCreated={dashboard.refreshDashboard}
                    trial={dashboard.trial}
                />
            ) : (
                <div className="relative">
                    <DashboardDesktopView
                        user={dashboard.user}
                        stats={dashboard.desktopStats}
                        rides={dashboard.rideActions}
                        trial={dashboard.trial}
                    />

                    <DashboardModals
                        isRideModalOpen={dashboard.modals.isRideModalOpen}
                        setIsRideModalOpen={dashboard.modals.setIsRideModalOpen}
                        rideToEdit={dashboard.modals.rideToEdit}
                        setRideToEdit={dashboard.modals.setRideToEdit}
                        rideToDelete={dashboard.modals.rideToDelete}
                        setRideToDelete={dashboard.modals.setRideToDelete}
                        isDeletingRide={dashboard.modals.isDeletingRide}
                        onDeleteConfirm={dashboard.modals.confirmRideDelete}
                        onSuccess={dashboard.refreshDashboard}
                    />
                </div>
            )}
        </QueryErrorBoundary>
    );
}
