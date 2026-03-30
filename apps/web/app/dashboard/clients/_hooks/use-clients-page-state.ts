'use client';

import { useState } from 'react';
import { type Client, type Ride } from '@/types/rides';

export function useClientsPageState() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isRideModalOpen, setIsRideModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCloseDebtConfirmOpen, setIsCloseDebtConfirmOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [rideToEdit, setRideToEdit] = useState<Ride | null>(null);
  const [rideToDelete, setRideToDelete] = useState<Ride | null>(null);

  const openNewClientModal = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const openQuickRideModal = (client: Client) => {
    setSelectedClient(client);
    setRideToEdit(null);
    setIsRideModalOpen(true);
  };

  const openClientHistory = (client: Client) => {
    setSelectedClient(client);
  };

  const openEditRideModal = (ride: Ride) => {
    setRideToEdit(ride);
    setIsRideModalOpen(true);
  };

  const closeClientModal = () => {
    setIsClientModalOpen(false);
    setClientToEdit(null);
  };

  const closeRideModal = () => {
    setIsRideModalOpen(false);
    setRideToEdit(null);
  };

  return {
    selectedClient,
    setSelectedClient,
    isRideModalOpen,
    setIsRideModalOpen,
    isClientModalOpen,
    setIsClientModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isCloseDebtConfirmOpen,
    setIsCloseDebtConfirmOpen,
    clientToEdit,
    rideToEdit,
    rideToDelete,
    setRideToDelete,
    openNewClientModal,
    openEditClientModal,
    openQuickRideModal,
    openClientHistory,
    openEditRideModal,
    closeClientModal,
    closeRideModal,
  };
}
