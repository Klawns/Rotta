'use client';

import { useMemo, useState } from 'react';
import type {
  BackupSettingsFormErrors,
  BackupSettingsFormValues,
  SystemBackupSettingsDto,
  UpdateSystemBackupSettingsDto,
} from '../_types/admin-backups.types';

function createInitialValues(
  settings: SystemBackupSettingsDto,
): BackupSettingsFormValues {
  return {
    scheduleMode: settings.schedule.mode,
    fixedTime: settings.schedule.fixedTime ?? '04:00',
    intervalMinutes: String(settings.schedule.intervalMinutes ?? 120),
    retentionMode: settings.retention.mode,
    maxCount: String(settings.retention.maxCount ?? 7),
    maxAgeDays: String(settings.retention.maxAgeDays ?? 15),
  };
}

function validateForm(values: BackupSettingsFormValues): BackupSettingsFormErrors {
  const errors: BackupSettingsFormErrors = {};

  if (values.scheduleMode === 'fixed_time') {
    if (!/^\d{2}:\d{2}$/.test(values.fixedTime)) {
      errors.fixedTime = 'Informe um horario valido no formato HH:MM.';
    }
  }

  if (values.scheduleMode === 'interval') {
    const interval = Number.parseInt(values.intervalMinutes, 10);
    if (!Number.isInteger(interval) || interval <= 0) {
      errors.intervalMinutes = 'Informe um intervalo inteiro maior que zero.';
    }
  }

  if (values.retentionMode === 'count') {
    const count = Number.parseInt(values.maxCount, 10);
    if (!Number.isInteger(count) || count <= 0) {
      errors.maxCount = 'Informe uma quantidade inteira maior que zero.';
    }
  }

  if (values.retentionMode === 'max_age') {
    const days = Number.parseInt(values.maxAgeDays, 10);
    if (!Number.isInteger(days) || days <= 0) {
      errors.maxAgeDays = 'Informe um numero de dias maior que zero.';
    }
  }

  return errors;
}

function toPayload(values: BackupSettingsFormValues): UpdateSystemBackupSettingsDto {
  return {
    schedule: {
      mode: values.scheduleMode,
      fixedTime: values.scheduleMode === 'fixed_time' ? values.fixedTime : null,
      intervalMinutes:
        values.scheduleMode === 'interval'
          ? Number.parseInt(values.intervalMinutes, 10)
          : null,
    },
    retention: {
      mode: values.retentionMode,
      maxCount:
        values.retentionMode === 'count'
          ? Number.parseInt(values.maxCount, 10)
          : null,
      maxAgeDays:
        values.retentionMode === 'max_age'
          ? Number.parseInt(values.maxAgeDays, 10)
          : null,
    },
  };
}

export function useBackupSettingsForm(params: {
  settings: SystemBackupSettingsDto;
  onSave: (input: UpdateSystemBackupSettingsDto) => Promise<unknown>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<BackupSettingsFormValues>(() =>
    createInitialValues(params.settings),
  );

  const errors = useMemo(() => validateForm(values), [values]);

  const startEditing = () => {
    setValues(createInitialValues(params.settings));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setValues(createInitialValues(params.settings));
    setIsEditing(false);
  };

  const submit = async () => {
    const nextErrors = validateForm(values);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await params.onSave(toPayload(values));
    setIsEditing(false);
  };

  return {
    isEditing,
    values,
    errors,
    setScheduleMode: (value: BackupSettingsFormValues['scheduleMode']) =>
      setValues((current) => ({ ...current, scheduleMode: value })),
    setFixedTime: (value: string) =>
      setValues((current) => ({ ...current, fixedTime: value })),
    setIntervalMinutes: (value: string) =>
      setValues((current) => ({ ...current, intervalMinutes: value })),
    setRetentionMode: (value: BackupSettingsFormValues['retentionMode']) =>
      setValues((current) => ({ ...current, retentionMode: value })),
    setMaxCount: (value: string) =>
      setValues((current) => ({ ...current, maxCount: value })),
    setMaxAgeDays: (value: string) =>
      setValues((current) => ({ ...current, maxAgeDays: value })),
    startEditing,
    cancelEditing,
    submit,
  };
}
