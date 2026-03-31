"use client";

import { ClientDetailsDrawer } from "@/components/client-details-drawer";
import { useRidePaymentStatus } from "@/hooks/use-ride-payment-status";

// Services & Types
import { Client } from "@/types/rides";

// Hooks
import { useClients } from "./_hooks/use-clients";
import { useClientActions } from "./_hooks/use-client-actions";
import { useClientDetailsData } from "./_hooks/use-client-details-data";
import { useClientsPageState } from "./_hooks/use-clients-page-state";

// Components
import { ClientHeader } from "./_components/client-header";
import { ClientListSection } from "./_components/client-list-section";
import { ClientModals } from "./_components/client-modals";

export default function ClientsPage() {
    const paymentStatus = useRidePaymentStatus();
    // Data Hooks
    const { 
        clients, search, setSearch, isLoading, isFetching,
        hasNextPage, isFetchingNextPage, fetchNextPage, total, fetchClients 
    } = useClients();
    
    const state = useClientsPageState();
    
    const {
        rides, balance, isLoading: isDetailsLoading,
        hasNextPage: hasNextRidesPage,
        isFetchingNextPage: isFetchingNextRidesPage,
        fetchNextPage: fetchNextRidesPage,
        refreshDetails, generatePDF, generateExcel
    } = useClientDetailsData(state.selectedClient);

    const {
        isSettling, isDeleting, isDeletingRide,
        togglePin, closeDebt, deleteClient, deleteRide
    } = useClientActions();

    const handlePinClient = async (client: Client) => {
        const success = await togglePin(client.id, !!client.isPinned);
        if (success) fetchClients();
    };

    const onConfirmDeleteClient = async () => {
        if (!state.selectedClient) return;
        const success = await deleteClient(state.selectedClient.id);
        if (success) {
            state.setSelectedClient(null);
            fetchClients();
            state.setIsDeleteConfirmOpen(false);
        }
    };

    const onConfirmCloseDebt = async () => {
        if (!state.selectedClient) return;
        const success = await closeDebt(state.selectedClient.id);
        if (success) {
            refreshDetails();
            state.setIsCloseDebtConfirmOpen(false);
        }
    };

    const onConfirmDeleteRide = async () => {
        if (!state.rideToDelete) return;
        const success = await deleteRide(state.rideToDelete.id);
        if (success) {
            state.setRideToDelete(null);
            refreshDetails();
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <ClientHeader onNewClient={state.openNewClientModal} />

            <ClientListSection 
                clients={clients}
                isLoading={isLoading}
                isFetching={isFetching}
                search={search}
                onSearchChange={setSearch}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={fetchNextPage}
                total={total}
                onEdit={state.openEditClientModal}
                onPin={handlePinClient}
                onQuickRide={state.openQuickRideModal}
                onViewHistory={state.openClientHistory}
            />

            <ClientDetailsDrawer
                client={state.selectedClient}
                rides={rides}
                balance={balance}
                isLoading={isDetailsLoading}
                hasNextPage={hasNextRidesPage}
                isFetchingNextPage={isFetchingNextRidesPage}
                fetchNextPage={fetchNextRidesPage}
                isSettling={isSettling}
                isDeleting={isDeleting}
                onClose={() => state.setSelectedClient(null)}
                onNewRide={() => state.setIsRideModalOpen(true)}
                onCloseDebt={() => state.setIsCloseDebtConfirmOpen(true)}
                onAddPayment={() => state.setIsPaymentModalOpen(true)}
                onGeneratePDF={generatePDF}
                onGenerateExcel={generateExcel}
                onDeleteClient={() => state.setIsDeleteConfirmOpen(true)}
                onEditRide={state.openEditRideModal}
                onDeleteRide={state.setRideToDelete}
                onChangePaymentStatus={paymentStatus.setPaymentStatus}
                isPaymentUpdating={paymentStatus.isUpdatingRide}
            />

            <ClientModals 
                selectedClient={state.selectedClient}
                clientToEdit={state.clientToEdit}
                rideToEdit={state.rideToEdit}
                rideToDelete={state.rideToDelete}
                isClientModalOpen={state.isClientModalOpen}
                isRideModalOpen={state.isRideModalOpen}
                isPaymentModalOpen={state.isPaymentModalOpen}
                isDeleteConfirmOpen={state.isDeleteConfirmOpen}
                isCloseDebtConfirmOpen={state.isCloseDebtConfirmOpen}
                isSettling={isSettling}
                isDeleting={isDeleting}
                isDeletingRide={isDeletingRide}
                onCloseClientModal={state.closeClientModal}
                onCloseRideModal={state.closeRideModal}
                onClosePaymentModal={() => state.setIsPaymentModalOpen(false)}
                onCloseDeleteConfirm={() => state.setIsDeleteConfirmOpen(false)}
                onCloseCloseDebtConfirm={() => state.setIsCloseDebtConfirmOpen(false)}
                onCloseDeleteRideConfirm={() => state.setRideToDelete(null)}
                onConfirmDeleteClient={onConfirmDeleteClient}
                onConfirmCloseDebt={onConfirmCloseDebt}
                onConfirmDeleteRide={onConfirmDeleteRide}
                onSuccessClient={fetchClients}
                onSuccessPayment={refreshDetails}
                onSuccessRide={refreshDetails}
            />
        </div>
    );
}
