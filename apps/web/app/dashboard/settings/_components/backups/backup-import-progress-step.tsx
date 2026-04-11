'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import type { BackupImportJobResponse } from '@/types/backups';

interface BackupImportProgressStepProps {
  stepNumber: 3 | 4;
  title: string;
  description: string;
  executionPhase: BackupImportJobResponse['phase'] | null;
}

export function BackupImportProgressStep({
  stepNumber,
  title,
  description,
  executionPhase,
}: BackupImportProgressStepProps) {
  const isImportingPhase = executionPhase === 'importing';
  const isActive = stepNumber === 3 ? !isImportingPhase : isImportingPhase;
  const badgeClassName =
    stepNumber === 3
      ? isImportingPhase
        ? 'bg-success text-success-foreground'
        : 'bg-primary text-primary-foreground'
      : isImportingPhase
        ? 'bg-warning text-warning-foreground'
        : 'bg-muted text-muted-foreground';
  const panelClassName =
    stepNumber === 3
      ? 'border-primary/20 bg-primary/5'
      : 'border-warning/20 bg-warning/10';

  return (
    <div className="relative flex gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badgeClassName}`}
      >
        {isActive ? (
          isImportingPhase && stepNumber === 3 ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )
        ) : (
          String(stepNumber)
        )}
      </div>

      <div className="flex-1">
        <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
        <div className={`rounded-2xl border p-4 text-sm text-foreground/80 ${panelClassName}`}>
          {description}
        </div>
      </div>
    </div>
  );
}
