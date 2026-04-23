'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BackupSettingsFormErrors, BackupSettingsFormValues } from '../_types/admin-backups.types';

interface BackupSettingsFormProps {
  values: BackupSettingsFormValues;
  errors: BackupSettingsFormErrors;
  isSaving: boolean;
  onScheduleModeChange: (value: BackupSettingsFormValues['scheduleMode']) => void;
  onFixedTimeChange: (value: string) => void;
  onIntervalMinutesChange: (value: string) => void;
  onRetentionModeChange: (value: BackupSettingsFormValues['retentionMode']) => void;
  onMaxCountChange: (value: string) => void;
  onMaxAgeDaysChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  showTopBorder?: boolean;
}

export function BackupSettingsForm({
  values,
  errors,
  isSaving,
  onScheduleModeChange,
  onFixedTimeChange,
  onIntervalMinutesChange,
  onRetentionModeChange,
  onMaxCountChange,
  onMaxAgeDaysChange,
  onCancel,
  onSubmit,
  showTopBorder = true,
}: BackupSettingsFormProps) {
  return (
    <div className={showTopBorder ? 'space-y-5 border-t pt-6' : 'space-y-5'}>
      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Modo de agendamento</FieldLabel>
          <FieldContent>
            <Select
              value={values.scheduleMode}
              onValueChange={(value) =>
                onScheduleModeChange(
                  value as BackupSettingsFormValues['scheduleMode'],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_time">Horario fixo</SelectItem>
                <SelectItem value="interval">Intervalo</SelectItem>
                <SelectItem value="disabled">Desativado</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Defina se o scheduler roda em horario fixo, intervalo recorrente ou fica desligado.
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            {values.scheduleMode === 'interval' ? 'Intervalo em minutos' : 'Horario'}
          </FieldLabel>
          <FieldContent>
            {values.scheduleMode === 'interval' ? (
              <Input
                value={values.intervalMinutes}
                onChange={(event) => onIntervalMinutesChange(event.target.value)}
                inputMode="numeric"
                disabled={isSaving}
              />
            ) : (
              <Input
                type="time"
                value={values.fixedTime}
                onChange={(event) => onFixedTimeChange(event.target.value)}
                disabled={isSaving || values.scheduleMode !== 'fixed_time'}
              />
            )}
            <FieldError>
              {values.scheduleMode === 'interval'
                ? errors.intervalMinutes
                : errors.fixedTime}
            </FieldError>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Modo de retenção</FieldLabel>
          <FieldContent>
            <Select
              value={values.retentionMode}
              onValueChange={(value) =>
                onRetentionModeChange(
                  value as BackupSettingsFormValues['retentionMode'],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Quantidade de arquivos</SelectItem>
                <SelectItem value="max_age">Tempo maximo</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              Defina se a limpeza automática deve usar quantidade máxima ou idade máxima.
            </FieldDescription>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            {values.retentionMode === 'count' ? 'Quantidade maxima' : 'Dias maximos'}
          </FieldLabel>
          <FieldContent>
            <Input
              value={
                values.retentionMode === 'count'
                  ? values.maxCount
                  : values.maxAgeDays
              }
              onChange={(event) =>
                values.retentionMode === 'count'
                  ? onMaxCountChange(event.target.value)
                  : onMaxAgeDaysChange(event.target.value)
              }
              inputMode="numeric"
              disabled={isSaving}
            />
            <FieldError>
              {values.retentionMode === 'count' ? errors.maxCount : errors.maxAgeDays}
            </FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar configuração'}
        </Button>
      </div>
    </div>
  );
}
