import { BarChart3 } from 'lucide-react';

export function RidesChartEmptyState() {
  return (
    <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-dashed border-border-subtle bg-secondary/20 px-6 text-center">
      <div className="max-w-sm space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BarChart3 size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-black text-text-primary">
            Nenhuma corrida nos últimos 7 dias
          </h4>
          <p className="text-sm text-text-secondary">
            Assim que novas corridas forem registradas, o gráfico vai mostrar a
            evolução diária do faturamento.
          </p>
        </div>
      </div>
    </div>
  );
}
