import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { resolveRideDateValue } from '@/lib/date-utils';
import type { Ride } from '@/types/rides';

export interface RideChartPoint {
  date: string;
  value: number;
  fullDate: string;
}

export interface RideChartState {
  chartData: RideChartPoint[];
  totalPeriod: number;
  hasActivity: boolean;
}

export function getRidesChartState(rides: Ride[]): RideChartState {
  const last7Days = Array.from({ length: 7 })
    .map((_, index) => format(subDays(new Date(), index), 'yyyy-MM-dd'))
    .reverse();

  const earningsByDay = rides.reduce<Record<string, number>>((acc, ride) => {
    const sourceDate = resolveRideDateValue(ride.rideDate, ride.createdAt);
    if (!sourceDate) {
      return acc;
    }

    const date = format(sourceDate, 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + (ride.value || 0);
    return acc;
  }, {});

  const chartData = last7Days.map((date) => ({
    date: format(parseISO(date), 'dd/MM', { locale: ptBR }),
    value: earningsByDay[date] || 0,
    fullDate: format(parseISO(date), "EEEE, dd 'de' MMMM", {
      locale: ptBR,
    }),
  }));

  return {
    chartData,
    totalPeriod: chartData.reduce((acc, current) => acc + current.value, 0),
    hasActivity: chartData.some((point) => point.value > 0),
  };
}
