"use client";

import { motion } from "framer-motion";
import { Bike, SearchX } from "lucide-react";
import { RideCard } from "./ride-card";
import { Ride } from "../types";

interface RidesListProps {
    rides: Ride[];
    isLoading: boolean;
    onEdit: (ride: Ride) => void;
    onDelete: (ride: Ride) => void;
    onTogglePayment: (ride: Ride) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export function RidesList({
    rides,
    isLoading,
    onEdit,
    onDelete,
    onTogglePayment,
    hasActiveFilters,
    onClearFilters
}: RidesListProps) {
    if (isLoading && rides.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6 bg-slate-900/20 rounded-[3rem] border border-white/5 animate-pulse">
                <div className="p-6 bg-blue-600/10 rounded-full text-blue-400">
                    <Bike size={48} className="animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Carregando Corridas...</h3>
                    <p className="text-slate-400">Sincronizando com a base de dados.</p>
                </div>
            </div>
        );
    }

    if (rides.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6 bg-slate-900/20 rounded-[3rem] border border-white/5">
                <div className="p-6 bg-slate-800/50 rounded-full text-slate-600">
                    {hasActiveFilters ? <SearchX size={48} /> : <Bike size={48} />}
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">
                        {hasActiveFilters ? "Nenhuma corrida encontrada" : "Nenhuma corrida registrada"}
                    </h3>
                    <p className="text-slate-400">
                        {hasActiveFilters
                            ? "Tente ajustar seus filtros para encontrar o que procura."
                            : "Comece agora registrando sua primeira atividade no botão acima."}
                    </p>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 mt-2"
                    >
                        Limpar Filtros e Ver Todos
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Listagem Completa</h2>
                </div>
            </div>
            {rides.map((ride, index) => (
                <RideCard
                    key={ride.id}
                    ride={ride}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTogglePayment={onTogglePayment}
                />
            ))}
        </div>
    );
}
