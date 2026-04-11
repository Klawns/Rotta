'use client';

import { useRef } from 'react';
import { HybridInfiniteList } from '@/components/ui/hybrid-infinite-list';
import { InfiniteScrollContainer } from '@/components/ui/infinite-scroll-container';
import { useBackupHistoryList } from '../../_hooks/use-backup-history-list';
import { BackupHistoryRow } from './backup-history-row';
import type { BackupDownloadState } from '@/hooks/use-backup-download';
import type { BackupJobSummary } from '@/types/backups';

interface BackupHistoryListProps {
  backups: BackupJobSummary[];
  onDownload: (backupId: string) => void;
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
}

export function BackupHistoryList({
  backups,
  downloadState,
  isPreparingDownload,
  onDownload,
}: BackupHistoryListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { visibleBackups, hasMore, loadMore } = useBackupHistoryList(backups);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">Seus backups</h3>

      {backups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
          Voce ainda nao possui backups armazenados.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card/70 shadow-sm backdrop-blur-xl">
          <div className="hidden grid-cols-12 items-center border-b border-border-subtle bg-muted/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <div className="col-span-3">Data</div>
            <div className="col-span-3">Origem e Tamanho</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3 text-right">Acao</div>
          </div>

          <InfiniteScrollContainer
            ref={scrollContainerRef}
            maxHeight="28rem"
            hideScrollbar={true}
            className="w-full"
            qaId="backups-list"
          >
            <HybridInfiniteList
              items={visibleBackups}
              containerRef={scrollContainerRef}
              estimateSize={112}
              hasMore={hasMore}
              onLoadMore={loadMore}
              listClassName="flex flex-col"
              className="w-full"
              renderItem={(backup, index) => {
                const isLastVisibleItem = index === visibleBackups.length - 1;
                return (
                  <BackupHistoryRow
                    key={backup.id}
                    backup={backup}
                    downloadState={downloadState}
                    isPreparingDownload={isPreparingDownload}
                    hasBorder={!isLastVisibleItem || hasMore}
                    onDownload={onDownload}
                  />
                );
              }}
            />
          </InfiniteScrollContainer>
        </div>
      )}
    </div>
  );
}
