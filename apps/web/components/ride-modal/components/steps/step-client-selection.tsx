"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Plus, ChevronRight, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client } from "../../types";

interface StepClientSelectionProps {
    clients: Client[];
    selectedClientId: string;
    setSelectedClientId: (id: string) => void;
    onNext: () => void;
    isCreatingClient: boolean;
    setIsCreatingClient: (val: boolean) => void;
    newClientName: string;
    setNewClientName: (name: string) => void;
    handleCreateClient: () => Promise<void>;
    isLoadingData: boolean;
    clientPage: number;
    setClientPage: (fn: (p: number) => number) => void;
    clientsPerPage: number;
}

export function StepClientSelection({
    clients,
    selectedClientId,
    setSelectedClientId,
    onNext,
    isCreatingClient,
    setIsCreatingClient,
    newClientName,
    setNewClientName,
    handleCreateClient,
    isLoadingData,
    clientPage,
    setClientPage,
    clientsPerPage
}: StepClientSelectionProps) {
    const totalPages = Math.ceil(clients.length / clientsPerPage);

    return (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 flex-1 flex flex-col"
        >
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                    <User size={12} /> Selecionar Cliente
                </label>
                <span className="text-[10px] text-slate-600 font-bold">{clients.length} cadastrados</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {clients
                    .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1))
                    .slice(clientPage * clientsPerPage, (clientPage + 1) * clientsPerPage)
                    .map((client) => (
                        <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                                setSelectedClientId(client.id);
                                onNext();
                            }}
                            className={cn(
                                "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all active:scale-95 border relative group",
                                selectedClientId === client.id
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                                    : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900"
                            )}
                        >
                            {client.isPinned && (
                                <div className="absolute top-2 right-2 text-amber-500">
                                    <Star size={10} className="fill-amber-500" />
                                </div>
                            )}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center mb-1 text-xs font-black uppercase",
                                selectedClientId === client.id ? "bg-white/20" : "bg-slate-800"
                            )}>
                                {client.name.substring(0, 2)}
                            </div>
                            <span className="text-[10px] font-bold truncate w-full px-1">{client.name.split(" ")[0]}</span>
                        </button>
                    ))}
                <button
                    type="button"
                    onClick={() => setIsCreatingClient(true)}
                    className="aspect-square border border-dashed border-blue-500/30 bg-blue-500/5 rounded-2xl flex flex-col items-center justify-center p-2 group active:bg-blue-500/10 transition-colors"
                >
                    <Plus size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-blue-400 mt-1 font-black uppercase tracking-tighter">Novo</span>
                </button>
            </div>

            {clients.length > clientsPerPage && (
                <div className="flex items-center justify-center gap-4 mt-auto pt-4">
                    <button
                        type="button"
                        disabled={clientPage === 0}
                        onClick={() => setClientPage(p => p - 1)}
                        className="p-2 text-slate-500 hover:text-white disabled:opacity-20"
                    >
                        <ChevronRight className="rotate-180" size={18} />
                    </button>
                    <span className="text-[10px] font-black text-slate-600">{clientPage + 1} / {totalPages}</span>
                    <button
                        type="button"
                        disabled={clientPage >= totalPages - 1}
                        onClick={() => setClientPage(p => p + 1)}
                        className="p-2 text-slate-500 hover:text-white disabled:opacity-20"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            <AnimatePresence>
                {isCreatingClient && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-x-0 bottom-0 z-[160] p-6 bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-white tracking-tight">Novo Cliente</h3>
                            <button
                                type="button"
                                onClick={() => setIsCreatingClient(false)}
                                className="text-slate-500 hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                autoFocus
                                value={newClientName}
                                onChange={e => setNewClientName(e.target.value)}
                                placeholder="Nome Completo..."
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-blue-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleCreateClient}
                                disabled={!newClientName || isLoadingData}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isLoadingData ? "CADASTRANDO..." : "CADASTRAR E CONTINUAR"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
