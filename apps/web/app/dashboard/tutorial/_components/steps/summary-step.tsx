"use client";

import { History, BarChart3 } from "lucide-react";

export function SummaryStep() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-8 bg-slate-800/40 rounded-[2rem] border border-white/5 text-center group hover:bg-emerald-500/10 transition-all">
                    <History className="mx-auto text-emerald-400 mb-4 group-hover:scale-110 transition-transform" size={40} />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Histórico</p>
                </div>
                <div className="p-8 bg-slate-800/40 rounded-[2rem] border border-white/5 text-center group hover:bg-violet-500/10 transition-all">
                    <BarChart3 className="mx-auto text-violet-400 mb-4 group-hover:scale-110 transition-transform" size={40} />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Ganhos</p>
                </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-lg">
                Acompanhe quanto cada cliente deve, veja seu faturamento total e receba sugestões para otimizar suas rotas.
                Tudo pronto para você crescer.
            </p>
        </div>
    );
}
