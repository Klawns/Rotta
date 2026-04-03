'use client';

import { useMemo } from 'react';
import {
  getRidesChartState,
  type RideChartState,
} from '@/services/rides-chart-service';
import type { RideViewModel } from '@/types/rides';

export function useRidesChart(rides: RideViewModel[]): RideChartState {
  return useMemo(() => getRidesChartState(rides), [rides]);
}
