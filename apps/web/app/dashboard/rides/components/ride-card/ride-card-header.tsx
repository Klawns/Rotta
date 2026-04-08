import { cn } from '@/lib/utils';
import { RideCardFinancialBadge } from './ride-card-financial-badge';
import { getRideCardFinancialTheme } from './ride-card.financial-theme';
import type { RideCardPresentation } from './ride-card.types';

interface RideCardHeaderProps {
  presentation: RideCardPresentation;
}

export function RideCardHeader({ presentation }: RideCardHeaderProps) {
  const financialTheme = getRideCardFinancialTheme(presentation.financialState);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary/70">
          {presentation.rideShortLabel}
        </p>
        <h3 className="truncate font-display text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
          {presentation.clientName}
        </h3>
        <p className="truncate text-sm text-text-secondary">
          {presentation.metaItems.join(' • ')}
        </p>
      </div>

      <div className="shrink-0 text-left sm:text-right">
        <p className="font-display text-3xl font-black tracking-tight text-text-primary">
          {presentation.formattedValue}
        </p>

        <div className="mt-2 flex sm:justify-end">
          <RideCardFinancialBadge
            financialState={presentation.financialState}
            label={presentation.financialLabel}
            className={financialTheme.badgeClassName}
            dotClassName={financialTheme.dotClassName}
          />
        </div>

        {presentation.financialHelper ? (
          <p
            className={cn(
              'mt-2 text-sm font-medium',
              financialTheme.helperClassName,
            )}
          >
            {presentation.financialHelper}
          </p>
        ) : null}
      </div>
    </div>
  );
}
