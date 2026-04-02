import React from "react";
import { motion } from "framer-motion";
import { Bike, Calendar, Check, ChevronDown, LoaderCircle, MapPin, Pencil, Trash2, Wallet } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveRideDateValue } from "@/lib/date-utils";
import { Ride } from "@/types/rides";
import { cn, formatCurrency } from "@/lib/utils";

interface RideCardProps {
    ride: Ride;
    onEdit: (ride: Ride) => void;
    onDelete: (ride: Ride) => void;
    onChangePaymentStatus: (ride: Ride, status: 'PAID' | 'PENDING') => void | Promise<unknown>;
    isPaymentUpdating: boolean;
}

export const RideCard = React.memo(({ ride, onEdit, onDelete, onChangePaymentStatus, isPaymentUpdating }: RideCardProps) => {
    const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);
    const rideLabel = `Corrida #${ride.id.split("-")[0]}`;
    const clientName = ride.clientName || "Passageiro";
    const hasBalanceUsage = Number(ride.paidWithBalance ?? 0) > 0;
    const location = ride.location?.trim();
    const isPaid = ride.paymentStatus === "PAID";

    const handleStatusChange = (status: "PAID" | "PENDING") => {
        if (ride.paymentStatus === status || isPaymentUpdating) {
            return;
        }

        void onChangePaymentStatus(ride, status);
    };

    return (
        <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="group flex h-full flex-col gap-4 rounded-[1.75rem] border border-border-subtle bg-card-background p-4 shadow-sm transition-all hover:bg-hover-accent hover:shadow-md sm:rounded-[2rem] sm:gap-5 sm:p-5"
        >
            <div className="flex items-start gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-icon-info/15 bg-icon-info/10 text-icon-info shadow-sm transition-transform group-hover:scale-[1.03]">
                    <Bike size={24} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary/70">
                                {rideLabel}
                            </p>
                            <div className="mt-1 flex min-w-0 items-center gap-2">
                                <h4 className="min-w-0 flex-1 truncate font-display text-lg font-extrabold tracking-tight text-text-primary transition-colors group-hover:text-primary sm:text-xl">
                                    {clientName}
                                </h4>
                                {hasBalanceUsage ? (
                                    <span
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand"
                                        title="Uso de saldo"
                                    >
                                        <Wallet size={13} strokeWidth={2.4} />
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="shrink-0 text-right">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary/70">
                                Valor
                            </p>
                            <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
                                {formatCurrency(ride.value)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border-subtle/80 bg-secondary/5 px-3 py-2.5">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3 text-sm font-semibold text-text-primary">
                        <div className="flex shrink-0 items-center gap-2">
                            <Calendar size={15} className="shrink-0 text-icon-info/70" />
                            <span>
                                {rideDate?.toLocaleDateString("pt-BR") || "Data indisponivel"}
                            </span>
                        </div>

                        {location ? (
                            <div className="flex min-w-0 flex-1 items-center gap-2 border-l border-border-subtle pl-3 text-text-secondary">
                                <MapPin size={15} className="shrink-0 text-icon-info/60" />
                                <span className="truncate">{location}</span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 border-t border-border-subtle pt-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-secondary/10 text-text-secondary transition-all hover:bg-secondary/20 hover:text-text-primary active:scale-95"
                            title="Abrir acoes da corrida"
                            aria-label="Abrir menu de acoes da corrida"
                        >
                            <ChevronDown size={16} />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="start"
                        className="min-w-36 rounded-2xl border-border-subtle bg-card-background p-1.5"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault();
                                onEdit(ride);
                            }}
                            className="rounded-xl font-medium text-text-primary"
                        >
                            <Pencil className="text-icon-info" size={14} />
                            Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={(event) => {
                                event.preventDefault();
                                onDelete(ride);
                            }}
                            className="rounded-xl font-medium"
                        >
                            <Trash2 size={14} />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <button
                    type="button"
                    onClick={() => {
                        handleStatusChange("PAID");
                    }}
                    disabled={isPaymentUpdating}
                    className={cn(
                        "flex min-h-10 w-full items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[8px] font-black uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-70",
                        isPaid
                            ? "border-icon-success bg-icon-success text-white shadow-lg shadow-icon-success/20"
                            : "border-icon-success/20 bg-icon-success/10 text-icon-success hover:bg-icon-success/20",
                    )}
                    title="Marcar corrida como paga"
                >
                    {isPaymentUpdating && isPaid ? (
                        <LoaderCircle className="size-3 animate-spin" />
                    ) : (
                        <Check className="size-3" />
                    )}
                    Pago
                </button>

                <button
                    type="button"
                    onClick={() => {
                        handleStatusChange("PENDING");
                    }}
                    disabled={isPaymentUpdating}
                    className={cn(
                        "flex min-h-10 w-full items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[8px] font-black uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-70",
                        !isPaid
                            ? "border-icon-warning bg-icon-warning text-white shadow-lg shadow-icon-warning/20"
                            : "border-icon-warning/25 bg-icon-warning/10 text-icon-warning hover:bg-icon-warning/20",
                    )}
                    title="Marcar corrida como pendente"
                >
                    {isPaymentUpdating && !isPaid ? (
                        <LoaderCircle className="size-3 animate-spin" />
                    ) : (
                        <span className="size-2 rounded-full bg-current" />
                    )}
                    Pendente
                </button>
            </div>
        </motion.div>
    );
});

RideCard.displayName = "RideCard";
