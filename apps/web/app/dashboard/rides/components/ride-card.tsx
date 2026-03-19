"use client";

import { motion } from "framer-motion";
import { Bike, User, Clock, Calendar, MessageSquare, Trash2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Ride } from "../types";

interface RideCardProps {
    ride: Ride;
    index: number;
    onEdit: (ride: Ride) => void;
    onDelete: (ride: Ride) => void;
    onTogglePayment: (ride: Ride) => void;
}

export function RideCard({ ride, index, onEdit, onDelete, onTogglePayment }: RideCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onEdit(ride)}
            className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group flex flex-col md:flex-row md:items-center gap-6 cursor-pointer"
        >
            <div className="flex items-center gap-6 flex-1">
                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Bike size={24} />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-white text-lg">Corrida #{ride.id.split("-")[0]}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 uppercase tracking-wider font-extrabold">
                            <User size={12} className="text-blue-400" />
                            {ride.clientName}
                        </p>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Clock size={14} />
                            {new Date(ride.rideDate || ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                            <Calendar size={12} />
                            {new Date(ride.rideDate || ride.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {ride.notes && (
                <div className="md:max-w-xs flex items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                    <MessageSquare size={14} className="text-slate-500 mt-1 flex-shrink-0" />
                    <p className="text-xs text-slate-400 italic">"{ride.notes}"</p>
                </div>
            )}

            <div className="flex items-center justify-between md:justify-end gap-6 min-w-[200px]">
                <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        ride.status === 'COMPLETED' ? "bg-blue-500/10 text-blue-400" :
                            ride.status === 'PENDING' ? "bg-amber-500/10 text-amber-400" :
                                "bg-red-500/10 text-red-400"
                    )}>
                        {ride.status === 'COMPLETED' ? 'Concluída' : ride.status === 'PENDING' ? 'Pendente' : 'Cancelada'}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePayment(ride);
                        }}
                        className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all active:scale-95",
                            ride.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}
                    >
                        {ride.paymentStatus === 'PAID' ? 'Pago' : 'Não Pago'}
                    </button>
                </div>
                <div className="text-right flex items-center gap-4">
                    <div>
                        <p className="text-2xl font-black text-white">{formatCurrency(ride.value)}</p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(ride);
                        }}
                        className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                        title="Excluir Corrida"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
