"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Client, type Ride, type ClientBalance } from "@/types/rides";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { ClientDetailsHeader } from "@/components/client-details-drawer/client-details-header";
import { ClientFinancePanel } from "@/components/client-details-drawer/client-finance-panel";
import { ClientRidesHistory } from "@/components/client-details-drawer/client-rides-history";

interface ClientDetailsDrawerProps {
    client: Client | null;
    rides: Ride[];
    balance: ClientBalance | null;
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    isSettling: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onNewRide: () => void;
    onCloseDebt: () => void;
    onAddPayment: () => void;
    onGeneratePDF: () => void;
    onGenerateExcel: () => void;
    onDeleteClient: () => void;
    onEditRide: (ride: Ride) => void;
    onDeleteRide: (ride: Ride) => void;
    onChangePaymentStatus: (ride: Ride, status: 'PAID' | 'PENDING') => void | Promise<unknown>;
    isPaymentUpdating: (rideId: string) => boolean;
    fetchNextPage: () => void;
}

export function ClientDetailsDrawer({
    client,
    rides,
    balance,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isSettling,
    isDeleting,
    onClose,
    onNewRide,
    onCloseDebt,
    onAddPayment,
    onGeneratePDF,
    onGenerateExcel,
    onDeleteClient,
    onEditRide,
    onDeleteRide,
    onChangePaymentStatus,
    isPaymentUpdating,
    fetchNextPage,
}: ClientDetailsDrawerProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useBodyScrollLock(!!client);

    if (!client) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-overlay-background backdrop-blur-sm"
                />
                <motion.div
                    ref={scrollContainerRef}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-drawer-background border-l border-border w-full max-w-xl relative z-10 shadow-2xl h-screen overflow-y-auto scrollbar-hide"
                >
                    <div className="p-8 lg:p-12 space-y-10">
                        <ClientDetailsHeader client={client} onClose={onClose} />

                        <ClientFinancePanel
                            balance={balance}
                            isSettling={isSettling}
                            isDeleting={isDeleting}
                            onNewRide={onNewRide}
                            onDeleteClient={onDeleteClient}
                            onAddPayment={onAddPayment}
                            onGeneratePDF={onGeneratePDF}
                            onGenerateExcel={onGenerateExcel}
                            onCloseDebt={onCloseDebt}
                        />

                        <ClientRidesHistory
                            rides={rides}
                            isLoading={isLoading}
                            isFetchingNextPage={isFetchingNextPage}
                            hasNextPage={hasNextPage}
                            fetchNextPage={fetchNextPage}
                            containerRef={scrollContainerRef}
                            onEditRide={onEditRide}
                            onDeleteRide={onDeleteRide}
                            onChangePaymentStatus={onChangePaymentStatus}
                            isPaymentUpdating={isPaymentUpdating}
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
