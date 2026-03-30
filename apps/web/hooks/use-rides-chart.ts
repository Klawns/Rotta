'use client';

import { useMemo } from 'react';
import {
  getRidesChartState,
  type RideChartState,
} from '@/services/rides-chart-service';
import type { Ride } from '@/types/rides';

export function useRidesChart(rides: Ride[]): RideChartState {
  return useMemo(() => getRidesChartState(rides), [rides]);
}
