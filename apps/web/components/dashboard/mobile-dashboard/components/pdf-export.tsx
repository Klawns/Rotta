"use client";

import { Calendar, FileText, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { PDFService } from "@/services/pdf-service";
import { useToast } from "@/hooks/use-toast";

interface PDFExportProps {
    userName: string;
}

export function PDFExport({ userName }: PDFExportProps) {
    const { toast } = useToast();

    const handleExportPDF = async (period: 'today' | 'week' | 'month') => {
        try {
            const { data } = await api.get(`/rides/stats?period=${period}`);
            if (!data.rides || data.rides.length === 0) {
                toast({ title: "Sem dados para exportar" });
                return;
            }
            toast({ title: "Gerando PDF..." });
            await PDFService.generateReport(data.rides, { period, userName: userName || "Motorista" });
        } catch (err) {
            toast({ title: "Erro ao exportar", variant: "destructive" });
        }
    };

    return (
        <section className="bg-slate-900/40 rounded-3xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText size={18} className="text-orange-400" />
                    Exportar PDF
                </h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
                {['today', 'week', 'month'].map(p => (
                    <button 
                        key={p} 
                        onClick={() => handleExportPDF(p as any)} 
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 active:bg-orange-500/20 transition-all"
                    >
                        <Calendar size={18} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                            {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 flex items-start gap-3 mb-4">
                <Info size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-orange-200/70 leading-relaxed font-medium">
                    Para filtros detalhados por data ou cliente, acesse o painel financeiro completo.
                </p>
            </div>

            <div className="pt-4 border-t border-white/5 text-center">
                <Link href="/dashboard/finance" className="block">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black h-12 rounded-2xl text-xs gap-2 active:scale-95 transition-all">
                        PAINEL FINANCEIRO <ArrowRight size={14} />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
