"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, FileText, Camera, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Ride } from "../types";
import { RIDES_PER_PAGE } from "../constants";

interface RecentRidesListProps {
    rides: Ride[];
    onEdit: (ride: Ride) => void;
    onDelete: (ride: Ride) => void;
    page: number;
    setPage: (page: number | ((p: number) => number)) => void;
}

export function RecentRidesList({ rides, onEdit, onDelete, page, setPage }: RecentRidesListProps) {
    return (
        <section className="bg-slate-900/40 rounded-3xl border border-white/5 p-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock size={18} className="text-violet-400" />
                    Corridas Recentes
                </h2>
            </div>
            
            <div className="space-y-2">
                {rides.length === 0 ? (
                    <div className="flex items-center gap-2 py-4">
                        <span className="text-white font-black italic opacity-20">ROTTA</span>
                    </div>
                ) : (
                    rides.map((r) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={r.id}
                            onClick={() => onEdit(r)}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 active:bg-white/10 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 max-w-[60%]">
                                <div className="p-2 rounded-xl bg-white/5 text-slate-400 group-active:text-blue-400 transition-colors">
                                    <Pencil size={14} />
                                </div>
                                <div className="flex flex-col truncate">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white truncate">
                                            {r.client?.name || "Cliente"}
                                        </span>
                                        {(r.notes || r.photo) && (
                                            <div className="flex gap-1 opacity-40">
                                                {r.notes && <FileText size={8} />}
                                                {r.photo && <Camera size={8} />}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                        <MapPin size={8} /> {r.location || "Central"} • {new Date(r.rideDate || r.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1.5">
                                <span className="text-sm font-black text-white leading-none mb-0.5">
                                    {formatCurrency(r.value)}
                                </span>
                                <span className={cn(
                                    "text-[8px] px-3 py-1 rounded-lg font-black uppercase tracking-widest border text-center",
                                    r.paymentStatus === 'PAID'
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>
                                    {r.paymentStatus === 'PAID' ? "Pago" : "Não Pago"}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(r);
                                    }}
                                    className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all active:scale-90"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="flex items-center justify-center gap-8 mt-6 pb-2">
                <button
                    disabled={page === 0}
                    onClick={() => setPage((p: number) => Math.max(0, p - 1))}
                    className="p-2 transition-colors text-slate-400 disabled:opacity-20 flex items-center gap-1 text-[10px] font-bold"
                >
                    <ChevronLeft size={16} /> ANTERIOR
                </button>
                <button
                    disabled={rides.length < RIDES_PER_PAGE}
                    onClick={() => setPage((p: number) => p + 1)}
                    className="p-2 transition-colors text-slate-400 disabled:opacity-20 flex items-center gap-1 text-[10px] font-bold"
                >
                    PRÓXIMA <ChevronRight size={16} />
                </button>
            </div>
        </section>
    );
}
