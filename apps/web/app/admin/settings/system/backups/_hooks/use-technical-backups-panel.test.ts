import assert from 'node:assert/strict';
import test from 'node:test';
import type { BackupJobSummary } from '@/types/backups';
import {
  clampTechnicalBackupsPage,
  filterTechnicalBackups,
  getTechnicalBackupsTotalPages,
  paginateTechnicalBackups,
} from './use-technical-backups-panel';

const backups: BackupJobSummary[] = [
  {
    id: 'backup-1',
    kind: 'technical_full',
    trigger: 'manual',
    status: 'success',
    checksum: 'checksum-1',
    sizeBytes: 1024,
    manifestVersion: 1,
    errorMessage: null,
    createdAt: '2026-04-01T10:00:00.000Z',
    startedAt: '2026-04-01T10:00:01.000Z',
    finishedAt: '2026-04-01T10:00:02.000Z',
    metadata: null,
  },
  {
    id: 'backup-2',
    kind: 'technical_full',
    trigger: 'scheduled',
    status: 'failed',
    checksum: null,
    sizeBytes: null,
    manifestVersion: 1,
    errorMessage: 'erro',
    createdAt: '2026-04-02T10:00:00.000Z',
    startedAt: null,
    finishedAt: null,
    metadata: null,
  },
  {
    id: 'backup-3',
    kind: 'technical_full',
    trigger: 'scheduled',
    status: 'running',
    checksum: null,
    sizeBytes: null,
    manifestVersion: 1,
    errorMessage: null,
    createdAt: '2026-04-03T10:00:00.000Z',
    startedAt: null,
    finishedAt: null,
    metadata: null,
  },
];

test('filters technical backups by status and trigger together', () => {
  const result = filterTechnicalBackups(backups, {
    statusFilter: 'failed',
    triggerFilter: 'scheduled',
  });

  assert.deepEqual(result.map((backup) => backup.id), ['backup-2']);
});

test('clamps the current page when the total page count shrinks', () => {
  assert.equal(clampTechnicalBackupsPage(4, 2), 2);
  assert.equal(clampTechnicalBackupsPage(0, 2), 1);
  assert.equal(clampTechnicalBackupsPage(3, 0), 1);
});

test('calculates and paginates the rows without overflowing the slice', () => {
  const largeList = Array.from({ length: 21 }, (_, index) => ({
    ...backups[0],
    id: `backup-${index + 1}`,
  }));

  assert.equal(getTechnicalBackupsTotalPages(largeList.length), 3);
  assert.deepEqual(
    paginateTechnicalBackups(largeList, 3).map((backup) => backup.id),
    ['backup-21'],
  );
});
