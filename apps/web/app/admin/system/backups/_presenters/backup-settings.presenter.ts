import { formatDisplayDateValue } from '@/lib/date-utils';
import type {
  BackupSettingsSummaryViewModel,
  SystemBackupSettingsDto,
} from '../_types/admin-backups.types';

export function getSystemBackupScheduleSummary(
  settings: Pick<SystemBackupSettingsDto, 'enabled' | 'schedule'>,
) {
  if (!settings.enabled) {
    return 'Bloqueado por ambiente';
  }

  switch (settings.schedule.mode) {
    case 'disabled':
      return 'Agendamento desativado';
    case 'interval':
      return `A cada ${settings.schedule.intervalMinutes ?? 0} minutos`;
    case 'fixed_time':
    default:
      return `Todos os dias as ${settings.schedule.fixedTime ?? '04:00'}`;
  }
}

export function getSystemBackupRetentionSummary(
  settings: Pick<SystemBackupSettingsDto, 'retention'>,
) {
  if (settings.retention.mode === 'max_age') {
    return `Arquivos com no maximo ${settings.retention.maxAgeDays ?? 0} dias`;
  }

  return `Manter os ultimos ${settings.retention.maxCount ?? 0} arquivos`;
}

export function getSystemBackupHealthSummary(
  settings: Pick<SystemBackupSettingsDto, 'enabled' | 'scheduler'>,
) {
  if (!settings.enabled) {
    return {
      label: 'Desativado por ambiente',
      tone: 'warning' as const,
    };
  }

  switch (settings.scheduler.health) {
    case 'registered':
      return {
        label: 'Scheduler ativo',
        tone: 'success' as const,
      };
    case 'failed':
      return {
        label: 'Falha no scheduler',
        tone: 'danger' as const,
      };
    case 'disabled':
    default:
      return {
        label: 'Agendamento desativado',
        tone: 'muted' as const,
      };
  }
}

export function getSystemBackupFailoverSummary(
  settings: Pick<SystemBackupSettingsDto, 'failover'>,
) {
  if (!settings.failover?.enabled || !settings.failover.fallbackProviderId) {
    return null;
  }

  return `Failover ativo: uploads foram redirecionados de ${settings.failover.primaryProviderId} para ${settings.failover.fallbackProviderId}.`;
}

export function getSystemBackupFailoverDetails(
  settings: Pick<SystemBackupSettingsDto, 'failover'>,
) {
  if (!settings.failover?.enabled || !settings.failover.fallbackProviderId) {
    return null;
  }

  const base = `Failover ativo: ${settings.failover.primaryProviderId} -> ${settings.failover.fallbackProviderId}.`;

  if (
    !settings.failover.lastFallbackAt ||
    !settings.failover.lastFallbackReason
  ) {
    return base;
  }

  return `${base} Ultimo fallback em ${formatDisplayDateValue(settings.failover.lastFallbackAt)}: ${settings.failover.lastFallbackReason}`;
}

export function getSystemBackupLastSyncedLabel(
  settings: Pick<SystemBackupSettingsDto, 'scheduler'>,
) {
  if (!settings.scheduler.lastSyncedAt) {
    return 'Nunca sincronizado';
  }

  return formatDisplayDateValue(settings.scheduler.lastSyncedAt);
}

export function getSystemBackupEnvironmentNotice(
  settings: Pick<SystemBackupSettingsDto, 'enabled'>,
) {
  if (settings.enabled) {
    return null;
  }

  return 'O kill switch `PG_DUMP_BACKUP_ENABLED=false` bloqueia execucoes manuais e agendadas neste ambiente.';
}

export function getBackupSettingsSummaryViewModel(
  settings: SystemBackupSettingsDto,
): BackupSettingsSummaryViewModel {
  const health = getSystemBackupHealthSummary(settings);

  return {
    providerLabel: settings.providerId,
    schedulerLabel: health.label,
    scheduleSummary: getSystemBackupScheduleSummary(settings),
    retentionSummary: getSystemBackupRetentionSummary(settings),
    lastSyncedLabel: getSystemBackupLastSyncedLabel(settings),
    failoverNotice: getSystemBackupFailoverSummary(settings),
    failoverDetails: getSystemBackupFailoverDetails(settings),
    environmentNotice: getSystemBackupEnvironmentNotice(settings),
    isEnabled: settings.enabled,
  };
}
