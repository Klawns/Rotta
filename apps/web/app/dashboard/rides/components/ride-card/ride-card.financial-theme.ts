import type { RideCardFinancialState } from './ride-card.types';

interface RideCardFinancialTheme {
  cardClassName: string;
  badgeClassName: string;
  helperClassName: string;
  dotClassName: string;
}

const RIDE_CARD_FINANCIAL_THEME: Record<RideCardFinancialState, RideCardFinancialTheme> = {
  paid: {
    cardClassName: 'border-l-[3px] border-l-icon-success/35',
    badgeClassName: 'border-icon-success/20 bg-icon-success/10 text-icon-success',
    helperClassName: 'text-icon-success',
    dotClassName: 'bg-icon-success',
  },
  pending: {
    cardClassName: 'border-l-[3px] border-l-icon-warning/45',
    badgeClassName: 'border-icon-warning/25 bg-icon-warning/10 text-icon-warning',
    helperClassName: 'text-icon-warning',
    dotClassName: 'bg-icon-warning',
  },
  partial: {
    cardClassName: 'border-l-[3px] border-l-icon-warning/55',
    badgeClassName: 'border-icon-warning/30 bg-icon-warning/10 text-icon-warning',
    helperClassName: 'text-icon-warning',
    dotClassName: 'bg-icon-warning',
  },
  debt: {
    cardClassName: 'border-l-[3px] border-l-icon-destructive/45',
    badgeClassName:
      'border-border-destructive/20 bg-button-destructive-subtle text-icon-destructive',
    helperClassName: 'text-icon-destructive',
    dotClassName: 'bg-icon-destructive',
  },
};

export function getRideCardFinancialTheme(financialState: RideCardFinancialState) {
  return RIDE_CARD_FINANCIAL_THEME[financialState];
}
