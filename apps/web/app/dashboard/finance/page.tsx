"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Wallet,
    Download,
    ArrowUpRight,
    CheckCircle2,
    User as UserIcon,
    Filter,
    ChevronLeft,
    ChevronRight,
    Bike,
    FileText,
    Calendar
} from "lucide-react";
import { api } from "@/services/api";
import { formatCurrency, cn } from "@/lib/utils";
import { PDFService } from "@/services/pdf-service";
import { useAuth } from "@/hooks/use-auth";

interface Stats {
    count: number;
    totalValue: number;
    rides: any[];
}

export default function FinancePage() {
    const { user } = useAuth();
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("all");
    const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [viewStats, setViewStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const periods = [
        { id: 'today', label: 'Hoje', color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20' },
        { id: 'week', label: 'Semana', color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        { id: 'month', label: 'Mês', color: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/20' },
        { id: 'custom', label: 'Personalizado', color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20' },
    ];

    const currentPeriod = periods.find(p => p.id === selectedPeriod) || periods[0];

    useEffect(() => {
        if (selectedPeriod === 'custom' && (!startDate || !endDate)) return;
        loadData();
    }, [selectedClientId, selectedPeriod, startDate, endDate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            let path = `/rides/stats?period=${selectedPeriod}`;
            if (selectedClientId !== "all") {
                path += `&clientId=${selectedClientId}`;
            }
            if (selectedPeriod === 'custom' && startDate && endDate) {
                path += `&start=${startDate}&end=${endDate}`;
            }

            const [clientsRes, statsRes] = await Promise.all([
                api.get("/clients"),
                api.get(path)
            ]);
            setClients(clientsRes.data.clients || []);
            setViewStats(statsRes.data);
        } catch (err) {
            console.error("Erro ao carregar dados financeiros", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPDF = (period: 'today' | 'week' | 'month' | 'year' | 'custom', stats: Stats | null) => {
        if (!stats || !stats.rides.length) return;

        PDFService.generateReport(stats.rides, {
            period,
            userName: user?.name || "Motorista"
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }


    return (
        <div className="space-y-6 pb-20">
            <header className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Financeiro</h1>
                    <p className="text-slate-400 mt-1">Acompanhe e exporte seus rendimentos.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-900/40 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
                    <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {periods.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPeriod(p.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    selectedPeriod === p.id
                                        ? `${p.color} text-white shadow-lg`
                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />

                    <div className="w-full md:w-64">
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger className="h-12 bg-slate-950/50 border-white/5 rounded-xl pl-4 text-white font-bold hover:bg-white/5 transition-all outline-none ring-0 border">
                                <div className="flex items-center gap-3">
                                    <UserIcon size={16} className="text-blue-400" />
                                    <SelectValue placeholder="Cliente" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                <SelectItem value="all">Todos os Clientes</SelectItem>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <AnimatePresence>
                        {selectedPeriod === 'custom' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-3 w-full md:w-auto"
                            >
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-12 bg-slate-950/50 border-white/5 rounded-xl text-white font-bold w-full md:w-40"
                                />
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-12 bg-slate-950/50 border-white/5 rounded-xl text-white font-bold w-full md:w-40"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            <div className="grid grid-cols-1">
                <motion.div
                    key={selectedPeriod}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "p-1 rounded-[3rem] bg-gradient-to-br transition-all duration-500",
                        selectedPeriod === 'today' ? "from-blue-500/20 to-transparent" :
                            selectedPeriod === 'week' ? "from-emerald-500/20 to-transparent" :
                                selectedPeriod === 'month' ? "from-indigo-500/20 to-transparent" :
                                    "from-amber-500/20 to-transparent"
                    )}
                >
                    <div className="bg-[#0f172a] rounded-[2.8rem] p-10 md:p-14 border border-white/5 relative overflow-hidden">
                        {/* Indicador Lateral de Cor */}
                        <div className={cn("absolute top-0 left-0 w-2 h-full", currentPeriod.color)} />

                        <div className="flex flex-col items-center text-center">
                            <div className={cn("p-6 rounded-3xl mb-8 shadow-2xl transition-colors duration-500", currentPeriod.color + "/20", currentPeriod.text)}>
                                <Wallet size={48} />
                            </div>

                            <span className={cn("text-xs font-black uppercase tracking-[.3em] mb-4", currentPeriod.text)}>
                                Resumo {currentPeriod.label}
                            </span>

                            <div className={cn(
                                "transition-all duration-700 w-full flex flex-col items-center",
                                isLoading ? "opacity-30 blur-md scale-95" : "opacity-100 blur-0 scale-100"
                            )}>
                                <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4">
                                    {formatCurrency(viewStats?.totalValue || 0)}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-slate-400 text-lg font-bold">
                                        {viewStats?.count || 0} corridas realizadas
                                    </p>
                                </div>

                                <div className="w-full mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-6">
                                    <Button
                                        onClick={() => handleExportPDF(selectedPeriod as any, viewStats)}
                                        disabled={isLoading || !viewStats?.count}
                                        className={cn(
                                            "w-full md:w-auto px-10 h-16 rounded-2xl text-white font-black flex items-center gap-4 shadow-xl transition-all active:scale-95",
                                            currentPeriod.color,
                                            "hover:opacity-90",
                                            (isLoading || !viewStats?.count) && "grayscale opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Download size={24} />
                                        EXPORTAR PDF {currentPeriod.label.toUpperCase()}
                                    </Button>
                                </div>
                            </div>

                            {/* Loading Overlay Sutil */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-50">
                                    <div className={cn("h-16 w-16 border-4 border-t-transparent rounded-full animate-spin", currentPeriod.border, "border-t-" + currentPeriod.color.replace('bg-', ''))} />
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <section className="glass-card p-8 lg:p-12 rounded-[3rem] border border-white/5 bg-slate-900/40 relative overflow-hidden hidden md:block">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">Relatórios Profissionais</h2>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                            Gere documentos detalhados para sua contabilidade ou controle pessoal. Nossos PDFs incluem ID de transação, data, local e resumo de faturamento.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-xs font-bold text-slate-300">Layout Premium</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span className="text-xs font-bold text-slate-300">Métricas Reais</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-all"></div>
                        <div className="relative bg-slate-950/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded-full w-1/2"></div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="h-20 bg-white/5 rounded-2xl border border-white/5"></div>
                                    <div className="h-20 bg-white/5 rounded-2xl border border-white/5"></div>
                                </div>
                                <div className="h-32 bg-white/5 rounded-2xl border border-white/5 mt-4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
