'use client';

import { type ChangeEvent, type RefObject } from 'react';
import { CheckCircle2, FileArchive, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackupImportUploadStepProps {
  step: 1 | 2 | 3 | 4;
  displayedFileName: string | null;
  isPreviewing: boolean;
  isExecuting: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  onPickFile: () => void;
}

export function BackupImportUploadStep({
  step,
  displayedFileName,
  isPreviewing,
  isExecuting,
  fileInputRef,
  onFileChange,
  onPickFile,
}: BackupImportUploadStepProps) {
  return (
    <div
      className={`relative flex gap-4 ${step > 1 ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive text-sm font-bold text-destructive-foreground">
        {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
      </div>
      {step === 1 && (
        <div className="absolute -bottom-10 left-4 top-8 z-0 w-[2px] bg-border-subtle" />
      )}

      <div className="flex-1 pb-4">
        <h4 className="mb-3 font-semibold text-foreground">
          1. Selecionar arquivo de backup (.zip)
        </h4>
        <div className="rounded-2xl border border-dashed border-border-subtle bg-background/40 p-5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={onFileChange}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileArchive className="h-4 w-4 text-primary" />
                Arquivo selecionado
              </div>
              <p className="text-sm text-muted-foreground">
                {displayedFileName ?? 'Nenhum'}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-border-subtle bg-background/50 hover:bg-hover-accent"
              disabled={isPreviewing || isExecuting}
              onClick={onPickFile}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {isPreviewing ? 'Validando...' : 'Fazer upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
