"use client";

import { SimulatorPDFExport } from "../simulator-pdf-export";

export function ExportStep() {
    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <SimulatorPDFExport />
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
                Escolha o período e gere relatórios profissionais. Use filtros na tela de <b>Corridas</b> para encontrar registros específicos por cliente ou data.
            </p>
        </div>
    );
}
