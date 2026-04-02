"use client";

import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { type ClientBalance, type Client, type Ride } from "@/types/rides";
import { ClientFinancePanel } from "@/components/client-details-drawer/client-finance-panel";
import { ClientDetailsHeader } from "@/components/client-details-drawer/client-details-header";
import { ClientRidesHistory } from "@/components/client-details-drawer/client-rides-history";

interface ClientDetailsDrawerProps {
  client: Client | null;
  rides: Ride[];
  balance: ClientBalance | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  isSettling: boolean;
  isExportingPdf: boolean;
  isExportingExcel: boolean;
  isExportDisabled: boolean;
  onClose: () => void;
  onNewRide: () => void;
  onCloseDebt: () => void;
  onAddPayment: () => void;
  onGeneratePDF: () => void;
  onGenerateExcel: () => void;
  onEditRide: (ride: Ride) => void;
  onDeleteRide: (ride: Ride) => void;
  onChangePaymentStatus: (
    ride: Ride,
    status: "PAID" | "PENDING",
  ) => void | Promise<unknown>;
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
  isExportingPdf,
  isExportingExcel,
  isExportDisabled,
  onClose,
  onNewRide,
  onCloseDebt,
  onAddPayment,
  onGeneratePDF,
  onGenerateExcel,
  onEditRide,
  onDeleteRide,
  onChangePaymentStatus,
  isPaymentUpdating,
  fetchNextPage,
}: ClientDetailsDrawerProps) {
  const drawerScrollContainerRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(!!client);

  return (
    <AnimatePresence mode="wait">
      {client && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 flex h-dvh w-full max-w-xl flex-col overflow-hidden border-l border-border bg-drawer-background shadow-2xl"
          >
            <div
              ref={drawerScrollContainerRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide"
              data-qa="client-drawer-rides"
            >
              <div className="flex min-h-full flex-col gap-6 p-6 lg:gap-8 lg:p-8">
                <div className="space-y-6 lg:space-y-8">
                  <ClientDetailsHeader client={client} onClose={onClose} />

                  <ClientFinancePanel
                    balance={balance}
                    isSettling={isSettling}
                    isExportingPdf={isExportingPdf}
                    isExportingExcel={isExportingExcel}
                    isExportDisabled={isExportDisabled}
                    onNewRide={onNewRide}
                    onAddPayment={onAddPayment}
                    onGeneratePDF={onGeneratePDF}
                    onGenerateExcel={onGenerateExcel}
                    onCloseDebt={onCloseDebt}
                  />
                </div>

                <ClientRidesHistory
                  rides={rides}
                  isLoading={isLoading}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  fetchNextPage={fetchNextPage}
                  containerRef={drawerScrollContainerRef}
                  onEditRide={onEditRide}
                  onDeleteRide={onDeleteRide}
                  onChangePaymentStatus={onChangePaymentStatus}
                  isPaymentUpdating={isPaymentUpdating}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
