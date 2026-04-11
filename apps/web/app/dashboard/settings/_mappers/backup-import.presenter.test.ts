import assert from 'node:assert/strict';
import test from 'node:test';
import { getBackupImportCardPresentation } from './backup-import.presenter';

test('keeps the import card expanded and advances step while execution is running', () => {
  const presentation = getBackupImportCardPresentation({
    preview: {
      id: 'import-1',
      status: 'running',
      phase: 'backing_up',
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
    },
    selectedFileName: 'backup.zip',
    isOpen: false,
    isExecuting: true,
    currentUserId: 'user-1',
    currentUserName: 'Maria',
  });

  assert.equal(presentation.isExpanded, true);
  assert.equal(presentation.canToggle, false);
  assert.equal(presentation.step, 3);
  assert.equal(presentation.ownerDisplayName, 'Maria');
  assert.equal(
    presentation.executeButtonLabel,
    'Gerando backup de seguranca...',
  );
});

test('hides file name until there is a valid preview', () => {
  const presentation = getBackupImportCardPresentation({
    preview: null,
    selectedFileName: 'backup.zip',
    isOpen: true,
    isExecuting: false,
  });

  assert.equal(presentation.displayedFileName, null);
  assert.equal(presentation.step, 1);
  assert.equal(presentation.executeButtonLabel, 'Confirmar e Restaurar');
});
