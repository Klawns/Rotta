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
        <div className="p-4 md:p-8 space-y-8 pb-32 max-w-[1400px] mx-auto min-h-screen">
            <RidesHeader onNewRide={page.header.onNewRide} />

            <FrequentClients
                clients={page.frequentClients.clients}
                isLoading={page.frequentClients.isLoading}
                onSelectClient={page.frequentClients.onSelectClient}
            />

            <RidesFilters {...page.filters} />

            <RidesListContainer {...page.ridesList} />

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
        </div>
    );
}
