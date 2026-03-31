import React from "react";
import { motion } from "framer-motion";
import { Bike, Clock, Calendar, MessageSquare, Trash2, ChevronRight, Settings2, Wallet } from "lucide-react";
import { resolveRideDateValue } from "@/lib/date-utils";
import { RidePaymentAction } from "@/components/ui/ride-payment-action";
import { Ride } from "@/types/rides";
import { PaymentComposition } from "@/components/ui/payment-composition";

interface RideCardProps {
    ride: Ride;
    index: number;
    onEdit: (ride: Ride) => void;
    onDelete: (ride: Ride) => void;
    onChangePaymentStatus: (ride: Ride, status: 'PAID' | 'PENDING') => void | Promise<unknown>;
    isPaymentUpdating: boolean;
}

export const RideCard = React.memo(({ ride, index, onEdit, onDelete, onChangePaymentStatus, isPaymentUpdating }: RideCardProps) => {
    const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);

    return (
        <motion.div
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onEdit(ride)}
            className="p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] border border-border-subtle bg-card-background hover:bg-hover-accent transition-all group flex flex-col gap-4 sm:gap-6 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md"
        >
            <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-icon-info/10 border border-icon-info/10 rounded-xl sm:rounded-2xl text-icon-info group-hover:scale-110 transition-transform flex-shrink-0 shadow-sm">
                    <Bike size={24} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between sm:justify-start gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <h4 className="font-display font-extrabold text-text-primary text-base sm:text-lg truncate tracking-tight flex items-center gap-2">
                                Corrida #{ride.id.split("-")[0]}
                                {Number(ride.paidWithBalance ?? 0) > 0 && (
                                    <div className="p-1.5 bg-brand/10 border border-brand/20 rounded-lg text-brand" title="Uso de Saldo">
                                        <Wallet size={12} strokeWidth={3} />
                                    </div>
                                )}
                            </h4>
                            <RidePaymentAction
                                paymentStatus={ride.paymentStatus}
                                onChangeStatus={(status) => onChangePaymentStatus(ride, status)}
                                isLoading={isPaymentUpdating}
                                size="sm"
                                className="hidden sm:inline-flex flex-shrink-0"
                            />
                        </div>
                        
                        <div className="sm:hidden flex flex-col items-end shrink-0 pt-0.5">
                            <PaymentComposition 
                                size="sm" 
                                totalValue={ride.value}
                                paidWithBalance={ride.paidWithBalance}
                                debtValue={ride.debtValue}
                                showLabel={false}
                                compact={true}
                            />

                            <RidePaymentAction
                                paymentStatus={ride.paymentStatus}
                                onChangeStatus={(status) => onChangePaymentStatus(ride, status)}
                                isLoading={isPaymentUpdating}
                                size="xs"
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-text-secondary block mb-0.5 uppercase tracking-widest opacity-70">Cliente</span>
                        <span className="text-lg font-display font-extrabold text-text-primary block tracking-tight break-words line-clamp-1 group-hover:text-primary transition-colors pr-2">
                            {ride.clientName || "Passageiro"}
                        </span>
                    </div>
                </div>

                {/* Desktop Price & Composition */}
                <div className="hidden sm:flex text-right flex-col items-end shrink-0 outline-none">
                    <PaymentComposition 
                        totalValue={ride.value}
                        paidWithBalance={ride.paidWithBalance}
                        debtValue={ride.debtValue}
                        compact={true}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-widest">
                        <Calendar size={14} className="text-icon-info/50" />
                        {rideDate?.toLocaleDateString("pt-BR") || "Data indisponivel"}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-widest border-l border-border-subtle pl-3 ml-1">
                        <Clock size={14} className="text-icon-info/50" />
                        {rideDate?.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }) || "--:--"}
                    </div>
                    {ride.notes && (
                        <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-xl border border-border-subtle shadow-inner max-w-[150px] sm:max-w-none">
                            <MessageSquare size={14} className="text-text-secondary opacity-50 flex-shrink-0" />
                            <p className="text-[10px] text-text-secondary italic font-medium truncate">
                                &ldquo;{ride.notes}&rdquo;
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-start sm:justify-end gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(ride);
                        }}
                        className="h-10 w-10 bg-icon-destructive/10 hover:bg-icon-destructive text-icon-destructive hover:text-white rounded-xl transition-all active:scale-95 flex items-center justify-center border border-icon-destructive/10 shadow-sm"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(ride);
                        }}
                        className="h-10 w-10 flex items-center justify-center bg-secondary/10 hover:bg-secondary/20 border border-border-subtle rounded-xl text-text-secondary hover:text-text-primary transition-all active:scale-95 shadow-sm"
                        title="Editar"
                    >
                        <Settings2 size={18} />
                    </button>
                    <div className="h-10 w-10 flex items-center justify-center bg-secondary/10 border border-border-subtle rounded-xl text-text-secondary shadow-inner">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

RideCard.displayName = "RideCard";
