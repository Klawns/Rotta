"use client";

import { useState } from "react";
import { ClientDetailsDrawer } from "@/components/client-details-drawer";

// Services & Types
import { Client } from "./_services/client-service";
import { Ride } from "./_services/ride-service";

// Hooks
import { useClients } from "./_hooks/use-clients";
import { useClientActions } from "./_hooks/use-client-actions";
import { useClientDetailsData } from "./_hooks/use-client-details-data";

// Components
import { ClientHeader } from "./_components/client-header";
import { ClientListSection } from "./_components/client-list-section";
import { ClientModals } from "./_components/client-modals";

export default function ClientsPage() {
    // Data Hooks
    const { 
        clients, search, setSearch, isLoading, 
        page, setPage, total, limit, fetchClients 
    } = useClients();
    
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    
    const {
        rides, balance, ridePage, setRidePage, rideTotal, rideLimit,
        refreshDetails, generatePDF
    } = useClientDetailsData(selectedClient);

    const {
        isSettling, isDeleting, isDeletingRide,
        togglePin, closeDebt, deleteClient, deleteRide
    } = useClientActions();

    // Modal Visibility States
    const [isRideModalOpen, setIsRideModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isCloseDebtConfirmOpen, setIsCloseDebtConfirmOpen] = useState(false);
    
    // Editing/Deleting States
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [rideToEdit, setRideToEdit] = useState<any | null>(null);
    const [rideToDelete, setRideToDelete] = useState<Ride | null>(null);

    // Handlers
    const handleNewClient = () => {
        setClientToEdit(null);
        setIsClientModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setClientToEdit(client);
        setIsClientModalOpen(true);
    };

    const handleEditRide = (ride: any) => {
        setRideToEdit(ride);
        setIsRideModalOpen(true);
    };

    const handlePinClient = async (client: Client) => {
        const success = await togglePin(client.id, client.isPinned);
        if (success) fetchClients();
    };

    const onConfirmDeleteClient = async () => {
        if (!selectedClient) return;
        const success = await deleteClient(selectedClient.id);
        if (success) {
            setSelectedClient(null);
            fetchClients();
            setIsDeleteConfirmOpen(false);
        }
    };

    const onConfirmCloseDebt = async () => {
        if (!selectedClient) return;
        const success = await closeDebt(selectedClient.id);
        if (success) {
            refreshDetails();
            setIsCloseDebtConfirmOpen(false);
        }
    };

    const onConfirmDeleteRide = async () => {
        if (!rideToDelete) return;
        const success = await deleteRide(rideToDelete.id);
        if (success) {
            setRideToDelete(null);
            refreshDetails();
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <ClientHeader onNewClient={handleNewClient} />

            <ClientListSection 
                clients={clients}
                isLoading={isLoading}
                search={search}
                onSearchChange={setSearch}
                page={page}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onEdit={handleEditClient}
                onPin={handlePinClient}
                onQuickRide={(client) => {
                    setSelectedClient(client);
                    setIsRideModalOpen(true);
                }}
                onViewHistory={setSelectedClient}
            />

            <ClientDetailsDrawer
                client={selectedClient}
                rides={rides}
                balance={balance}
                ridePage={ridePage}
                rideTotal={rideTotal}
                rideLimit={rideLimit}
                isSettling={isSettling}
                isDeleting={isDeleting}
                onClose={() => setSelectedClient(null)}
                onNewRide={() => setIsRideModalOpen(true)}
                onCloseDebt={() => setIsCloseDebtConfirmOpen(true)}
                onAddPayment={() => setIsPaymentModalOpen(true)}
                onGeneratePDF={generatePDF}
                onDeleteClient={() => setIsDeleteConfirmOpen(true)}
                onEditRide={handleEditRide}
                onDeleteRide={(ride) => setRideToDelete(ride as Ride)}
                onPageChange={setRidePage}
            />

            <ClientModals 
                selectedClient={selectedClient}
                clientToEdit={clientToEdit}
                rideToEdit={rideToEdit}
                rideToDelete={rideToDelete}
                isClientModalOpen={isClientModalOpen}
                isRideModalOpen={isRideModalOpen}
                isPaymentModalOpen={isPaymentModalOpen}
                isDeleteConfirmOpen={isDeleteConfirmOpen}
                isCloseDebtConfirmOpen={isCloseDebtConfirmOpen}
                isSettling={isSettling}
                isDeleting={isDeleting}
                isDeletingRide={isDeletingRide}
                onCloseClientModal={() => {
                    setIsClientModalOpen(false);
                    setClientToEdit(null);
                }}
                onCloseRideModal={() => {
                    setIsRideModalOpen(false);
                    setRideToEdit(null);
                }}
                onClosePaymentModal={() => setIsPaymentModalOpen(false)}
                onCloseDeleteConfirm={() => setIsDeleteConfirmOpen(false)}
                onCloseCloseDebtConfirm={() => setIsCloseDebtConfirmOpen(false)}
                onCloseDeleteRideConfirm={() => setRideToDelete(null)}
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
