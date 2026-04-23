'use client';

import { CalendarDays, Clock3, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getBackupsOverviewPresentation } from '../../_mappers/backups-overview.presenter';

interface BackupsOverviewSectionProps {
  latestBackupAt?: string | null;
  retentionCount: number;
  isCreating: boolean;
  isAutomationActive: boolean;
  functionalCron?: string | null;
  isLoading: boolean;
  onCreate: () => void;
}

const metricIcons = {
  latest: Clock3,
  automation: ShieldCheck,
  retention: CalendarDays,
} as const;

export function BackupsOverviewSection({
  latestBackupAt,
  retentionCount,
  isCreating,
  isAutomationActive,
  functionalCron,
  isLoading,
  onCreate,
}: BackupsOverviewSectionProps) {
  const presentation = getBackupsOverviewPresentation({
    latestBackupAt,
    retentionCount,
    isAutomationActive,
    functionalCron,
  });

  return (
    <section
      aria-labelledby="backups-overview-title"
      className="rounded-[2rem] border border-border-subtle bg-background/80 p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 border-b border-border-subtle/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary/70">
            Visao geral
          </p>
          <h2
            id="backups-overview-title"
            className="text-lg font-display font-bold tracking-tight text-text-primary"
          >
            Backups funcionais
          </h2>
        </div>

        <Button
          onClick={onCreate}
          disabled={isCreating}
          className="h-11 rounded-2xl px-5"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? 'Enfileirando...' : 'Gerar backup agora'}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {presentation.metrics.map((metric) => {
          const Icon = metricIcons[metric.id];

          return (
            <div
              key={metric.id}
              className="rounded-[1.5rem] border border-border-subtle bg-card/60 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
                    metric.toneClassName,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                    {metric.label}
                  </p>
                  {isLoading ? (
                    <div className="h-5 w-32 animate-pulse rounded-full bg-muted/60" />
                  ) : (
                    <p className="text-sm font-semibold text-text-primary">
                      {metric.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
