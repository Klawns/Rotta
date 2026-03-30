"use client";

import { cn } from "@/lib/utils";
import { PaymentStatus } from "../types";

interface RidePaymentStatusProps {
    paymentStatus: PaymentStatus;
    onChange: (status: PaymentStatus) => void;
}

export function RidePaymentStatus({
    paymentStatus,
    onChange,
}: RidePaymentStatusProps) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card-background p-3 shadow-sm">
            <p className="mb-2 text-[10px] font-display font-bold uppercase text-text-muted">
                Status do Pagamento
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => onChange("PENDING")}
                    className={cn(
                        "flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all",
                        paymentStatus === "PENDING"
                            ? "bg-warning text-white shadow-lg shadow-warning/20"
                            : "bg-muted/50 text-text-muted",
                    )}
                >
                    Pendente
                </button>
                <button
                    onClick={() => onChange("PAID")}
                    className={cn(
                        "flex-1 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all",
                        paymentStatus === "PAID"
                            ? "bg-success text-success-foreground shadow-lg shadow-success/20"
                            : "bg-muted/50 text-text-muted",
                    )}
                >
                    Pago
                </button>
            </div>
        </div>
    );
}
