"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SimulatorClientSelector } from "../simulator-client-selector";
import { SimulatorRideForm } from "../simulator-ride-form";
import { SimulatorClient, SimulatorPreset } from "../../_hooks/use-simulator";

interface PracticeStepProps {
    selectedClient: SimulatorClient | null;
    setSelectedClient: (client: SimulatorClient | null) => void;
    simClients: SimulatorClient[];
    addClient: (name: string) => void;
    simPresets: SimulatorPreset[];
    setIsFinished: (finished: boolean) => void;
    next: () => void;
}

export function PracticeStep({
    selectedClient,
    setSelectedClient,
    simClients,
    addClient,
    simPresets,
    setIsFinished,
    next
}: PracticeStepProps) {
    return (
        <div className="space-y-6">
            <div className="glass-card bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
                <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg pulse-shadow uppercase tracking-widest">Pratique Agora</div>

                {!selectedClient ? (
                    <SimulatorClientSelector
                        clients={simClients}
                        onSelect={setSelectedClient}
                        onAddClient={addClient}
                    />
                ) : (
                    <SimulatorRideForm
                        client={selectedClient}
                        presets={simPresets.length > 0 ? simPresets : [{ label: "EXTRA", value: 10 }]}
                        onComplete={() => {
                            setSelectedClient(null);
                            setIsFinished(true);
                            next();
                        }}
                    />
                )}
            </div>
            {!selectedClient && (
                <div className="flex items-center gap-3 p-5 bg-white/5 rounded-3xl border border-white/5">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><Plus className="text-blue-500" size={24} /></motion.div>
                    <p className="text-sm text-slate-400 font-bold italic lowercase">Tente selecionar um cliente ou criar um novo no simulador acima.</p>
                </div>
            )}
        </div>
    );
}
