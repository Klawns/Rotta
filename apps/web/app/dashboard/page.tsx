"use client";

import { QueryErrorBoundary } from "@/components/query-error-boundary";
import { QueryErrorState } from "@/components/query-error-state";
import { DashboardDesktopView } from "./_components/desktop-view";
import { DashboardMobileView } from "./_components/mobile-view";
import { DashboardModals } from "./_components/dashboard-modals";
import { useDashboard } from "./_hooks/use-dashboard";

export default function DashboardPage() {
    const dashboard = useDashboard();
    const statsError = dashboard.desktopStats.isError
        ? dashboard.desktopStats.error
        : null;

    return (
        <QueryErrorBoundary message="Não foi possível carregar seu dashboard. Por favor, tente novamente.">
            <div className="relative flex min-h-0 flex-1 flex-col">
                <div
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide"
                    data-scroll-lock-root="true"
                >
                    <div className="pb-8">
                        {statsError ? (
                            <QueryErrorState
                                error={statsError}
                                title="Não foi possível atualizar os indicadores do dashboard"
                                description="As métricas não foram carregadas. Os demais dados da tela continuam disponíveis."
                                onRetry={() => {
                                    void dashboard.desktopStats.refetch();
                                }}
                                className="pb-6"
                            />
                        ) : null}

                        {dashboard.isMobile ? (
                            <DashboardMobileView
                                stats={dashboard.mobileStats}
                                onRideCreated={dashboard.desktopStats.refetch}
                                trial={dashboard.trial}
                            />
                        ) : (
                            <DashboardDesktopView
                                user={dashboard.user}
                                stats={dashboard.desktopStats}
                                rides={dashboard.rideActions}
                                trial={dashboard.trial}
                            />
                        )}
                    </div>
                </div>

                {dashboard.isMobile ? null : (
                    <DashboardModals
                        isRideModalOpen={dashboard.modals.isRideModalOpen}
                        setIsRideModalOpen={dashboard.modals.setIsRideModalOpen}
                        rideToEdit={dashboard.modals.rideToEdit}
                        setRideToEdit={dashboard.modals.setRideToEdit}
                        rideToDelete={dashboard.modals.rideToDelete}
                        setRideToDelete={dashboard.modals.setRideToDelete}
                        isDeletingRide={dashboard.modals.isDeletingRide}
                        onDeleteConfirm={dashboard.modals.confirmRideDelete}
                        onSuccess={dashboard.desktopStats.refetch}
                    />
                )}
            </div>
        </QueryErrorBoundary>
    );
}
