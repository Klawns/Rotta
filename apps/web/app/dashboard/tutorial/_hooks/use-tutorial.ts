"use client";

import { useState } from "react";

export function useTutorial(totalSteps: number) {
    const [currentStep, setCurrentStep] = useState(0);

    const next = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return {
        currentStep,
        setCurrentStep,
        next,
        prev
    };
}
