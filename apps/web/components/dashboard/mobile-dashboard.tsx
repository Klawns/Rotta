"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Bike,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    MapPin,
    Calendar,
    Wallet,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Save,
    Pencil,
    Trash2,
    Lock,
    Crown,
    Info
} from "lucide-react";
import { api } from "@/services/api";

const RIDE_LIMIT_FREE = 20;
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PDFService } from "@/services/pdf-service";
import { useAuth } from "@/hooks/use-auth";
import { RidesChart } from "./rides-chart";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MobileDashboardProps {
    onRideCreated: () => void;
}

export function MobileDashboard({ onRideCreated }: MobileDashboardProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [clients, setClients] = useState<any[]>([]);
    const [presets, setPresets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Stats State
    const [todayTotal, setTodayTotal] = useState(0);
    const [weekTotal, setWeekTotal] = useState(0);
    const [monthTotal, setMonthTotal] = useState(0);
    const [monthRides, setMonthRides] = useState<any[]>([]);
    const [totalRides, setTotalRides] = useState(0);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

    // Ride History
    const [recentRides, setRecentRides] = useState<any[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const ridesPerPage = 5;

    // Client Creation Modal In-Page
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    // Pagination for Clients
    const [clientPage, setClientPage] = useState(0);
    const clientsPerPage = 16; // 4x4 grid

    // Flow State
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
    const [customValue, setCustomValue] = useState("");
    const [customLocation, setCustomLocation] = useState("");
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [rideStatus, setRideStatus] = useState<'PENDING' | 'COMPLETED'>('COMPLETED');
    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PAID');
    const [isSaving, setIsSaving] = useState(false);

    // Edit Ride States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRide, setEditingRide] = useState<any>(null);
    const [editValue, setEditValue] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [editStatus, setEditStatus] = useState<any>("");
    const [editPaymentStatus, setEditPaymentStatus] = useState<any>("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    useEffect(() => {
        loadHistory();
    }, [historyPage]);

    async function loadData() {
        try {
            const [clientsRes, presetsRes, today, week, month] = await Promise.all([
                api.get("/clients"),
                api.get("/settings/ride-presets"),
                api.get("/rides/stats?period=today"),
                api.get("/rides/stats?period=week"),
                api.get("/rides/stats?period=month"),
            ]);
            setClients(clientsRes.data.clients || []);
            setPresets(presetsRes.data);
            setTodayTotal(today.data.totalValue || 0);
            setWeekTotal(week.data.totalValue || 0);
            setMonthTotal(month.data.totalValue || 0);
            setMonthRides(month.data.rides || []);

            // Sync history on main data load
            loadHistory();
        } catch (err) {
            console.error("Erro ao carregar dados mobile", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function loadHistory() {
        try {
            // Using offset/limit for history
            const { data } = await api.get(`/rides?limit=${ridesPerPage}&offset=${historyPage * ridesPerPage}`);
            setRecentRides(data.rides || []);
        } catch (err) {
            console.error("Erro ao carregar histórico", err);
        }
    }

    async function handleConfirmRide() {
        if (!selectedClient) return;

        let finalValue = 0;
        let finalLocation = "";

        if (showCustomForm) {
            finalValue = Number(customValue);
            finalLocation = customLocation;
        } else if (selectedPresetId) {
            const preset = presets.find(p => p.id === selectedPresetId);
            if (!preset) return;
            finalValue = preset.value;
            finalLocation = preset.location;
        }

        if (!finalValue || !finalLocation) {
            toast({ title: "Selecione um valor ou local", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await api.post("/rides", {
                clientId: selectedClient.id,
                value: finalValue,
                location: finalLocation,
                status: rideStatus,
                paymentStatus: paymentStatus,
                rideDate: new Date()
            });

            toast({ title: "Corrida registrada!", description: `R$ ${finalValue.toFixed(2)} para ${selectedClient.name}` });

            // Reset and Refresh
            setSelectedClient(null);
            setSelectedPresetId(null);
            setShowCustomForm(false);
            setCustomValue("");
            setCustomLocation("");
            setHistoryPage(0);

            onRideCreated(); // Tell layout/parent to sync
            loadData(); // local reload
        } catch (err) {
            toast({ title: "Erro ao registrar", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCreateClient() {
        if (!newClientName) return;
        setIsCreatingClient(true);
        try {
            const { data } = await api.post("/clients", { name: newClientName });
            setClients(prev => [...prev, data]);
            setSelectedClient(data);
            setIsClientModalOpen(false);
            setNewClientName("");
            toast({ title: "Cliente cadastrado! 👤" });
        } catch (err) {
            toast({ title: "Erro ao cadastrar", variant: "destructive" });
        } finally {
            setIsCreatingClient(false);
        }
    }

    function handleOpenEdit(ride: any) {
        setEditingRide(ride);
        setEditValue(ride.value.toString());
        setEditLocation(ride.location || "");
        setEditStatus(ride.status);
        setEditPaymentStatus(ride.paymentStatus);
        setIsEditModalOpen(true);
    }

    async function handleSaveUpdate() {
        if (!editingRide) return;
        setIsUpdating(true);
        try {
            await api.patch(`/rides/${editingRide.id}`, {
                value: Number(editValue),
                location: editLocation,
                status: editStatus,
                paymentStatus: editPaymentStatus
            });

            toast({ title: "Corrida atualizada! 🏎️" });
            setIsEditModalOpen(false);

            // Local Refresh
            loadData();
            loadHistory();
        } catch (err) {
            toast({ title: "Erro ao atualizar", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDeletePreset(id: string) {
        try {
            await api.delete(`/settings/ride-presets/${id}`);
            setPresets(prev => prev.filter(p => p.id !== id));
            toast({ title: "Atalho removido" });
        } catch (err) {
            toast({ title: "Erro ao remover atalho", variant: "destructive" });
        }
    }

    async function handleExportPDF(period: 'today' | 'week' | 'month') {
        try {
            const { data } = await api.get(`/rides/stats?period=${period}`);
            if (!data.rides || data.rides.length === 0) {
                toast({ title: "Sem dados para exportar" });
                return;
            }
            toast({ title: "Gerando PDF..." });
            await PDFService.generateReport(data.rides, { period, userName: user?.name || "Motorista" });
        } catch (err) {
            toast({ title: "Erro ao exportar", variant: "destructive" });
        }
    }

    const totalPages = Math.ceil(clients.length / clientsPerPage);
    const paginatedClients = clients.slice(clientPage * clientsPerPage, (clientPage + 1) * clientsPerPage);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* 0. Finance Stats Summary */}
            <section className="grid grid-cols-3 gap-2">
                {[
                    { label: "Hoje", val: todayTotal, color: "text-blue-400" },
                    { label: "Semana", val: weekTotal, color: "text-emerald-400" },
                    { label: "Mês", val: monthTotal, color: "text-violet-400" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-900/60 border border-white/5 rounded-2xl p-3 text-center">
                        <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter mb-1">{s.label}</p>
                        <p className={cn("text-xs font-bold truncate", s.color)}>{formatCurrency(s.val)}</p>
                    </div>
                ))}
            </section>


            {/* 1. Client Grid Section */}
            <section className="bg-slate-900/40 rounded-3xl border border-white/5 p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users size={18} className="text-emerald-400" />
                        {selectedClient ? "Cliente" : "Selecione o Cliente"}
                    </h2>
                    {selectedClient && (
                        <button onClick={() => setSelectedClient(null)} className="text-xs text-blue-400 font-medium hover:underline">Trocar</button>
                    )}
                </div>

                {!selectedClient ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                            {paginatedClients.map((client) => (
                                <motion.button
                                    key={client.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedClient(client)}
                                    className="aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-2 text-center"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mb-1 text-[10px] font-bold text-white uppercase overflow-hidden">
                                        {client.name.substring(0, 2)}
                                    </div>
                                    <span className="text-[10px] text-slate-300 font-medium truncate w-full">{client.name.split(" ")[0]}</span>
                                </motion.button>
                            ))}
                            <button
                                onClick={() => setIsClientModalOpen(true)}
                                className="aspect-square border border-dashed border-blue-500/30 bg-blue-500/5 rounded-2xl flex flex-col items-center justify-center p-2 group active:bg-blue-500/10 transition-colors"
                            >
                                <Plus size={16} className="text-blue-400" />
                                <span className="text-[10px] text-blue-400 mt-1 font-bold">Novo</span>
                            </button>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-2">
                                <button disabled={clientPage === 0} onClick={() => setClientPage(prev => Math.max(0, prev - 1))} className="p-2 text-slate-400 disabled:opacity-30"><ChevronLeft size={18} /></button>
                                <span className="text-[10px] text-slate-500 font-bold">{clientPage + 1}/{totalPages}</span>
                                <button disabled={clientPage >= totalPages - 1} onClick={() => setClientPage(prev => Math.min(totalPages - 1, prev + 1))} className="p-2 text-slate-400 disabled:opacity-30"><ChevronRight size={18} /></button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">{selectedClient.name.substring(0, 2).toUpperCase()}</div>
                        <div>
                            <h3 className="font-bold text-white leading-none">{selectedClient.name}</h3>
                            <p className="text-xs text-blue-400 mt-1">Pronto para registrar</p>
                        </div>
                    </div>
                )}
            </section>

            {/* In-Page Modal for client creation */}
            <AnimatePresence>
                {isClientModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Novo Cliente</h3>
                            <input autoFocus value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Nome do cliente..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 mb-4" />
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsClientModalOpen(false)} className="flex-1 text-slate-400">Cancelar</Button>
                                <Button onClick={handleCreateClient} disabled={!newClientName || isCreatingClient} className="flex-1 bg-blue-600 font-bold">{isCreatingClient ? "Criando..." : "Cadastrar"}</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 2. Selection and Save Area */}
            <AnimatePresence>
                {selectedClient && (
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-3">
                                <p className="text-[9px] text-slate-500 uppercase font-black mb-2">Corrida</p>
                                <div className="flex gap-1">
                                    <button onClick={() => setRideStatus('PENDING')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", rideStatus === 'PENDING' ? "bg-orange-500 text-white" : "bg-white/5 text-slate-500")}>Pend.</button>
                                    <button onClick={() => setRideStatus('COMPLETED')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", rideStatus === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-500")}>OK</button>
                                </div>
                            </div>
                            <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-3">
                                <p className="text-[9px] text-slate-500 uppercase font-black mb-2">Pagamento</p>
                                <div className="flex gap-1">
                                    <button onClick={() => setPaymentStatus('PENDING')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", paymentStatus === 'PENDING' ? "bg-red-500 text-white" : "bg-white/5 text-slate-500")}>Pend.</button>
                                    <button onClick={() => setPaymentStatus('PAID')} className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", paymentStatus === 'PAID' ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-500")}>Pago</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><MapPin size={18} className="text-blue-400" />Valor e Local</h2>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {presets.map((p) => (
                                    <div key={p.id} className="relative group/preset">
                                        <button
                                            onClick={() => {
                                                setSelectedPresetId(p.id);
                                                setShowCustomForm(false);
                                            }}
                                            className={cn(
                                                "w-full rounded-2xl p-3 text-left transition-all border",
                                                selectedPresetId === p.id
                                                    ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]"
                                                    : "bg-white/5 border-white/5 active:bg-white/10"
                                            )}
                                        >
                                            <p className={cn("text-lg font-black", selectedPresetId === p.id ? "text-white" : "text-slate-200")}>{formatCurrency(p.value)}</p>
                                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.label} • {p.location}</p>
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePreset(p.id);
                                            }}
                                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all opacity-0 group-hover/preset:opacity-100 md:opacity-40"
                                        >
                                            <Trash2 size={10} strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    setShowCustomForm(!showCustomForm);
                                    setSelectedPresetId(null);
                                }} className={cn("rounded-2xl p-3 text-left border transition-all flex flex-col justify-center", showCustomForm ? "bg-blue-600/20 border-blue-500" : "bg-white/5 border-white/5")}>
                                    <div className="flex items-center gap-2 text-white font-bold text-xs"><Plus size={14} />Outro</div>
                                    <p className="text-[9px] text-slate-500 mt-0.5 italic">Valor Manual</p>
                                </button>
                            </div>

                            {showCustomForm && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 pt-2 mb-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" value={customValue} onChange={e => setCustomValue(e.target.value)} placeholder="R$ 0,00" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
                                        <input type="text" value={customLocation} onChange={e => setCustomLocation(e.target.value)} placeholder="Local..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500" />
                                    </div>
                                </motion.div>
                            )}

                            {/* Global Save Button - Only shown when client is selected */}
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                                onClick={handleConfirmRide}
                                disabled={isSaving || (!selectedPresetId && (!customValue || !customLocation))}
                            >
                                {isSaving ? (
                                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Salvando</span>
                                ) : (
                                    <><Save size={20} /> SALVAR CORRIDA</>
                                )}
                            </Button>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* 3. History Section (5 items) */}
            <section className="bg-slate-900/40 rounded-3xl border border-white/5 p-4">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock size={18} className="text-violet-400" />
                        Corridas Recentes
                    </h2>
                </div>
                <div className="space-y-2">
                    {recentRides.length === 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-white font-black italic">ROTTA</span>
                        </div>
                    ) : (
                        recentRides.map(r => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={r.id}
                                onClick={() => handleOpenEdit(r)}
                                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 active:bg-white/10 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3 max-w-[60%]">
                                    <div className="p-2 rounded-xl bg-white/5 text-slate-400 group-active:text-blue-400 transition-colors">
                                        <Pencil size={14} />
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-xs font-bold text-white truncate">{r.client?.name || "Cliente"}</span>
                                        <span className="text-[10px] text-slate-500 truncate flex items-center gap-1"><MapPin size={8} /> {r.location || "Central"}</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1.5">
                                    <span className="text-sm font-black text-white leading-none mb-0.5">{formatCurrency(r.value)}</span>
                                    <div className="flex gap-1.5">
                                        <span className={cn(
                                            "text-[7px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border",
                                            r.status === 'COMPLETED'
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>
                                            {r.status === 'COMPLETED' ? "Concluída" : "Pendente"}
                                        </span>
                                        <span className={cn(
                                            "text-[7px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border",
                                            r.paymentStatus === 'PAID'
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {r.paymentStatus === 'PAID' ? "Pago" : "Não Pago"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-8 mt-6 pb-2">
                    <button
                        disabled={historyPage === 0}
                        onClick={() => setHistoryPage(p => p - 1)}
                        className="p-2 transition-colors text-slate-400 disabled:opacity-20 flex items-center gap-1 text-[10px] font-bold"
                    >
                        <ChevronLeft size={16} /> ANTERIOR
                    </button>
                    <button
                        onClick={() => setHistoryPage(p => p + 1)}
                        disabled={recentRides.length < ridesPerPage}
                        className="p-2 transition-colors text-slate-400 disabled:opacity-20 flex items-center gap-1 text-[10px] font-bold"
                    >
                        PRÓXIMA <ChevronRight size={16} />
                    </button>
                </div>
            </section>

            {/* 0.1 Chart Performance */}
            <RidesChart rides={monthRides} />

            {/* 4. Export & Link to Finance */}
            <section className="bg-slate-900/40 rounded-3xl border border-white/5 p-5">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText size={18} className="text-orange-400" />
                        Exportar PDF
                    </h2>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {['today', 'week', 'month'].map(p => (
                        <button key={p} onClick={() => handleExportPDF(p as any)} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 active:bg-orange-500/20 transition-all">
                            <Calendar size={18} className="text-slate-400" />
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-start gap-3 mb-4">
                    <Info size={16} className="text-orange-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] text-orange-200/70 leading-relaxed font-medium">
                            Para filtros detalhados por data ou cliente, acesse o painel financeiro completo.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 text-center">
                    <Link href="/dashboard/finance" className="block">
                        <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black h-12 rounded-2xl text-xs gap-2 active:scale-95 transition-all">
                            PAINEL FINANCEIRO <ArrowRight size={14} />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Modal de Edição de Corrida */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] w-[95%] max-w-sm mx-auto p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Pencil size={20} className="text-blue-400" />
                            Editar Corrida
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor da Corrida</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                                <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="bg-slate-950 border-white/10 h-14 pl-12 rounded-2xl text-lg font-black focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Localização/Destino</Label>
                            <Input
                                value={editLocation}
                                onChange={(e) => setEditLocation(e.target.value)}
                                className="bg-slate-950 border-white/10 h-14 rounded-2xl focus-visible:ring-blue-500"
                                placeholder="Ex: Centro, Shopping..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</Label>
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setEditStatus('PENDING')}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all",
                                            editStatus === 'PENDING' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >PEND.</button>
                                    <button
                                        onClick={() => setEditStatus('COMPLETED')}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all",
                                            editStatus === 'COMPLETED' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >OK</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pagamento</Label>
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setEditPaymentStatus('PENDING')}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all",
                                            editPaymentStatus === 'PENDING' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >PEND.</button>
                                    <button
                                        onClick={() => setEditPaymentStatus('PAID')}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all",
                                            editPaymentStatus === 'PAID' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >PAGO</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-row gap-3 pt-4 border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 h-12 rounded-xl text-slate-500 font-bold hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveUpdate}
                            disabled={isUpdating}
                            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20"
                        >
                            {isUpdating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Limite Atingido (Paywall) */}
            <Dialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] w-[95%] max-w-sm mx-auto p-8 text-center overflow-hidden relative">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-6">
                        <div className="mx-auto w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center animate-bounce">
                            <Crown size={40} className="text-blue-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white">Limite Atingido! 🚀</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Você atingiu o limite de **{RIDE_LIMIT_FREE} corridas** do plano gratuito.
                                Faça upgrade para o **Premium** e tenha registros ilimitados, relatórios PDF e muito mais!
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Link href="/dashboard/settings" className="block">
                                <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 text-md gap-2">
                                    VER PLANOS PREMIUM <ArrowRight size={18} />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                onClick={() => setIsLimitModalOpen(false)}
                                className="w-full text-slate-500 font-bold h-12 rounded-xl"
                            >
                                Talvez mais tarde
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                            <span>Rotta Platinum</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                <div className="w-1 h-1 rounded-full bg-violet-500" />
                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
