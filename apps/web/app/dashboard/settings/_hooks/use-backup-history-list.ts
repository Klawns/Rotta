'use client';

import { useMemo, useState } from 'react';
import type { BackupJobSummary } from '@/types/backups';

const DEFAULT_BACKUPS_BATCH_SIZE = 10;

function getSyncedVisibleCount(
  currentVisibleCount: number,
  totalItems: number,
  batchSize: number,
) {
  if (totalItems === 0) {
    return batchSize;
  }

  const minimumVisibleCount = Math.min(batchSize, totalItems);

  return Math.min(
    Math.max(currentVisibleCount, minimumVisibleCount),
    totalItems,
  );
}

export function useBackupHistoryList(
  backups: BackupJobSummary[],
  batchSize = DEFAULT_BACKUPS_BATCH_SIZE,
) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const syncedVisibleCount = getSyncedVisibleCount(
    visibleCount,
    backups.length,
    batchSize,
  );

  const visibleBackups = useMemo(
    () => backups.slice(0, syncedVisibleCount),
    [backups, syncedVisibleCount],
  );

  const hasMore = syncedVisibleCount < backups.length;

  const loadMore = () => {
    setVisibleCount((currentVisibleCount) =>
      Math.min(
        getSyncedVisibleCount(currentVisibleCount, backups.length, batchSize) +
          batchSize,
        backups.length,
      ),
    );
  };

  return {
    visibleBackups,
    hasMore,
    loadMore,
  };
}
