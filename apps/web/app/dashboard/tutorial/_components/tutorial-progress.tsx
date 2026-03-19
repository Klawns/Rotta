"use client";

import { cn } from "@/lib/utils";

interface TutorialProgressProps {
    currentStep: number;
    totalSteps: number;
}

export function TutorialProgress({ currentStep, totalSteps }: TutorialProgressProps) {
    return (
        <div className="mb-8 md:mb-12 flex items-center justify-between">
            <div className="flex gap-1.5 md:gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 md:h-2 rounded-full transition-all duration-700",
                            i <= currentStep ? "w-6 md:w-10 bg-blue-600" : "w-2 md:w-3 bg-slate-800"
                        )}
                    />
                ))}
            </div>
            <span className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] italic">
                {currentStep + 1} / {totalSteps} STEP
            </span>
        </div>
    );
}
