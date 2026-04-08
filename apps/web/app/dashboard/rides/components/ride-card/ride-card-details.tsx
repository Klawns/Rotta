import { cn } from '@/lib/utils';
import type { RideCardPresentation } from './ride-card.types';

interface RideCardDetailsProps {
  presentation: RideCardPresentation;
}

const toneClassName = {
  default: 'text-text-primary',
  positive: 'text-icon-success',
  warning: 'text-icon-warning',
  danger: 'text-icon-destructive',
} as const;

export function RideCardDetails({ presentation }: RideCardDetailsProps) {
  return (
    <div className="border-t border-border-subtle/70 pt-4">
      <dl className="grid gap-3 sm:grid-cols-2">
        {presentation.details.map((detail) => (
          <div
            key={`${detail.label}-${detail.value}`}
            className="rounded-2xl bg-secondary/5 px-4 py-3"
          >
            <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary/70">
              {detail.label}
            </dt>
            <dd
              className={cn(
                'mt-1 break-words text-sm font-semibold',
                toneClassName[detail.tone ?? 'default'],
              )}
            >
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>

      {presentation.notes ? (
        <div className="mt-3 rounded-2xl bg-secondary/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary/70">
            Observacoes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-text-primary">
            {presentation.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
}
