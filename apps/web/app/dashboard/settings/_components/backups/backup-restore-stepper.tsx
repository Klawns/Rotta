'use client';

import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BackupRestoreStepViewModel } from '../../_mappers/backup-restore.presenter';

interface BackupRestoreStepperProps {
  steps: BackupRestoreStepViewModel[];
}

function getStepTone(state: BackupRestoreStepViewModel['state']) {
  switch (state) {
    case 'complete':
      return 'border-success/20 bg-success/10 text-success';
    case 'current':
      return 'border-primary/20 bg-primary/10 text-primary';
    case 'danger':
      return 'border-destructive/20 bg-destructive/10 text-destructive';
    case 'success':
      return 'border-success/20 bg-success/10 text-success';
    case 'upcoming':
    default:
      return 'border-border-subtle bg-background/70 text-text-secondary';
  }
}

function getStepIcon(state: BackupRestoreStepViewModel['state'], index: number) {
  if (state === 'complete' || state === 'success') {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (state === 'current') {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (state === 'danger') {
    return <TriangleAlert className="h-4 w-4" />;
  }

  return <span className="text-xs font-bold">{index + 1}</span>;
}

export function BackupRestoreStepper({ steps }: BackupRestoreStepperProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'rounded-[1.25rem] border p-3',
            getStepTone(step.state),
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/15 bg-background/70">
              {getStepIcon(step.state, index)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-xs text-current/75">{step.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
