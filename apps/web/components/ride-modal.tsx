"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bike, User, DollarSign, FileText, CheckCircle2, Calendar, Plus, Camera, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface Client {
    id: string;
    name: string;
}

interface RideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientId?: string; // Se fornecido, pula a seleção de cliente
    clientName?: string;
    rideToEdit?: any; // Dados da corrida a ser editada
}

const QUICK_VALUES = [10, 15, 20, 25];

export function RideModal({ isOpen, onClose, onSuccess, clientId, clientName, rideToEdit }: RideModalProps) {
    const { verify, user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [presets, setPresets] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState(clientId || "");
    const [value, setValue] = useState<string>("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [photo, setPhoto] = useState<string | null>(null);
    const [rideDate, setRideDate] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>("PAID");
    const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>("COMPLETED");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isCustomValue, setIsCustomValue] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadInitialData();

            if (rideToEdit) {
                setSelectedClientId(rideToEdit.clientId);
                setValue(rideToEdit.value.toString());
                setLocation(rideToEdit.location || "");
                setNotes(rideToEdit.notes || "");
                setRideDate(rideToEdit.rideDate ? rideToEdit.rideDate.substring(0, 16) : "");
                setPaymentStatus(rideToEdit.paymentStatus);
                setStatus(rideToEdit.status);
                setPhoto(rideToEdit.photo || null);
                setIsCustomValue(true);
            } else {
                // Reset to defaults when opening for new ride
                setPaymentStatus("PAID");
                setStatus("COMPLETED");
                setPhoto(null);
                setSelectedClientId(clientId || "");
                setValue("");
                setLocation("");
                setNotes("");
                setRideDate("");
                setIsCustomValue(false);
            }
        }
    }, [isOpen, clientId, rideToEdit, user]);

    const loadInitialData = async () => {
        setIsLoadingData(true);
        try {
            const promises: Promise<any>[] = [];
            if (!clientId) promises.push(api.get("/clients"));
            promises.push(api.get("/settings/ride-presets"));

            const results = await Promise.all(promises);

            if (!clientId) {
                setClients(results[0].data.clients || []);
                setPresets(results[1].data || []);
            } else {
                setPresets(results[0].data || []);
            }
        } catch (err) {
            console.error("Erro ao carregar dados iniciais do modal", err);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (clientId) setSelectedClientId(clientId);
    }, [clientId]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId || !value) return;

        setIsSubmitting(true);
        try {
            const payload = {
                clientId: selectedClientId,
                value: Number(value),
                location: location || "Não informada",
                notes: notes || undefined,
                photo: photo || undefined,
                status,
                paymentStatus,
                rideDate: rideDate || undefined
            };

            if (rideToEdit) {
                await api.patch(`/rides/${rideToEdit.id}`, payload);
            } else {
                await api.post("/rides", payload);
            }

            // Atualiza os dados do usuário globalmente (rideCount)
            await verify();

            if (!rideToEdit) resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            alert(`Erro ao ${rideToEdit ? 'atualizar' : 'registrar'} corrida. Tente novamente.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePresetClick = (preset: any) => {
        setValue(preset.value.toString());
        if (preset.location) {
            setLocation(preset.location);
        } else {
            setLocation("");
        }
        setIsCustomValue(false);
    };

    const resetForm = () => {
        if (!clientId) setSelectedClientId("");
        setValue("");
        setLocation("");
        setNotes("");
        setRideDate("");
        setIsCustomValue(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="bg-slate-900 border-white/10 p-0 overflow-hidden sm:rounded-[2.5rem] w-[calc(100%-2rem)] max-w-lg sm:max-w-[480px] gap-0 shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>{rideToEdit ? 'Editar Corrida' : 'Nova Corrida'}</DialogTitle>
                    <DialogDescription>
                        {rideToEdit ? 'Altere as informações da corrida selecionada.' : 'Registre uma nova corrida no sistema.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Conteúdo do Modal */}
                <div className="flex flex-col max-h-[90vh] sm:max-h-none relative">
                    {/* Botão de Fechar Customizado para melhor acessibilidade */}
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 sm:right-10 sm:top-10 z-20 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all active:scale-95 group border border-white/5 shadow-lg"
                        title="Fechar"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    {/* Barra decorativa mobile */}
                    <div className="sm:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto my-4 shrink-0" />

                    <div className="px-6 sm:px-10 pt-4 sm:pt-8 pb-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 font-black shadow-inner border border-blue-500/10">
                                <Bike size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none">{rideToEdit ? 'Editar Corrida' : 'Nova Corrida'}</h2>
                                <p className="text-slate-500 text-[10px] sm:text-xs mt-1.5 uppercase tracking-[0.2em] font-bold opacity-70">{rideToEdit ? `ID: ${rideToEdit.id.split("-")[0]}` : 'Registro Instantâneo'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-y-auto px-6 sm:px-10 pb-10 custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                            {!clientId && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                        <User size={12} /> Selecionar Cliente
                                    </label>
                                    <Select
                                        value={selectedClientId}
                                        onValueChange={setSelectedClientId}
                                    >
                                        <SelectTrigger className="w-full bg-slate-950/50 border border-white/10 rounded-2xl h-auto py-3 px-4 text-white font-bold focus:ring-2 focus:ring-blue-500/50 transition-all shadow-none ring-offset-0 disabled:opacity-50">
                                            {isLoadingData ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                                    <span className="text-slate-500">Carregando clientes...</span>
                                                </div>
                                            ) : (
                                                <SelectValue placeholder={clientName || "Escolha um cliente..."} />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl z-[150] shadow-2xl overflow-hidden">
                                            <div className="max-h-[220px] overflow-y-auto p-1">
                                                {clients.length === 0 && !isLoadingData ? (
                                                    <div className="py-4 text-center text-sm text-slate-500">Nenhum cliente encontrado</div>
                                                ) : (
                                                    clients.map(c => (
                                                        <SelectItem
                                                            key={c.id}
                                                            value={c.id}
                                                            className="focus:bg-blue-600 focus:text-white cursor-pointer py-2.5 rounded-xl px-3 my-0.5 text-sm transition-colors"
                                                        >
                                                            {c.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {clientId && (
                                <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 flex items-center gap-5">
                                    <div className="p-2.5 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/10">
                                        <User size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Registrando para</p>
                                        <p className="text-white font-bold text-lg">{clientName}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                    <DollarSign size={12} /> Atalhos e Valor
                                </label>

                                {presets.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {presets.map(preset => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handlePresetClick(preset)}
                                                className={cn(
                                                    "p-3 rounded-xl border flex flex-col items-center justify-center transition-all group active:scale-95",
                                                    value === String(preset.value) && !isCustomValue
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/25"
                                                        : "bg-slate-950/50 border-white/5 text-slate-400 hover:bg-slate-900 hover:border-white/10"
                                                )}
                                            >
                                                <span className="text-sm font-black">R$ {preset.value}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-tight opacity-50 group-hover:opacity-100">{preset.location}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2.5">
                                        {QUICK_VALUES.map(val => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => { setValue(String(val)); setIsCustomValue(true); setLocation("") }}
                                                className={cn(
                                                    "py-3 rounded-xl font-black transition-all border text-sm",
                                                    value === String(val) && isCustomValue
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/25 scale-[1.02]"
                                                        : "bg-slate-950/50 border-white/5 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-white/10"
                                                )}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-base">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={value}
                                        onChange={(e) => { setValue(e.target.value); setIsCustomValue(true); }}
                                        placeholder="0,00"
                                        required
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-800 font-mono shadow-inner"
                                    />
                                </div>

                                {isCustomValue && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 pt-2"
                                    >
                                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                            Localização
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Ex: Shopping, Bairro A..."
                                            required
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                    </motion.div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                        <CheckCircle2 size={12} /> Status
                                    </label>
                                    <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setStatus('PENDING')}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-[0.85rem] text-[10px] font-black transition-all",
                                                status === 'PENDING' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-white"
                                            )}
                                        >
                                            PENDENTE
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStatus('COMPLETED')}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-[0.85rem] text-[10px] font-black transition-all",
                                                status === 'COMPLETED' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-white"
                                            )}
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                        <DollarSign size={12} /> Pagamento
                                    </label>
                                    <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentStatus('PENDING')}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-[0.85rem] text-[10px] font-black transition-all",
                                                paymentStatus === 'PENDING' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-500 hover:text-white"
                                            )}
                                        >
                                            NÃO
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentStatus('PAID')}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-[0.85rem] text-[10px] font-black transition-all",
                                                paymentStatus === 'PAID' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white"
                                            )}
                                        >
                                            SIM
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                        <Calendar size={12} className="text-blue-500/50" /> Data da Corrida
                                        <span className="text-blue-500/60 lowercase italic font-medium tracking-normal">(opcional)</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="datetime-local"
                                            value={rideDate}
                                            onChange={(e) => setRideDate(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[11px] font-bold [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 order-last sm:order-none">
                                    <div className="flex items-center justify-between pl-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <FileText size={12} /> Observações & Foto
                                            <span className="text-blue-500/60 lowercase italic font-medium tracking-normal">(opcional)</span>
                                        </label>

                                        <label className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-blue-400 cursor-pointer transition-colors active:scale-95 group">
                                            <Camera size={12} className="group-hover:rotate-12 transition-transform" />
                                            <span className="text-[9px] font-black uppercase tracking-wider">Tirar Foto</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={handlePhotoChange}
                                            />
                                        </label>
                                    </div>

                                    <div className="relative group/notes">
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Ex: Troco para 50, deixar na portaria..."
                                            rows={2}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder:text-slate-700 text-xs font-medium min-h-[80px]"
                                        />

                                        <AnimatePresence>
                                            {photo && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    className="mt-3 relative inline-block group/photo"
                                                >
                                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-500/30 shadow-2xl">
                                                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPhoto(null)}
                                                                className="p-1.5 bg-red-500 rounded-lg text-white shadow-lg active:scale-90 transition-transform"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Foto Anexada</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-base flex items-center justify-center gap-3 active:scale-[0.98] group mt-6"
                            >
                                {isSubmitting ? (
                                    <div className="h-7 w-7 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {rideToEdit ? 'Salvar Alterações' : 'Registrar Corrida'}
                                        <CheckCircle2 size={24} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
