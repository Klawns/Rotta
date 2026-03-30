"use client";

import { motion } from "framer-motion";
import { Camera, FileText, MapPin, Pencil, Trash2 } from "lucide-react";
import { resolveRideDateValue } from "@/lib/date-utils";
import { PaymentComposition } from "@/components/ui/payment-composition";
import { Ride } from "../types";

interface RecentRideCardProps {
    ride: Ride;
    onEdit: (ride: Ride) => void;
    onDelete: (ride: Ride) => void;
}

export function RecentRideCard({
    ride,
    onEdit,
    onDelete,
}: RecentRideCardProps) {
    const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onEdit(ride)}
            className="group relative flex min-h-[90px] cursor-pointer items-center justify-between rounded-2xl border border-border-subtle bg-muted/50 p-4 transition-all active:bg-hover-accent"
        >
            <div className="flex max-w-[65%] items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary transition-all group-active:scale-95">
                    <Pencil size={14} />
                </div>
                <div className="flex min-w-0 flex-col">
                    <div className="mb-0.5 flex items-center gap-2">
                        <span className="truncate text-sm font-display font-bold text-text-primary">
                            {ride.clientName || "Cliente"}
                        </span>
                        {ride.notes || ride.photo ? (
                            <div className="flex gap-1.5 opacity-40">
                                {ride.notes ? <FileText size={10} /> : null}
                                {ride.photo ? <Camera size={10} /> : null}
                            </div>
                        ) : null}
                    </div>
                    <span className="flex items-center gap-1.5 truncate text-[10px] font-medium text-muted-foreground">
                        <MapPin size={10} className="text-primary/50" />
                        {ride.location || "Central"} -{" "}
                        {rideDate?.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                        }) || "--/--"}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2 pr-2">
                <PaymentComposition
                    totalValue={ride.value}
                    paidWithBalance={ride.paidWithBalance}
                    debtValue={ride.debtValue}
                    compact={true}
                    className="items-end"
                />
                <span
                    className={[
                        "rounded-lg border px-2.5 py-1 text-center text-[9px] font-display font-bold uppercase tracking-widest shadow-sm",
                        ride.paymentStatus === "PAID"
                            ? "border-icon-success/20 bg-icon-success/10 text-icon-success"
                            : "border-icon-warning/20 bg-icon-warning/10 text-icon-warning",
                    ].join(" ")}
                >
                    {ride.paymentStatus === "PAID" ? "Pago" : "Pendente"}
                </span>
            </div>

            <button
                onClick={(event) => {
                    event.stopPropagation();
                    onDelete(ride);
                }}
                className="absolute -bottom-1 -right-1 rounded-full p-2 text-red-500/30 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-90"
            >
                <Trash2 size={12} />
            </button>
        </motion.div>
    );
}
