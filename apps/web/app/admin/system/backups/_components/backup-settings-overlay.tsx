'use client';

import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight, PencilLine } from 'lucide-react';
import { QueryErrorState } from '@/components/query-error-state';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/components/ui/use-mobile';
import { useBackupSettingsForm } from '../_hooks/use-backup-settings-form';
import type {
  BackupSettingsSummaryViewModel,
  SystemBackupSettingsDto,
  UpdateSystemBackupSettingsDto,
} from '../_types/admin-backups.types';
import { BackupSettingsForm } from './backup-settings-form';

interface BackupSettingsOverlayProps {
  settings: SystemBackupSettingsDto | null;
  settingsSummary: BackupSettingsSummaryViewModel | null;
  isLoading: boolean;
  error: unknown;
  isSaving: boolean;
  onRetry: () => void;
  onSave: (input: UpdateSystemBackupSettingsDto) => Promise<unknown>;
}

function createFallbackSettings(): SystemBackupSettingsDto {
  return {
    enabled: false,
    providerId: '--',
    scheduler: {
      health: 'disabled',
      lastSyncedAt: null,
    },
    schedule: {
      mode: 'disabled',
      fixedTime: null,
      intervalMinutes: null,
    },
    retention: {
      mode: 'count',
      maxCount: 7,
      maxAgeDays: null,
    },
  };
}

function BackupSettingsOverlaySkeleton() {
  return (
    <div className="space-y-4 px-4 pb-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

function BackupSettingsSnapshot({
  settingsSummary,
}: {
  settingsSummary: BackupSettingsSummaryViewModel;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="space-y-3">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Provider
            </p>
            <p className="break-words text-sm font-medium text-foreground">
              {settingsSummary.providerLabel}
            </p>
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Scheduler
            </p>
            <p className="break-words text-sm font-medium text-foreground">
              {settingsSummary.schedulerLabel}
            </p>
          </div>
        </div>

        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            aria-label={isExpanded ? 'Ocultar detalhes' : 'Exibir detalhes'}
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            {isExpanded ? 'Ocultar detalhes' : 'Ver mais'}
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="mt-4 grid gap-x-6 gap-y-4 border-t pt-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Ultima sincronizacao
            </p>
            <p className="break-words text-sm font-medium leading-6 text-foreground">
              {settingsSummary.lastSyncedLabel}
            </p>
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Agendamento
            </p>
            <p className="break-words text-sm font-medium leading-6 text-foreground">
              {settingsSummary.scheduleSummary}
            </p>
          </div>

          <div className="min-w-0 space-y-1 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Retencao
            </p>
            <p className="break-words text-sm font-medium leading-6 text-foreground">
              {settingsSummary.retentionSummary}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function BackupSettingsOverlay({
  settings,
  settingsSummary,
  isLoading,
  error,
  isSaving,
  onRetry,
  onSave,
}: BackupSettingsOverlayProps) {
  const isMobile = useIsMobile();
  const form = useBackupSettingsForm({
    settings: settings ?? createFallbackSettings(),
    onSave,
  });

  const body = (
    <div className="space-y-6 pb-6">
      {isLoading ? <BackupSettingsOverlaySkeleton /> : null}

      {!isLoading && error ? (
        <div className="px-4 pb-4">
          <QueryErrorState
            error={error}
            title="Nao foi possivel carregar as configuracoes"
            description="A configuracao do backup sistemico falhou ao carregar."
            onRetry={onRetry}
          />
        </div>
      ) : null}

      {!isLoading && !error && settingsSummary ? (
        <>
          <section className="space-y-4 px-4">
            <div className="border-b pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Estado atual
              </p>
            </div>
            <BackupSettingsSnapshot settingsSummary={settingsSummary} />
          </section>

          {settingsSummary.failoverDetails ? (
            <section className="space-y-3 px-4">
              <div className="border-b pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Ultimo incidente
                </p>
              </div>
              <Collapsible>
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2 font-medium">
                        <AlertCircle className="size-4" />
                        Falha recente com fallback
                      </div>
                      {settingsSummary.failoverNotice ? (
                        <p className="break-words leading-6">
                          {settingsSummary.failoverNotice}
                        </p>
                      ) : null}
                    </div>

                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 border-warning/30 bg-background/70 text-warning hover:bg-background"
                      >
                        Ver detalhes
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="mt-3 border-t border-warning/20 pt-3">
                      <p className="break-words leading-6">
                        {settingsSummary.failoverDetails}
                      </p>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </section>
          ) : null}

          <section className="space-y-4 px-4">
            <div className="border-b pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Regras
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ajuste agendamento e retencao do fluxo de backup tecnico.
              </p>
            </div>
            <BackupSettingsForm
              values={form.values}
              errors={form.errors}
              isSaving={isSaving}
              onScheduleModeChange={form.setScheduleMode}
              onFixedTimeChange={form.setFixedTime}
              onIntervalMinutesChange={form.setIntervalMinutes}
              onRetentionModeChange={form.setRetentionMode}
              onMaxCountChange={form.setMaxCount}
              onMaxAgeDaysChange={form.setMaxAgeDays}
              onCancel={form.cancelEditing}
              onSubmit={() => void form.submit()}
              showTopBorder={false}
            />
          </section>
        </>
      ) : null}
    </div>
  );

  const trigger = (
    <Button
      variant="outline"
      onClick={form.startEditing}
      disabled={isSaving}
      className="min-w-40"
    >
      <PencilLine />
      Configurar backups
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer
          open={form.isEditing}
          onOpenChange={(open) => {
            if (!open) {
              form.cancelEditing();
            }
          }}
        >
          <DrawerContent className="max-h-[90vh] overflow-hidden rounded-t-3xl border-border">
            <DrawerHeader className="px-4 pt-5 text-left">
              <DrawerTitle>Configuracoes de backup</DrawerTitle>
              <DrawerDescription>
                Ajuste agendamento e retencao sem poluir a tela principal.
              </DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 overflow-y-auto overscroll-contain scrollbar-hide">
              {body}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Sheet
        open={form.isEditing}
        onOpenChange={(open) => {
          if (!open) {
            form.cancelEditing();
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-hidden sm:max-w-xl"
        >
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle>Configuracoes de backup</SheetTitle>
            <SheetDescription>
              Ajuste agendamento e retencao sem poluir a tela principal.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide py-4">
            {body}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
