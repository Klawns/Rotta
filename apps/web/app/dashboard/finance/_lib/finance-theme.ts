import type { PeriodId } from '../_types';

const PERIOD_ACCENTS: Record<
  PeriodId,
  {
    badge: string;
    border: string;
    surface: string;
    glow: string;
    text: string;
  }
> = {
  today: {
    badge: 'bg-primary text-white',
    border: 'border-primary/20',
    surface: 'bg-primary/10',
    glow: 'from-primary/16 via-primary/6 to-transparent',
    text: 'text-primary',
  },
  week: {
    badge: 'bg-emerald-500 text-white',
    border: 'border-emerald-500/20',
    surface: 'bg-emerald-500/10',
    glow: 'from-emerald-500/16 via-emerald-500/6 to-transparent',
    text: 'text-emerald-400',
  },
  month: {
    badge: 'bg-violet-500 text-white',
    border: 'border-violet-500/20',
    surface: 'bg-violet-500/10',
    glow: 'from-violet-500/16 via-violet-500/6 to-transparent',
    text: 'text-violet-400',
  },
  year: {
    badge: 'bg-amber-500 text-slate-950',
    border: 'border-amber-500/20',
    surface: 'bg-amber-500/10',
    glow: 'from-amber-500/16 via-amber-500/6 to-transparent',
    text: 'text-amber-400',
  },
  custom: {
    badge: 'bg-sky-500 text-white',
    border: 'border-sky-500/20',
    surface: 'bg-sky-500/10',
    glow: 'from-sky-500/16 via-sky-500/6 to-transparent',
    text: 'text-sky-400',
  },
};

export function getPeriodAccent(periodId: PeriodId) {
  return PERIOD_ACCENTS[periodId];
}
