"use client";

import { motion } from "framer-motion";
import { User, Star, Bike, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client } from "../_services/client-service";

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
    onPin: (client: Client) => void;
    onQuickRide: (client: Client) => void;
    onViewHistory: (client: Client) => void;
}

export function ClientCard({ client, onEdit, onPin, onQuickRide, onViewHistory }: ClientCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onEdit(client)}
            className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-4 bg-white/5 rounded-2xl text-slate-300 group-hover:scale-110 transition-transform">
                    <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate">{client.name}</h3>
                    <p className="text-sm text-slate-500">Clique para ver detalhes</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPin(client);
                        }}
                        className={cn(
                            "p-3 rounded-xl transition-all active:scale-90",
                            client.isPinned
                                ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white shadow-lg shadow-amber-500/20"
                                : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white"
                        )}
                        title={client.isPinned ? "Desafixar" : "Fixar"}
                    >
                        <Star size={18} className={cn(client.isPinned && "fill-amber-500 hover:fill-white")} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickRide(client);
                        }}
                        className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all active:scale-90 shadow-lg shadow-blue-600/0 hover:shadow-blue-600/20"
                        title="Nova Corrida Rápida"
                    >
                        <Bike size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewHistory(client);
                        }}
                        className="p-3 hover:bg-white/5 rounded-xl text-slate-600 hover:text-white transition-all group/arrow"
                        title="Ver Histórico"
                    >
                        <ChevronRight className="group-hover/arrow:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
