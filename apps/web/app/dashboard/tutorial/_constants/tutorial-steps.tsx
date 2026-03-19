"use client";

import { Bike, Search, Settings, Zap, Filter, BarChart3 } from "lucide-react";
import { TutorialStep, GetStepsProps } from "./types";

// Step Components
import { IntroStep } from "../_components/steps/intro-step";
import { ShortcutsStep } from "../_components/steps/shortcuts-step";
import { PracticeStep } from "../_components/steps/practice-step";
import { NavigationStep } from "../_components/steps/navigation-step";
import { ExportStep } from "../_components/steps/export-step";
import { SummaryStep } from "../_components/steps/summary-step";

export function getTutorialSteps({
    simPresets,
    addPreset,
    selectedClient,
    setSelectedClient,
    simClients,
    addClient,
    setIsFinished,
    next
}: GetStepsProps): TutorialStep[] {
    return [
        {
            title: "O que é o Rotta?",
            icon: Bike,
            content: <IntroStep />
        },
        {
            title: "Poder dos Atalhos",
            icon: Settings,
            content: (
                <ShortcutsStep 
                    presets={simPresets} 
                    onAdd={addPreset} 
                />
            )
        },
        {
            title: "Simulador: Cadastro",
            icon: Zap,
            content: (
                <PracticeStep 
                    selectedClient={selectedClient}
                    setSelectedClient={setSelectedClient}
                    simClients={simClients}
                    addClient={addClient}
                    simPresets={simPresets}
                    setIsFinished={setIsFinished}
                    next={next}
                />
            )
        },
        {
            title: "Onde encontrar?",
            icon: Search,
            content: <NavigationStep />
        },
        {
            title: "Exportação PDF",
            icon: Filter,
            content: <ExportStep />
        },
        {
            title: "Controle Total",
            icon: BarChart3,
            content: <SummaryStep />
        }
    ];
}
