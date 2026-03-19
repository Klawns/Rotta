"use client";

import { useState } from "react";

export interface SimulatorClient {
    name: string;
}

export interface SimulatorPreset {
    label: string;
    value: number;
}

export function useSimulator() {
    const [simClients, setSimClients] = useState<SimulatorClient[]>([
        { name: "João Silva" },
        { name: "Maria Oliveira" }
    ]);
    const [selectedClient, setSelectedClient] = useState<SimulatorClient | null>(null);
    const [simPresets, setSimPresets] = useState<SimulatorPreset[]>([
        { label: "MÉDIA", value: 15 },
        { label: "LONGA", value: 25 }
    ]);
    const [isFinished, setIsFinished] = useState(false);

    const addClient = (name: string) => {
        setSimClients(prev => [...prev, { name }]);
    };

    const addPreset = (preset: SimulatorPreset) => {
        setSimPresets(prev => [...prev, preset]);
    };

    const resetSimulation = () => {
        setSelectedClient(null);
        setIsFinished(false);
    };

    return {
        simClients,
        selectedClient,
        setSelectedClient,
        simPresets,
        isFinished,
        setIsFinished,
        addClient,
        addPreset,
        resetSimulation
    };
}
