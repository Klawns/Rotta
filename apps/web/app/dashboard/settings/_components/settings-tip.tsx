import { CheckCircle2 } from 'lucide-react';

export function SettingsTip() {
  return (
    <section className="rounded-[2rem] border border-border-subtle bg-card/40 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
              Boas praticas
            </p>
            <h3 className="text-lg font-display font-bold tracking-tight text-text-primary">
              Padronize os atalhos para leitura rapida
            </h3>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-text-secondary">
            Agrupe por regiao, ponto de referencia ou faixa de valor. Exemplos
            simples como Centro, Hospital e Aeroporto costumam funcionar melhor
            no dia a dia do painel mobile.
          </p>
        </div>
      </div>
    </section>
  );
}
