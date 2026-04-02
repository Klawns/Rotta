import React from "react";
import { motion } from "framer-motion";
import { Bike, ChevronRight, Settings2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client } from "@/types/rides";

interface ClientCardCompactProps {
    client: Client;
    onEdit: (client: Client) => void;
    onPin: (client: Client) => void;
    onQuickRide: (client: Client) => void;
    onViewHistory: (client: Client) => void;
}

export const ClientCardCompact = React.memo(function ClientCardCompact({
    client,
    onEdit,
    onPin,
    onQuickRide,
    onViewHistory,
}: ClientCardCompactProps) {
    return (
        <motion.div
            whileTap={{ scale: 0.96 }}
            onClick={() => onViewHistory(client)}
            className="group relative flex aspect-square min-h-[108px] cursor-pointer flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border-subtle bg-card-background p-3 text-left shadow-sm transition-all active:scale-[0.98]"
        >
            <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-3 text-[11px] font-display font-extrabold uppercase leading-tight tracking-tight text-text-primary">
                    {client.name || "Sem nome"}
                </span>

                {client.isPinned ? (
                    <Star
                        size={12}
                        className="shrink-0 fill-icon-warning text-icon-warning"
                    />
                ) : null}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-muted/40 px-2 py-1.5">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onPin(client);
                        }}
                        className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-xl border transition-all active:scale-90",
                            client.isPinned
                                ? "border-icon-warning/20 bg-icon-warning/20 text-icon-warning"
                                : "border-border-subtle bg-secondary/10 text-text-secondary",
                        )}
                        title={client.isPinned ? "Desafixar" : "Fixar"}
                    >
                        <Star size={12} className={cn(client.isPinned && "fill-icon-warning")} />
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit(client);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-xl border border-border-subtle bg-secondary/10 text-text-secondary transition-all active:scale-90"
                        title="Editar dados"
                    >
                        <Settings2 size={12} />
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onQuickRide(client);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-xl border border-button-primary bg-button-primary text-button-primary-foreground transition-all active:scale-90"
                        title="Nova corrida"
                    >
                        <Bike size={12} />
                    </button>
                </div>

                <ChevronRight
                    size={12}
                    className="shrink-0 text-text-secondary transition-transform group-active:translate-x-0.5"
                />
            </div>
        </motion.div>
    );
});
