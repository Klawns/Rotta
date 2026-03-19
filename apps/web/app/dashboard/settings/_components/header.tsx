import { Settings } from "lucide-react";

export function SettingsHeader() {
    return (
        <header>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                    <Settings size={24} />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
            </div>
            <p className="text-slate-400">Personalize seu fluxo de trabalho e atalhos de faturamento.</p>
        </header>
    );
}
