"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";
import { resolveRideDateValue } from "@/lib/date-utils";
import { PaymentComposition } from "@/components/ui/payment-composition";
import { RidePaymentAction } from "@/components/ui/ride-payment-action";
import { type RideViewModel } from "@/types/rides";

interface RecentActivityItemProps {
    ride: RideViewModel;
    onEditRide: (ride: RideViewModel) => void;
    onDeleteRide: (ride: RideViewModel) => void;
    onChangePaymentStatus: (ride: RideViewModel, status: 'PAID' | 'PENDING') => void | Promise<unknown>;
    isPaymentUpdating: boolean;
}

export function RecentActivityItem({
    ride,
    onEditRide,
    onDeleteRide,
    onChangePaymentStatus,
    isPaymentUpdating,
}: RecentActivityItemProps) {
    const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);

    return (
        <div className="group relative mb-4 flex items-center gap-4 rounded-2xl border border-transparent p-4 transition-all hover:border-border-subtle hover:bg-hover-accent">
            <div className="rounded-xl border border-icon-info/10 bg-icon-info/10 p-3 text-icon-info transition-colors group-hover:bg-icon-info/20">
                <Calendar size={20} />
            </div>

            <div className="min-w-0 flex-1">
                <h4 className="truncate font-bold tracking-tight text-text-primary">
                    ID: {ride.id?.split("-")[0] || "---"}
                </h4>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    {rideDate?.toLocaleString("pt-BR") || "Data indisponivel"}
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <PaymentComposition
                        size="sm"
                        totalValue={ride.value}
                        paidWithBalance={ride.paidWithBalance}
                        debtValue={ride.debtValue}
                        compact={true}
                        showLabel={false}
                    />
                    <RidePaymentAction
                        paymentStatus={ride.paymentStatus}
                        onChangeStatus={(status) => onChangePaymentStatus(ride, status)}
                        isLoading={isPaymentUpdating}
                        size="xs"
                        className="mt-1"
                    />
                </div>

                <div className="absolute right-4 flex scale-95 items-center gap-2 rounded-xl border border-border-subtle bg-card-background/90 p-1 opacity-0 shadow-lg backdrop-blur-sm transition-all group-hover:scale-100 group-hover:opacity-100">
                    <button
                        onClick={() => onEditRide(ride)}
                        className="rounded-lg border border-icon-info/10 bg-icon-info/5 p-2 text-icon-info transition-all hover:bg-icon-info hover:text-white active:scale-90"
                        title="Editar"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => onDeleteRide(ride)}
                        className="rounded-lg border border-icon-destructive/10 bg-icon-destructive/5 p-2 text-icon-destructive transition-all hover:bg-icon-destructive hover:text-white active:scale-90"
                        title="Excluir"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
