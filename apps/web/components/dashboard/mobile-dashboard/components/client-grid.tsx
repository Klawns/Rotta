"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client } from "../types";

interface ClientGridProps {
    clients: Client[];
    selectedClient: Client | null;
    onSelect: (client: Client | null) => void;
    page: number;
    setPage: (page: number | ((p: number) => number)) => void;
    totalPages: number;
    openCreateModal: () => void;
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (open: boolean) => void;
    newClientName: string;
    setNewClientName: (name: string) => void;
    isCreating: boolean;
    onCreate: () => void;
}

export function ClientGrid({
    clients,
    selectedClient,
    onSelect,
    page,
    setPage,
    totalPages,
    openCreateModal,
    isCreateModalOpen,
    setIsCreateModalOpen,
    newClientName,
    setNewClientName,
    isCreating,
    onCreate
}: ClientGridProps) {
    return (
        <section className="bg-slate-900/40 rounded-3xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users size={18} className="text-emerald-400" />
                    {selectedClient ? "Cliente" : "Selecione o Cliente"}
                </h2>
                {selectedClient && (
                    <button 
                        onClick={() => onSelect(null)} 
                        className="text-xs text-blue-400 font-medium hover:underline"
                    >
                        Trocar
                    </button>
                )}
            </div>

            {!selectedClient ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                        {clients.map((client) => (
                            <motion.button
                                key={client.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(client)}
                                className="aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-2 text-center"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mb-1 text-[10px] font-bold text-white uppercase overflow-hidden">
                                    {client.name.substring(0, 2)}
                                </div>
                                <span className="text-[10px] text-slate-300 font-medium truncate w-full">
                                    {client.name.split(" ")[0]}
                                </span>
                            </motion.button>
                        ))}
                        <button
                            onClick={openCreateModal}
                            className="aspect-square border border-dashed border-blue-500/30 bg-blue-500/5 rounded-2xl flex flex-col items-center justify-center p-2 group active:bg-blue-500/10 transition-colors"
                        >
                            <Plus size={16} className="text-blue-400" />
                            <span className="text-[10px] text-blue-400 mt-1 font-bold">Novo</span>
                        </button>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-2">
                            <button 
                                disabled={page === 0} 
                                onClick={() => setPage((prev: number) => Math.max(0, prev - 1))} 
                                className="p-2 text-slate-400 disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-[10px] text-slate-500 font-bold">{page + 1}/{totalPages}</span>
                            <button 
                                disabled={page >= totalPages - 1} 
                                onClick={() => setPage((prev: number) => Math.min(totalPages - 1, prev + 1))} 
                                className="p-2 text-slate-400 disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                        {selectedClient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-white leading-none">{selectedClient.name}</h3>
                        <p className="text-xs text-blue-400 mt-1">Pronto para registrar</p>
                    </div>
                </div>
            )}

            {/* In-Page Modal for client creation */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }} 
                            className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Novo Cliente</h3>
                            <input 
                                autoFocus 
                                value={newClientName} 
                                onChange={e => setNewClientName(e.target.value)} 
                                placeholder="Nome do cliente..." 
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 mb-4" 
                            />
                            <div className="flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setIsCreateModalOpen(false)} 
                                    className="flex-1 text-slate-400"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={onCreate} 
                                    disabled={!newClientName || isCreating} 
                                    className="flex-1 bg-blue-600 font-bold"
                                >
                                    {isCreating ? "Criando..." : "Cadastrar"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
