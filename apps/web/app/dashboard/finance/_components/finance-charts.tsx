'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { normalizeDateValue } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/utils';
import { FinanceByClient, FinanceTrend } from '@/services/finance-service';

interface RevenueTrendChartProps {
  data: FinanceTrend[];
  color?: string;
  isLoading?: boolean;
}

interface RevenueDotProps {
  cx?: number;
  cy?: number;
  payload?: FinanceTrend;
}

function ChartSkeleton() {
  return (
    <div className="h-[400px] w-full animate-pulse rounded-[3rem] bg-card/10" />
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-[3rem] border border-border bg-card/10 font-medium text-muted-foreground">
      {message}
    </div>
  );
}

function formatChartDateLabel(value: unknown, pattern: string) {
  const date = normalizeDateValue(value);
  return date ? format(date, pattern, { locale: ptBR }) : 'Data indisponivel';
}

function RevenueDot({
  cx,
  cy,
  payload,
  color,
}: RevenueDotProps & { color: string }) {
  if (!payload || payload.value <= 0 || cx === undefined || cy === undefined) {
    return null;
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke="#0f172a"
      strokeWidth={2}
    />
  );
}

export function RevenueTrendChart({
  data,
  color = 'var(--primary)',
  isLoading,
}: RevenueTrendChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data?.length) {
    return <EmptyChartState message="Nenhum dado disponível no período" />;
  }

  const gradientId = `colorValue-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="rounded-[3rem] border border-border bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-foreground">Evolução de Ganhos</h3>
        <p className="text-xs font-medium text-muted-foreground">
          Ganhos diários no período selecionado
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={(value) => formatChartDateLabel(value, 'dd MMM')}
              minTickGap={30}
              className="text-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value}`}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1.5rem',
                padding: '12px 16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
              itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
              labelStyle={{
                color: '#94a3b8',
                fontSize: '12px',
                marginBottom: '4px',
                textTransform: 'uppercase',
                fontWeight: 'black',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Ganhos']}
              labelFormatter={(label) => formatChartDateLabel(label, 'dd/MM/yyyy')}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={4}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={(props) => {
                const { key, ...dotProps } = props;
                return <RevenueDot key={key} {...dotProps} color={color} />;
              }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface ClientDistributionChartProps {
  data: FinanceByClient[];
  isLoading?: boolean;
}

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

export function ClientDistributionChart({
  data,
  isLoading,
}: ClientDistributionChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data?.length) {
    return <EmptyChartState message="Nenhum dado" />;
  }

  return (
    <div className="rounded-[3rem] border border-border bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-foreground">
          Distribuição por Clientes
        </h3>
        <p className="text-xs font-medium text-muted-foreground">
          Proporção de ganhos por cliente
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              nameKey="clientName"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.clientId || `${entry.clientName}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                padding: '12px 16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                color: 'var(--foreground)',
              }}
              itemStyle={{
                color: 'var(--foreground)',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
              labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
              formatter={(value: number) => [formatCurrency(value), 'Total']}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }}
              className="text-foreground"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
