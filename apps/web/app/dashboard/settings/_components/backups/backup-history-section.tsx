"use client";

import { useRef } from "react";
import { DatabaseBackup, RefreshCcw } from "lucide-react";
import { InfiniteScrollTrigger } from "@/components/dashboard/mobile-dashboard/components/infinite-scroll-trigger";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollBoundaryContainer } from "@/components/ui/scroll-boundary-container";
import type { BackupDownloadState } from "@/hooks/use-backup-download";
import type { BackupJobSummary } from "@/types/backups";
import { BackupHistoryItem } from "./backup-history-item";

interface BackupHistorySectionProps {
  backups: BackupJobSummary[];
  visibleBackups: BackupJobSummary[];
  hasMore: boolean;
  isLoading: boolean;
  error: unknown;
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  onLoadMore: () => void;
  onDownload: (backupId: string) => void;
  onRetry: () => void;
}

function BackupHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="rounded-[1.5rem] border border-border-subtle bg-card/50 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded-full bg-muted/60" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted/50" />
            </div>
            <div className="h-9 w-28 animate-pulse rounded-2xl bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BackupHistorySection({
  backups,
  visibleBackups,
  hasMore,
  isLoading,
  error,
  downloadState,
  isPreparingDownload,
  onLoadMore,
  onDownload,
  onRetry,
}: BackupHistorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialError = Boolean(error) && backups.length === 0;

  return (
    <section
      aria-labelledby="backup-history-title"
      className="rounded-[2rem] border border-border-subtle bg-background/80 p-4 shadow-sm sm:p-5"
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-border-subtle/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-text-secondary/70">
            Historico
          </p>
          <h2
            id="backup-history-title"
            className="text-lg font-display font-bold tracking-tight text-text-primary"
          >
            {backups.length === 1
              ? "1 backup salvo"
              : `${backups.length} backups salvos`}
          </h2>
        </div>

        {error && backups.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-2xl"
            onClick={onRetry}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        ) : null}
      </div>

      {isLoading && backups.length === 0 ? <BackupHistorySkeleton /> : null}

      {!isLoading && hasInitialError ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-border-subtle bg-card/40 px-6 py-16 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-display font-bold tracking-tight text-text-primary">
              Erro ao carregar backups
            </h3>
            <p className="max-w-md text-sm text-text-secondary">
              Nao foi possivel carregar o historico agora.
            </p>
          </div>

          <Button type="button" onClick={onRetry} className="rounded-2xl px-5">
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {!isLoading && !hasInitialError && backups.length === 0 ? (
        <Empty className="rounded-[1.75rem] border border-dashed border-border-subtle bg-card/40 px-6 py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DatabaseBackup />
            </EmptyMedia>
            <EmptyTitle>Nenhum backup salvo ainda</EmptyTitle>
            <EmptyDescription>
              O historico sera preenchido assim que o primeiro backup for
              concluido.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!hasInitialError && backups.length > 0 ? (
        <ScrollBoundaryContainer
          containerRef={scrollContainerRef}
          handoff
          hideScrollbar
          className="max-h-[min(68dvh,44rem)] overflow-y-auto rounded-[1.5rem] border border-border-subtle/80 bg-card/35"
        >
          <div className="divide-y divide-border-subtle/80">
            {visibleBackups.map((backup) => (
              <BackupHistoryItem
                key={backup.id}
                backup={backup}
                downloadState={downloadState}
                isPreparingDownload={isPreparingDownload}
                onDownload={onDownload}
              />
            ))}
          </div>

          <InfiniteScrollTrigger
            onIntersect={onLoadMore}
            hasMore={hasMore}
            isLoading={false}
            rootRef={scrollContainerRef}
          />
        </ScrollBoundaryContainer>
      ) : null}
    </section>
  );
}
