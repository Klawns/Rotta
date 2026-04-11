'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BackupImportJobResponse } from '@/types/backups';

interface BackupImportReviewStepProps {
  step: 1 | 2 | 3 | 4;
  preview: BackupImportJobResponse | null;
  ownerDisplayName: string | null;
  createdAtLabel: string | null;
  isExecuting: boolean;
  executeButtonLabel: string;
  onExecute: () => void;
}

export function BackupImportReviewStep({
  step,
  preview,
  ownerDisplayName,
  createdAtLabel,
  isExecuting,
  executeButtonLabel,
  onExecute,
}: BackupImportReviewStepProps) {
  if (!(step === 2 || preview)) {
    return null;
  }

  return (
    <div className="relative animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex gap-4">
        <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning text-sm font-bold text-warning-foreground">
          {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : '2'}
        </div>

        <div className="flex-1">
          <h4 className="mb-3 font-semibold text-foreground">
            2. Revisao e Confirmacao
          </h4>

          {preview && (
            <div className="space-y-4 rounded-2xl border border-warning/20 bg-warning/10 p-5">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Dono original do backup:{' '}
                  <strong className="text-foreground">{ownerDisplayName}</strong>
                  <br />
                  Criado em:{' '}
                  <strong className="text-foreground">{createdAtLabel}</strong>
                </p>
                <div className="rounded-xl border border-border-subtle bg-background/50 px-3 py-3 text-xs font-medium text-foreground/80">
                  Ao confirmar, o sistema primeiro gera um backup de seguranca
                  do estado atual e, em seguida, aplica os dados do arquivo
                  selecionado.
                </div>
              </div>

              {preview.preview.warnings.length > 0 && (
                <div className="mb-4 space-y-2">
                  {preview.preview.warnings.map((warning) => (
                    <div
                      key={warning}
                      className="rounded-xl border border-warning/20 bg-background/50 px-3 py-2 text-xs font-medium text-foreground"
                    >
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              {preview.status === 'failed' && preview.errorMessage && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-3 text-xs font-medium text-destructive">
                  {preview.errorMessage}
                </div>
              )}

              <div className="flex justify-start">
                <Button
                  variant="destructive"
                  className="w-full font-bold sm:w-auto"
                  disabled={isExecuting}
                  onClick={onExecute}
                >
                  {executeButtonLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
