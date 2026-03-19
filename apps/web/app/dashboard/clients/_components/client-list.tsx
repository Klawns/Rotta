"use client";

import { Client } from "../_services/client-service";
import { ClientCard } from "./client-card";

interface ClientListProps {
    clients: Client[];
    isLoading: boolean;
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    onEdit: (client: Client) => void;
    onPin: (client: Client) => void;
    onQuickRide: (client: Client) => void;
    onViewHistory: (client: Client) => void;
}

export function ClientList({
    clients,
    isLoading,
    page,
    total,
    limit,
    onPageChange,
    onEdit,
    onPin,
    onQuickRide,
    onViewHistory
}: ClientListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        onEdit={onEdit}
                        onPin={onPin}
                        onQuickRide={onQuickRide}
                        onViewHistory={onViewHistory}
                    />
                ))}
            </div>

            {total > limit && (
                <div className="flex items-center justify-between mt-10 px-2">
                    <p className="text-sm text-slate-500 font-medium">
                        <span className="text-white">{(page - 1) * limit + 1}</span>-
                        <span className="text-white">{Math.min(page * limit, total)}</span> de <span className="text-white">{total}</span> clientes
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => {
                                onPageChange(page - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => {
                                onPageChange(page + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
