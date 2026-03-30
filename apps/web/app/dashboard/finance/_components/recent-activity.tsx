"use client";

import { motion } from "framer-motion";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { RecentRide } from "@/services/finance-service";

interface RecentActivityProps {
  rides: RecentRide[];
  isLoading: boolean;
}

function getRideDateLabel(value: unknown) {
  const parsedDate =
    typeof value === "string"
      ? parseISO(value)
      : typeof value === "number"
        ? new Date(value)
        : value instanceof Date
          ? value
          : null;

  if (!parsedDate || !isValid(parsedDate)) {
    return "Data indisponivel";
  }

  return format(parsedDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
}

export function RecentActivity({ rides, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    );
  }

  if (!rides?.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border-subtle bg-muted/20 py-12 text-center font-medium text-text-muted">
        Nenhuma atividade recente registrada
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rides.map((ride, index) => (
        <motion.div
          key={ride.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group flex cursor-pointer items-center justify-between rounded-2xl border border-border-subtle bg-muted/50 p-4 shadow-sm transition-all hover:border-primary/20 hover:bg-hover-accent"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div
              className={cn(
                "flex-shrink-0 rounded-xl p-3",
                ride.paymentStatus === "PAID"
                  ? "bg-icon-success/10 text-icon-success"
                  : "bg-icon-warning/10 text-icon-warning",
              )}
            >
              {ride.paymentStatus === "PAID" ? (
                <CheckCircle2 size={20} />
              ) : (
                <Clock size={20} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-display font-bold text-text-primary transition-colors group-hover:text-primary">
                {ride.clientName || "Cliente"}
              </h4>
              <p className="truncate text-xs font-medium text-text-muted">
                {getRideDateLabel(ride.rideDate)}
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 text-right">
            <p className="text-lg font-display font-extrabold tracking-tighter text-text-primary">
              {formatCurrency(ride.value)}
            </p>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                ride.paymentStatus === "PAID"
                  ? "border-icon-success/10 bg-icon-success/10 text-icon-success"
                  : "border-icon-warning/10 bg-icon-warning/10 text-icon-warning",
              )}
            >
              {ride.paymentStatus === "PAID" ? "Pago" : "Pendente"}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
