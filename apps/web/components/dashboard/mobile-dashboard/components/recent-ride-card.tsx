"use client";

import { motion } from "framer-motion";
import { Check, ChevronDown, LoaderCircle, MapPin, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveRideDateValue } from "@/lib/date-utils";
import { cn, formatCurrency } from "@/lib/utils";
import { Ride } from "../types";

interface RecentRideCardProps {
    ride: Ride;
    onEdit: (ride: Ride) => void;
    onDelete: (ride: Ride) => void;
    onChangePaymentStatus: (ride: Ride, status: "PAID" | "PENDING") => void | Promise<unknown>;
    isPaymentUpdating: boolean;
}

export function RecentRideCard({
    ride,
    onEdit,
    onDelete,
    onChangePaymentStatus,
    isPaymentUpdating,
}: RecentRideCardProps) {
    const rideLocation = ride.location?.trim() || "Central";
    const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);
    const isPaid = ride.paymentStatus === "PAID";

    const handleStatusChange = (status: "PAID" | "PENDING") => {
        if (ride.paymentStatus === status || isPaymentUpdating) {
            return;
        }

        void onChangePaymentStatus(ride, status);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex min-h-[124px] flex-col gap-2.5 rounded-[1.75rem] border border-border-subtle bg-card-background px-3 py-2.5 shadow-sm transition-all"
        >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <div className="shrink-0 self-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border-subtle bg-secondary/10 text-text-secondary transition-all hover:bg-secondary/20 hover:text-text-primary active:scale-90"
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
                </div>

                <div className="min-w-0 pt-0.5">
                    <p className="truncate text-[16px] font-display font-extrabold tracking-tight text-text-primary">
                        {ride.clientName || "Cliente"}
                    </p>

                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-text-secondary">
                        <MapPin size={12} className="shrink-0 text-primary/60" />
                        <span className="truncate">
                            {rideLocation}
                            {rideDate
                                ? ` • ${rideDate.toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                  })}`
                                : ""}
                        </span>
                    </div>
                </div>

                <div className="shrink-0 pt-0.5 text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-text-secondary/70">
                        Total
                    </p>
                    <p className="mt-0.5 font-display text-[21px] font-black tracking-tight text-text-primary">
                        {formatCurrency(ride.value)}
                    </p>
                </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        handleStatusChange("PAID");
                    }}
                    disabled={isPaymentUpdating}
                    className={cn(
                        "flex min-h-7 items-center justify-center gap-1.5 rounded-2xl border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-70",
                        isPaid
                            ? "border-icon-success bg-icon-success text-white shadow-lg shadow-icon-success/20"
                            : "border-icon-success/20 bg-icon-success/10 text-icon-success hover:bg-icon-success/20",
                    )}
                    title="Marcar corrida como paga"
                >
                    {isPaymentUpdating && isPaid ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                        <Check className="size-3.5" />
                    )}
                    Pago
                </button>

                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        handleStatusChange("PENDING");
                    }}
                    disabled={isPaymentUpdating}
                    className={cn(
                        "flex min-h-7 items-center justify-center gap-1.5 rounded-2xl border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] transition-all disabled:cursor-not-allowed disabled:opacity-70",
                        !isPaid
                            ? "border-icon-warning bg-icon-warning text-white shadow-lg shadow-icon-warning/20"
                            : "border-icon-warning/25 bg-icon-warning/10 text-icon-warning hover:bg-icon-warning/20",
                    )}
                    title="Marcar corrida como pendente"
                >
                    {isPaymentUpdating && !isPaid ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                        <span className="size-2.5 rounded-full bg-current" />
                    )}
                    Pendente
                </button>
            </div>
        </motion.div>
    );
}
