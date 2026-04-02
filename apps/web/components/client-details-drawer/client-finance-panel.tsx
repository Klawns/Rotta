'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Bike,
  ChevronRight,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Loader2,
  Wallet,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { type ClientBalance } from '@/types/rides';

interface ClientFinancePanelProps {
  balance: ClientBalance | null;
  isSettling: boolean;
  isExportingPdf: boolean;
  isExportingExcel: boolean;
  isExportDisabled: boolean;
  onNewRide: () => void;
  onAddPayment: () => void;
  onGeneratePDF: () => void;
  onGenerateExcel: () => void;
  onCloseDebt: () => void;
}

interface SummaryMetricProps {
  label: string;
  value: string;
  tone?: 'default' | 'brand' | 'success';
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

function SummaryMetric({
  label,
  value,
  tone = 'default',
}: SummaryMetricProps) {
  const toneClasses = {
    default: 'text-text-primary',
    brand: 'text-icon-brand',
    success: 'text-icon-success',
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-card-background/55 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
        {label}
      </p>
      <p className={cn('mt-2 text-base font-bold tracking-tight', toneClasses[tone])}>
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'ghost',
  isLoading = false,
}: ActionButtonProps) {
  const variantClasses = {
    primary:
      'border-button-primary bg-button-primary text-button-primary-foreground shadow-lg shadow-button-shadow hover:bg-button-primary-hover',
    secondary:
      'border-icon-brand/15 bg-icon-brand/10 text-icon-brand hover:bg-icon-brand/15',
    ghost:
      'border-border-subtle bg-secondary/10 text-text-secondary hover:bg-secondary/15 hover:text-text-primary',
    danger:
      'border-border-destructive/20 bg-button-destructive-subtle text-icon-destructive hover:bg-button-destructive-subtle/80',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
      )}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      <span>{label}</span>
    </button>
  );
}

export function ClientFinancePanel({
  balance,
  isSettling,
  isExportingPdf,
  isExportingExcel,
  isExportDisabled,
  onNewRide,
  onAddPayment,
  onGeneratePDF,
  onGenerateExcel,
  onCloseDebt,
}: ClientFinancePanelProps) {
  const remainingBalance = balance ? formatCurrency(balance.remainingBalance) : '---';
  const totalDebt = balance ? formatCurrency(balance.totalDebt) : '---';
  const totalPaid = balance ? formatCurrency(balance.totalPaid) : '---';
  const clientBalance = balance ? formatCurrency(balance.clientBalance) : '---';
  const pendingRides = balance ? String(balance.pendingRides) : '---';
  const hasOpenDebt = !!balance && balance.remainingBalance > 0;
  const hasCredit = !!balance && balance.clientBalance > 0;

  return (
    <section className="rounded-[2rem] border border-border-subtle bg-background/55 p-5 shadow-sm lg:p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-secondary">
                Resumo financeiro
              </p>
              <h3 className="text-sm font-medium text-text-secondary">
                Situacao atual do cliente.
              </h3>
            </div>
            {hasCredit && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-icon-success/15 bg-icon-success/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-icon-success">
                <Wallet size={12} />
                Com credito
              </span>
            )}
          </div>

          <div className="rounded-3xl border border-border-subtle bg-card-background/75 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
              Saldo devedor atual
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight text-destructive">
              {remainingBalance}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {hasOpenDebt
                ? 'Ha valores pendentes em aberto para este cliente.'
                : 'Nenhuma divida em aberto no momento.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SummaryMetric label="Total em corridas" value={totalDebt} />
          <SummaryMetric label="Pago parcial" value={totalPaid} tone="brand" />
          <SummaryMetric label="Credito disponivel" value={clientBalance} tone="success" />
          <SummaryMetric label="Corridas pendentes" value={pendingRides} />
        </div>

        <div className="space-y-3 border-t border-border-subtle pt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ActionButton
              icon={Bike}
              label="Nova corrida"
              onClick={onNewRide}
              variant="primary"
            />
            <ActionButton
              icon={DollarSign}
              label="Registrar pagamento"
              onClick={onAddPayment}
              variant="secondary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {hasOpenDebt && (
              <ActionButton
                icon={ChevronRight}
                label={isSettling ? 'Quitando...' : 'Quitar divida'}
                onClick={onCloseDebt}
                disabled={isSettling}
                variant="ghost"
                isLoading={isSettling}
              />
            )}
            <ActionButton
              icon={FileText}
              label={isExportingPdf ? 'Gerando PDF...' : 'Exportar PDF'}
              onClick={onGeneratePDF}
              disabled={isExportDisabled || isExportingPdf || isExportingExcel}
              variant="ghost"
              isLoading={isExportingPdf}
            />
            <ActionButton
              icon={FileSpreadsheet}
              label={isExportingExcel ? 'Gerando planilha...' : 'Exportar planilha'}
              onClick={onGenerateExcel}
              disabled={isExportDisabled || isExportingPdf || isExportingExcel}
              variant="ghost"
              isLoading={isExportingExcel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
