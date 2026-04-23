import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBackupSettingsSummaryViewModel,
  getSystemBackupFailoverDetails,
  getSystemBackupFailoverSummary,
  getSystemBackupHealthSummary,
  getSystemBackupRetentionSummary,
  getSystemBackupScheduleSummary,
} from './backup-settings.presenter';

test('summarizes schedule and retention for enabled backups', () => {
  assert.equal(
    getSystemBackupScheduleSummary({
      enabled: true,
      schedule: {
        mode: 'interval',
        fixedTime: null,
        intervalMinutes: 90,
      },
    }),
    'A cada 90 minutos',
  );

  assert.equal(
    getSystemBackupRetentionSummary({
      retention: {
        mode: 'count',
        maxCount: 12,
        maxAgeDays: null,
      },
    }),
    'Manter os ultimos 12 arquivos',
  );
});

test('reports environment lock and failover copy in the settings summary', () => {
  const summary = getBackupSettingsSummaryViewModel({
    enabled: false,
    providerId: 'rclone_drive',
    scheduler: {
      health: 'disabled',
      lastSyncedAt: '2026-04-20T12:00:00.000Z',
    },
    schedule: {
      mode: 'fixed_time',
      fixedTime: '04:00',
      intervalMinutes: null,
    },
    retention: {
      mode: 'max_age',
      maxCount: null,
      maxAgeDays: 14,
    },
    failover: {
      enabled: true,
      primaryProviderId: 'rclone_drive',
      fallbackProviderId: 'r2',
      lastFallbackAt: '2026-04-17T12:10:00.000Z',
      lastFallbackBackupId: 'backup-123',
      lastFallbackReason: 'Falha no upload primario.',
    },
  });

  assert.equal(summary.schedulerLabel, 'Desativado por ambiente');
  assert.equal(summary.retentionSummary, 'Arquivos com no maximo 14 dias');
  assert.match(summary.environmentNotice ?? '', /PG_DUMP_BACKUP_ENABLED=false/);
  assert.match(summary.failoverNotice ?? '', /uploads foram redirecionados/);
  assert.match(summary.failoverDetails ?? '', /Falha no upload primario/);
});

test('exposes the scheduler health helper for a failed scheduler', () => {
  const health = getSystemBackupHealthSummary({
    enabled: true,
    scheduler: {
      health: 'failed',
      lastSyncedAt: null,
    },
  });

  assert.equal(health.label, 'Falha no scheduler');
  assert.equal(health.tone, 'danger');
  assert.match(
    getSystemBackupFailoverSummary({
      failover: {
        enabled: true,
        primaryProviderId: 'rclone_drive',
        fallbackProviderId: 'r2',
        lastFallbackAt: null,
        lastFallbackBackupId: null,
        lastFallbackReason: null,
      },
    }) ?? '',
    /redirecionados de rclone_drive para r2/,
  );
  assert.match(
    getSystemBackupFailoverDetails({
      failover: {
        enabled: true,
        primaryProviderId: 'rclone_drive',
        fallbackProviderId: 'r2',
        lastFallbackAt: null,
        lastFallbackBackupId: null,
        lastFallbackReason: null,
      },
    }) ?? '',
    /rclone_drive -> r2/,
  );
});
