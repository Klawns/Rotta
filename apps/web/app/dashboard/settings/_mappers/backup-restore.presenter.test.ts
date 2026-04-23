import assert from 'node:assert/strict';
import test from 'node:test';
import type { BackupImportJobResponse } from '@/types/backups';
import { getBackupRestoreFlowPresentation } from './backup-restore.presenter';

function createPreview(
  overrides: Partial<BackupImportJobResponse>,
): BackupImportJobResponse {
  return {
    id: 'import-1',
    status: 'validated',
    phase: 'validated',
    errorMessage: null,
    createdAt: null,
    startedAt: null,
    finishedAt: null,
    preview: {
      manifestVersion: 1,
      ownerUserId: 'user-1',
      ownerName: null,
      createdAt: '2026-04-10T12:00:00.000Z',
      archiveChecksum: 'abc',
      sizeBytes: 10,
      modules: ['clients'],
      counts: {
        clients: 1,
        rides: 0,
        client_payments: 0,
        balance_transactions: 0,
        ride_presets: 0,
      },
      warnings: [],
    },
    ...overrides,
  };
}

test('keeps the restore flow idle until a file is validated', () => {
  const presentation = getBackupRestoreFlowPresentation({
    preview: null,
    selectedFileName: 'backup.zip',
    isOpen: false,
    isExecuting: false,
  });

  assert.equal(presentation.mode, 'idle');
  assert.equal(presentation.displayedFileName, null);
  assert.equal(presentation.steps[0].state, 'current');
});

test('shows review state after validation', () => {
  const presentation = getBackupRestoreFlowPresentation({
    preview: createPreview({ status: 'validated', phase: 'validated' }),
    selectedFileName: 'backup.zip',
    isOpen: true,
    isExecuting: false,
    currentUserId: 'user-1',
    currentUserName: 'Maria',
  });

  assert.equal(presentation.mode, 'validated');
  assert.equal(presentation.ownerDisplayName, 'Maria');
  assert.equal(presentation.steps[1].state, 'current');
});

test('locks the section open while restore is running', () => {
  const presentation = getBackupRestoreFlowPresentation({
    preview: createPreview({ status: 'running', phase: 'backing_up' }),
    selectedFileName: 'backup.zip',
    isOpen: false,
    isExecuting: true,
  });

  assert.equal(presentation.mode, 'running');
  assert.equal(presentation.isExpanded, true);
  assert.equal(presentation.canToggle, false);
  assert.equal(presentation.steps[2].state, 'current');
});

test('marks the restore step as danger when execution fails', () => {
  const presentation = getBackupRestoreFlowPresentation({
    preview: createPreview({
      status: 'failed',
      phase: 'failed',
      errorMessage: 'Arquivo invalido',
    }),
    selectedFileName: 'backup.zip',
    isOpen: true,
    isExecuting: false,
  });

  assert.equal(presentation.mode, 'failed');
  assert.equal(presentation.steps[3].state, 'danger');
  assert.equal(presentation.statusMessage, 'Arquivo invalido');
});

test('marks the final step as success after restore completion', () => {
  const presentation = getBackupRestoreFlowPresentation({
    preview: createPreview({ status: 'success', phase: 'completed' }),
    selectedFileName: 'backup.zip',
    isOpen: true,
    isExecuting: false,
  });

  assert.equal(presentation.mode, 'success');
  assert.equal(presentation.steps[3].state, 'success');
  assert.match(presentation.statusMessage || '', /concluida/i);
});
