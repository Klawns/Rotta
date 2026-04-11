import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatBackupHistoryRelativeDate,
  getBackupHistoryRowPresentation,
} from './backup-history.presenter';

test('keeps failed download feedback on the matching backup row', () => {
  const presentation = getBackupHistoryRowPresentation(
    {
      id: 'backup-1',
      kind: 'functional_user',
      trigger: 'manual',
      status: 'success',
      checksum: null,
      sizeBytes: 0,
      manifestVersion: 2,
      errorMessage: null,
      createdAt: '2026-04-01T10:00:00.000Z',
      startedAt: null,
      finishedAt: null,
      metadata: null,
    },
    {
      downloadState: {
        backupId: 'backup-1',
        phase: 'failed',
        message: 'falhou',
      },
      isPreparingDownload: false,
    },
  );

  assert.equal(presentation.sizeLabel, '0,00 MB');
  assert.equal(presentation.download.label, 'Tentar novamente');
  assert.equal(presentation.download.isDisabled, false);
  assert.equal(presentation.download.isFeedbackVisible, true);
  assert.equal(presentation.download.rowToneClassName, 'bg-destructive/5');
});

test('formats today and yesterday labels with calendar awareness', () => {
  const now = new Date(2026, 3, 10, 15, 30, 0);

  assert.equal(
    formatBackupHistoryRelativeDate(new Date(2026, 3, 10, 10, 0, 0), now),
    'Hoje, 10:00',
  );
  assert.equal(
    formatBackupHistoryRelativeDate(new Date(2026, 3, 9, 23, 30, 0), now),
    'Ontem, 23:30',
  );
  assert.equal(
    formatBackupHistoryRelativeDate('invalid', now),
    'Data indisponivel',
  );
});
