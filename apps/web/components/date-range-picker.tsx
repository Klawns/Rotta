'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarRange, Loader2 } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangeValue {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  title: string;
  description: string;
  value: DateRangeValue;
  onChange: (nextRange: DateRangeValue) => void;
  onApplyPreset: (preset: 'today' | '7d' | '30d' | 'month') => void;
  onClear: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  errorMessage?: string | null;
  confirmLabel?: string;
}

const DATE_RANGE_PRESETS = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'month', label: 'Mes' },
] as const;

function toInputDateValue(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function toDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  const date = toDate(value);
  return date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : '--';
}

function getSelectedRange(value: DateRangeValue): DateRange | undefined {
  const from = toDate(value.startDate);
  const to = toDate(value.endDate);

  if (!from && !to) {
    return undefined;
  }

  return {
    from,
    to,
  };
}

export function DateRangePicker({
  title,
  description,
  value,
  onChange,
  onApplyPreset,
  onClear,
  onConfirm,
  isLoading = false,
  isConfirmDisabled = false,
  errorMessage,
  confirmLabel = 'Baixar PDF',
}: DateRangePickerProps) {
  const selectedRange = getSelectedRange(value);

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-text-primary">
          <CalendarRange size={16} />
          <p className="text-sm font-semibold tracking-tight">{title}</p>
        </div>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>

      <div className="rounded-[1.5rem] border border-border-subtle bg-background/80 p-3">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={(range) => {
            onChange({
              startDate: range?.from ? toInputDateValue(range.from) : '',
              endDate: range?.to ? toInputDateValue(range.to) : '',
            });
          }}
          numberOfMonths={1}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {DATE_RANGE_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onApplyPreset(preset.value)}
            className="rounded-full border-border-subtle bg-card-background/80"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-border-subtle bg-background/80 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          Período selecionado
        </p>
        <p className="mt-2 text-sm font-semibold tracking-tight text-text-primary">
          {formatDateLabel(value.startDate)} ate {formatDateLabel(value.endDate)}
        </p>
      </div>

      {errorMessage && (
        <div
          className={cn(
            'rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive',
          )}
        >
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
          disabled={isLoading}
          className="h-11 rounded-2xl px-5"
        >
          Limpar datas
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className="h-11 rounded-2xl px-5"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Gerando PDF...
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </div>
    </div>
  );
}
