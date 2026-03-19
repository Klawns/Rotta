import { LucideIcon } from "lucide-react";
import { SimulatorClient, SimulatorPreset } from "../_hooks/use-simulator";

export interface TutorialStep {
    title: string;
    icon: LucideIcon;
    content: React.ReactNode;
}

export interface GetStepsProps {
    simPresets: SimulatorPreset[];
    addPreset: (preset: SimulatorPreset) => void;
    selectedClient: SimulatorClient | null;
    setSelectedClient: (client: SimulatorClient | null) => void;
    simClients: SimulatorClient[];
    addClient: (name: string) => void;
    setIsFinished: (finished: boolean) => void;
    next: () => void;
}
