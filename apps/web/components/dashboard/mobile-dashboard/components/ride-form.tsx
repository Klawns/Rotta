"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Star, Calendar, FileText, Camera, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RidePreset, PaymentStatus } from "../types";
import { QUICK_VALUES } from "../constants";

interface RideFormProps {
    presets: RidePreset[];
    selectedPresetId: string | null;
    onSelectPreset: (id: string, value: number, location: string) => void;
    onDeletePreset: (id: string) => void;
    customValue: string;
    setCustomValue: (val: string) => void;
    customLocation: string;
    setCustomLocation: (loc: string) => void;
    showCustomForm: boolean;
    setShowCustomForm: (show: boolean) => void;
    paymentStatus: PaymentStatus;
    setPaymentStatus: (status: PaymentStatus) => void;
    rideDate: string;
    setRideDate: (date: string) => void;
    notes: string;
    setNotes: (notes: string) => void;
    photo: string | null;
    onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemovePhoto: () => void;
    isSaving: boolean;
    onSubmit: () => void;
    canSubmit: boolean;
}

export function RideForm({
    presets,
    selectedPresetId,
    onSelectPreset,
    onDeletePreset,
    customValue,
    setCustomValue,
    customLocation,
    setCustomLocation,
    showCustomForm,
    setShowCustomForm,
    paymentStatus,
    setPaymentStatus,
    rideDate,
    setRideDate,
    notes,
    setNotes,
    photo,
    onPhotoChange,
    onRemovePhoto,
    isSaving,
    onSubmit,
    canSubmit
}: RideFormProps) {
    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }} 
            className="space-y-4"
        >
            <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-3">
                <p className="text-[9px] text-slate-500 uppercase font-black mb-2">Status do Pagamento</p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPaymentStatus('PENDING')} 
                        className={cn(
                            "flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest", 
                            paymentStatus === 'PENDING' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 text-slate-500"
                        )}
                    >
                        Não Pago
                    </button>
                    <button 
                        onClick={() => setPaymentStatus('PAID')} 
                        className={cn(
                            "flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest", 
                            paymentStatus === 'PAID' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-slate-500"
                        )}
                    >
                        Pago
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-blue-400" />Valor e Local
                </h2>
                
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {QUICK_VALUES.map((v) => {
                        const matchingPreset = presets.find((p) => p.value === v);
                        const displayId = matchingPreset?.id || `default-${v}`;
                        const isSelected = (!showCustomForm && (selectedPresetId === displayId || (customValue === String(v) && !selectedPresetId)));

                        return (
                            <div key={displayId} className="relative group/preset">
                                <button
                                    onClick={() => {
                                        onSelectPreset(displayId, v, matchingPreset?.location || "Central");
                                        setShowCustomForm(false);
                                    }}
                                    className={cn(
                                        "w-full rounded-2xl p-4 text-center border transition-all flex flex-col justify-center items-center shadow-sm",
                                        isSelected 
                                            ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20" 
                                            : "bg-white/5 border-white/5"
                                    )}
                                >
                                    <div className={cn("text-base font-black", isSelected ? "text-white" : "text-blue-400")}>
                                        R$ {v}
                                    </div>
                                </button>
                                {matchingPreset && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeletePreset(matchingPreset.id);
                                        }}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all opacity-0 group-hover/preset:opacity-100"
                                    >
                                        <Trash2 size={10} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <button 
                        onClick={() => {
                            setShowCustomForm(!showCustomForm);
                        }} 
                        className={cn(
                            "rounded-2xl p-3 text-left border transition-all flex flex-col justify-center", 
                            showCustomForm ? "bg-blue-600/20 border-blue-500" : "bg-white/5 border-white/5"
                        )}
                    >
                        <div className="flex items-center gap-2 text-white font-bold text-xs"><Plus size={14} />Outro</div>
                        <p className="text-[9px] text-slate-500 mt-0.5 italic">Manual</p>
                    </button>
                </div>

                <div className="flex items-center gap-2 px-1 mb-4 mt-2">
                    <Star size={10} className="text-blue-500/50" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter leading-tight">
                        Gerencie valores e locais em <Link href="/dashboard/settings" className="text-blue-500 hover:underline">Configurações</Link>
                    </p>
                </div>

                <AnimatePresence>
                    {(selectedPresetId || showCustomForm) && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pt-2 mb-4">
                            {showCustomForm && (
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">R$</span>
                                        <input 
                                            type="number" 
                                            value={customValue} 
                                            onChange={e => setCustomValue(e.target.value)} 
                                            placeholder="0,00" 
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm font-black outline-none focus:border-blue-500" 
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin size={14} className="text-blue-500" />
                                    Localização da Corrida
                                </label>
                                <input 
                                    type="text" 
                                    value={customLocation} 
                                    onChange={e => setCustomLocation(e.target.value)} 
                                    placeholder="Onde será a corrida?" 
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-blue-500" 
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={14} className="text-blue-500/50" />
                        Data da Corrida <span className="lowercase italic font-medium opacity-40">(opcional)</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={rideDate}
                        onChange={(e) => setRideDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500/30 transition-all [color-scheme:dark]"
                    />
                </div>

                <div className="group/notes border-t border-white/5 pt-4 mt-2 mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText size={14} className="text-blue-500/50" />
                            Observação <span className="lowercase italic font-medium opacity-40">(opcional)</span>
                        </label>

                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400 cursor-pointer active:scale-95 transition-all text-[10px] font-black uppercase tracking-tight">
                            <Camera size={14} />
                            Tirar Foto
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhotoChange} />
                        </label>
                    </div>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Deixar na portaria, troco para 50..."
                        rows={2}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-white text-xs outline-none focus:ring-1 focus:ring-blue-500/30 resize-none transition-all placeholder:text-slate-700"
                    />

                    <AnimatePresence>
                        {photo && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative inline-block group/photo"
                            >
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl">
                                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={onRemovePhoto}
                                        className="absolute inset-0 bg-red-500/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} className="text-white drop-shadow-xl" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                    onClick={onSubmit}
                    disabled={isSaving || !canSubmit}
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                            Salvando
                        </span>
                    ) : (
                        <><Save size={20} /> SALVAR CORRIDA</>
                    )}
                </Button>
            </div>
        </motion.section>
    );
}
