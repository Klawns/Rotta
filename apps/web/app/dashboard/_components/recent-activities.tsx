"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";

interface RecentActivitiesProps {
    rides: any[];
    isLoading: boolean;
    activitiesPage: number;
    setActivitiesPage: (page: number | ((p: number) => number)) => void;
    itemsPerPage: number;
    onEditRide: (ride: any) => void;
    onDeleteRide: (ride: any) => void;
}

export function RecentActivities({
    rides,
    isLoading,
    activitiesPage,
    setActivitiesPage,
    itemsPerPage,
    onEditRide,
    onDeleteRide
}: RecentActivitiesProps) {
    if (isLoading) {
        return (
            <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Atividades Recentes</h2>
                </div>
                <div className="space-y-6 flex-1 flex flex-col">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Atividades Recentes</h2>
                <Link href="/dashboard/rides" className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                    Ver histórico <ChevronRight size={16} />
                </Link>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
                {rides.length === 0 ? (
                    <p className="text-slate-500 text-center py-10 text-sm italic">Nenhuma atividade registrada no período.</p>
                ) : (
                    <>
                        <div className="space-y-6">
                            {rides
                                .slice((activitiesPage - 1) * itemsPerPage, activitiesPage * itemsPerPage)
                                .map((ride: any) => (
                                    <div
                                        key={ride.id}
                                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
                                    >
                                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-white truncate">ID: {ride.id?.split("-")[0] || "---"}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{new Date(ride.rideDate || ride.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-white">{formatCurrency(ride.value)}</p>
                                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-center block w-fit ml-auto">OK</span>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEditRide(ride)}
                                                    className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all active:scale-90"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteRide(ride)}
                                                    className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all active:scale-90"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {rides.length > itemsPerPage && (
                            <div className="flex items-center justify-center gap-4 pt-4 mt-auto border-t border-white/5">
                                <button
                                    disabled={activitiesPage === 1}
                                    onClick={() => setActivitiesPage((p: number) => p - 1)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    Página {activitiesPage} de {Math.ceil(rides.length / itemsPerPage)}
                                </span>
                                <button
                                    disabled={activitiesPage * itemsPerPage >= rides.length}
                                    onClick={() => setActivitiesPage((p: number) => p + 1)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}
