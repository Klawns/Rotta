"use client";

import { SimulatorShortcuts } from "../simulator-shortcuts";
import { SimulatorPreset } from "../../_hooks/use-simulator";

interface ShortcutsStepProps {
    presets: SimulatorPreset[];
    onAdd: (preset: SimulatorPreset) => void;
}

export function ShortcutsStep({ presets, onAdd }: ShortcutsStepProps) {
    return (
        <div className="space-y-6 text-left">
            <SimulatorShortcuts
                presets={presets}
                onAdd={onAdd}
            />
            <p className="text-slate-400 leading-relaxed">
                Experimente criar um atalho acima (ex: R$ 10 - CENTRO).
                Esses botões aparecerão na sua tela de registro para agilizar seu trabalho na rua.
                <span className="text-blue-400 font-bold block mt-2">Dica: Configure isso uma vez e ganhe 80% de produtividade!</span>
            </p>
        </div>
    );
}
