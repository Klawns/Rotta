"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, User, ArrowRight } from "lucide-react";
import { FrequentClient } from "../types";

interface FrequentClientsProps {
    clients: FrequentClient[];
    isLoading: boolean;
    onSelectClient: (id: string, name: string) => void;
}

export function FrequentClients({ clients, isLoading, onSelectClient }: FrequentClientsProps) {
    return (
        <AnimatePresence>
            {!isLoading && clients.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 px-1">
                        <Star size={14} className="text-blue-400 fill-blue-400" />
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Clientes Fixados</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {clients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => onSelectClient(client.id, client.name)}
                                className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3 transition-all group active:scale-95 text-left"
                            >
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <User size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">{client.name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Fixado</p>
                                </div>
                                <ArrowRight size={14} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
}
