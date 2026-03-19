import { CheckCircle2 } from "lucide-react";

export function SettingsTip() {
    return (
        <div className="flex items-start gap-4 p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20">
            <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
            <div>
                <h4 className="font-bold text-white text-sm">Dica Pro</h4>
                <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                    Organize seus atalhos por distância ou região. Por exemplo, crie um atalho "CENTRO" com valor R$ 15,00
                    e outro "AIRPORT" com valor R$ 80,00. Isso agiliza seu dia a dia em até 80%!
                </p>
            </div>
        </div>
    );
}
