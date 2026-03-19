"use client";

import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    canNext: boolean;
    rideToEdit?: boolean;
}

export function NavigationButtons({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    onSubmit,
    isSubmitting,
    canNext,
    rideToEdit
}: NavigationButtonsProps) {
    return (
        <div className="flex gap-3 mt-auto pt-8">
            {currentStep > 1 && (
                <button
                    type="button"
                    onClick={onBack}
                    className="h-14 px-6 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-bold hover:bg-white/10 active:scale-95 transition-all"
                >
                    <ChevronRight size={20} className="rotate-180" />
                </button>
            )}

            {currentStep < totalSteps ? (
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!canNext}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-30"
                >
                    {currentStep === 4 ? "REVISAR" : "CONTINUAR"}
                    <ChevronRight size={20} />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <div className="h-6 w-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            {rideToEdit ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR E REGISTRAR'}
                            <CheckCircle2 size={24} />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
