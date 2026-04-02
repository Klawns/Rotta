"use client";

import { ConfirmModal } from "@/components/confirm-modal";
import { RideModal } from "@/components/ride-modal";
import { useRidesPageController } from "./_hooks/use-rides-page-controller";
import { FrequentClients } from "./components/frequent-clients";
import { RidesFilters } from "./components/rides-filters";
import { RidesHeader } from "./components/rides-header";
import { RidesListContainer } from "./components/rides-list";

export default function RidesPage() {
    const page = useRidesPageController();

    return (
        <>
            <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide"
                data-scroll-lock-root="true"
            >
                <div className="mx-auto flex w-full max-w-[1400px] flex-col pb-8">
                    <div className="flex shrink-0 flex-col gap-8 pb-8">
                        <RidesHeader onNewRide={page.header.onNewRide} />

                        <FrequentClients
                            clients={page.frequentClients.clients}
                            isLoading={page.frequentClients.isLoading}
                            onSelectClient={page.frequentClients.onSelectClient}
                        />

                        <RidesFilters {...page.filters} />
                    </div>

                    <RidesListContainer {...page.ridesList} />
                </div>
            </div>

            <RideModal {...page.rideDialog} />

            <ConfirmModal
                isOpen={page.deleteDialog.isOpen}
                onClose={page.deleteDialog.onClose}
                onConfirm={page.deleteDialog.onConfirm}
                title="Excluir Corrida"
                description="Tem certeza que deseja excluir esta corrida? Esta acao e irreversivel."
                variant="danger"
                isLoading={page.deleteDialog.isLoading}
            />
        </>
    );
}
