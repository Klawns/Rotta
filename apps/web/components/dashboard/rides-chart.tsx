'use client';

import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useRidesChart } from '@/hooks/use-rides-chart';
import { cn, formatCurrency } from '@/lib/utils';
import { type Ride } from '@/types/rides';
import {
  type RideChartPoint,
} from '@/services/rides-chart-service';
import { RidesChartEmptyState } from './rides-chart-empty-state';

interface RidesChartProps {
  rides: Ride[];
  className?: string;
}

interface ChartDotProps {
  cx?: number;
  cy?: number;
  payload?: RideChartPoint;
}

function RidesChartDot({ cx, cy, payload }: ChartDotProps) {
  if (
    cx === undefined ||
    cy === undefined ||
    !payload ||
    payload.value <= 0
  ) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="var(--color-primary)"
      stroke="var(--color-card)"
      strokeWidth={2}
    />
  );
}

export function RidesChart({ rides, className }: RidesChartProps) {
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { chartData, totalPeriod, hasActivity } = useRidesChart(rides);

  function renderDot(props: ChartDotProps & { key?: string | number }) {
    const { key, ...dotProps } = props;

    return <RidesChartDot key={key} {...dotProps} />;
  }

  return (
    <div
      className={cn(
        'flex h-[420px] flex-col overflow-hidden rounded-3xl border border-border-subtle bg-card-background p-8 shadow-sm lg:h-[540px]',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            Desempenho (7 dias)
          </h3>
          <p className="mt-1 text-xl font-black text-foreground">
            {formatCurrency(totalPeriod)}
          </p>
        </div>
        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
      </div>

      <div className="mt-6 min-h-0 w-full flex-1">
        {hasActivity ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
                opacity={0.45}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'currentColor',
                  fontSize: 10,
                  fontWeight: 700,
                }}
                className="text-muted-foreground"
                dy={10}
              />
              <YAxis
                hide
                domain={[
                  0,
                  (dataMax: number) => Math.max(Math.ceil(dataMax * 1.15), 10),
                ]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) {
                    return null;
                  }

                  const point = payload[0].payload as RideChartPoint;

                  return (
                    <div className="rounded-2xl border border-border bg-card p-3 shadow-2xl backdrop-blur-md">
                      <p className="mb-1 text-[10px] font-black uppercase text-muted-foreground">
                        {point.fullDate}
                      </p>
                      <p className="text-lg font-black text-primary">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={4}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                dot={renderDot}
                activeDot={{
                  r: 6,
                  fill: 'var(--color-primary)',
                  stroke: 'var(--color-card)',
                  strokeWidth: 2,
                }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <RidesChartEmptyState />
        )}
      </div>
    </div>
  );
}
