"use client";

import { motion } from "framer-motion";
import { Calendar, FileText, Camera, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepExtraInfoProps {
    rideDate: string;
    setRideDate: (d: string) => void;
    notes: string;
    setNotes: (n: string) => void;
    photo: string | null;
    setPhoto: (p: string | null) => void;
    handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StepExtraInfo({
    rideDate,
    setRideDate,
    notes,
    setNotes,
    photo,
    setPhoto,
    handlePhotoChange
}: StepExtraInfoProps) {
    return (
        <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Calendar size={12} className="text-blue-500/50" /> Data e Hora
                    <span className="text-slate-700 lowercase italic font-medium tracking-normal">(opcional)</span>
                </label>
                <input
                    type="datetime-local"
                    value={rideDate}
                    onChange={(e) => setRideDate(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold [color-scheme:dark]"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText size={12} /> Observações
                        <span className="text-slate-700 lowercase italic font-medium tracking-normal">(opcional)</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-blue-400 cursor-pointer transition-all active:scale-95 group">
                        <Camera size={14} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Anexar Foto</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                    </label>
                </div>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Detalhes extras, referências, etc..."
                    rows={3}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-[2rem] py-5 px-6 text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-800 text-sm font-bold min-h-[120px]"
                />

                {photo && (
                    <div className="relative inline-block mt-2">
                        <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-blue-500/30 shadow-2xl group">
                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setPhoto(null)}
                                className="absolute inset-0 bg-red-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                        <span className="absolute -top-3 -right-3 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Foto Anexada</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
