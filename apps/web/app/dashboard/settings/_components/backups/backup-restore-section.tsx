'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  FileArchive,
  RotateCcw,
  UploadCloud,
} from 'lucide-react';
import { ConfirmDangerousActionModal } from '@/components/confirm-dangerous-action-modal';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { BackupImportJobResponse } from '@/types/backups';
import { getBackupRestoreFlowPresentation } from '../../_mappers/backup-restore.presenter';
import { BackupRestoreStepper } from './backup-restore-stepper';

interface BackupRestoreSectionProps {
  preview: BackupImportJobResponse | null;
  isPreviewing: boolean;
  isExecuting: boolean;
  onPreview: (file: File) => Promise<unknown>;
  onExecute: (importJobId: string) => Promise<unknown>;
  onReset: () => void;
}

function getModulesSummary(preview: BackupImportJobResponse['preview']) {
  const counts = preview.counts;

  return [
    { label: 'Clientes', value: counts.clients },
    { label: 'Corridas', value: counts.rides },
    { label: 'Pagamentos', value: counts.client_payments },
    { label: 'Lancamentos', value: counts.balance_transactions },
    { label: 'Presets', value: counts.ride_presets },
  ];
}

export function BackupRestoreSection({
  preview,
  isPreviewing,
  isExecuting,
  onPreview,
  onExecute,
  onReset,
}: BackupRestoreSectionProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const presentation = getBackupRestoreFlowPresentation({
    preview,
    selectedFileName,
    isOpen,
    isExecuting,
    currentUserId: user?.id,
    currentUserName: user?.name,
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFileName(file.name);

    try {
      await onPreview(file);
      setIsOpen(true);
    } catch {
      setSelectedFileName(null);
    } finally {
      event.target.value = '';
    }
  };

  const handleConfirmRestore = async () => {
    if (!preview) {
      return;
    }

    try {
      await onExecute(preview.id);
      setIsConfirmModalOpen(false);
      setIsOpen(true);
    } catch {
      // Mutation already exposes feedback through toast and inline state.
    }
  };

  return (
    <section
      aria-labelledby="backup-restore-title"
      className="rounded-[2rem] border border-destructive/20 bg-destructive/[0.04] shadow-sm"
    >
      <Collapsible open={presentation.isExpanded} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-destructive/[0.05] sm:p-6"
            disabled={!presentation.canToggle}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-destructive/70">
                  Zona de risco
                </p>
                <h2
                  id="backup-restore-title"
                  className="text-lg font-display font-bold tracking-tight text-text-primary"
                >
                  Restaurar dados a partir de backup
                </h2>
                <p className="max-w-2xl text-sm text-text-secondary">
                  Esta acao substitui os dados atuais. Um backup de seguranca e criado antes da restauracao.
                </p>
              </div>
            </div>

            <ChevronDown
              className={cn(
                'h-5 w-5 shrink-0 text-destructive transition-transform duration-200',
                presentation.isExpanded && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="space-y-5 border-t border-destructive/15 p-5 sm:p-6">
            <BackupRestoreStepper steps={presentation.steps} />

            <div className="rounded-[1.5rem] border border-border-subtle bg-background/75 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">
                    Arquivo selecionado
                  </p>
                  <p className="text-sm text-text-secondary">
                    {presentation.displayedFileName ?? 'Nenhum arquivo validado'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,application/zip"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    disabled={isPreviewing || isExecuting}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {isPreviewing ? 'Validando...' : 'Selecionar arquivo'}
                  </Button>

                  {(preview || selectedFileName) && presentation.mode !== 'running' ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-2xl"
                      onClick={() => {
                        setSelectedFileName(null);
                        setIsOpen(false);
                        onReset();
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Limpar
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {preview ? (
              <div className="rounded-[1.5rem] border border-border-subtle bg-background/75 p-4">
                <div className="flex flex-col gap-4 border-b border-border-subtle/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                      <FileArchive className="h-4 w-4 text-primary" />
                      Preview validado
                    </div>
                    <p className="text-sm text-text-secondary">
                      Origem: <span className="font-medium text-text-primary">{presentation.ownerDisplayName}</span>
                      {' · '}
                      Criado em <span className="font-medium text-text-primary">{presentation.createdAtLabel}</span>
                    </p>
                  </div>

                  {presentation.mode === 'validated' || presentation.mode === 'failed' ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="rounded-2xl sm:min-w-52"
                      disabled={isExecuting}
                      onClick={() => setIsConfirmModalOpen(true)}
                    >
                      {presentation.executeButtonLabel}
                    </Button>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {getModulesSummary(preview.preview).map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1rem] border border-border-subtle bg-card/45 px-3 py-3"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-text-primary">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {preview.preview.warnings.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {preview.preview.warnings.map((warning) => (
                      <div
                        key={warning}
                        className="rounded-[1rem] border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-text-primary"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                ) : null}

                {presentation.statusMessage ? (
                  <div
                    className={cn(
                      'mt-4 rounded-[1rem] border px-4 py-3 text-sm',
                      presentation.mode === 'failed'
                        ? 'border-destructive/20 bg-destructive/10 text-destructive'
                        : presentation.mode === 'success'
                          ? 'border-success/20 bg-success/10 text-success'
                          : 'border-primary/20 bg-primary/10 text-text-primary',
                    )}
                  >
                    {presentation.statusMessage}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ConfirmDangerousActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmRestore}
        isLoading={isExecuting}
        title="Restaurar backup"
        description="Antes de restaurar, o sistema vai gerar um backup de seguranca do estado atual. Depois disso, os dados atuais serao substituidos pelo conteudo deste arquivo. Esta acao e irreversivel."
        requiredText="RESTAURAR"
      />
    </section>
  );
}
