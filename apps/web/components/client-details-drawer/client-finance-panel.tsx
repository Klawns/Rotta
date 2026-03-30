'use client';

import { Bike, DollarSign, FileText, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { type ClientBalance } from '@/types/rides';

interface ClientFinancePanelProps {
  balance: ClientBalance | null;
  isSettling: boolean;
  isDeleting: boolean;
  onNewRide: () => void;
  onDeleteClient: () => void;
  onAddPayment: () => void;
  onGeneratePDF: () => void;
  onGenerateExcel: () => void;
  onCloseDebt: () => void;
}

export function ClientFinancePanel({
  balance,
  isSettling,
  isDeleting,
  onNewRide,
  onDeleteClient,
  onAddPayment,
  onGeneratePDF,
  onGenerateExcel,
  onCloseDebt,
}: ClientFinancePanelProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onNewRide}
          className="flex flex-col items-center gap-2 p-6 bg-button-primary hover:bg-button-primary-hover rounded-[2rem] text-button-primary-foreground transition-all group shadow-xl shadow-button-shadow active:scale-95"
        >
          <Bike size={24} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold">Nova Corrida</span>
        </button>
        <button
          onClick={onDeleteClient}
          disabled={isDeleting}
          className="flex flex-col items-center gap-2 p-6 bg-button-destructive-subtle hover:bg-button-destructive text-icon-destructive hover:text-button-destructive-foreground rounded-[2rem] transition-all group border border-border-destructive/10 active:scale-95 disabled:opacity-50 shadow-lg shadow-destructive/5 hover:shadow-destructive/20"
        >
          <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold">{isDeleting ? "Excluindo..." : "Excluir Cliente"}</span>
        </button>
      </div>

      <section className="bg-background/50 border border-border-subtle rounded-[2.5rem] p-8 space-y-6">
        <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest text-center opacity-80">Controle Financeiro</h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={onAddPayment}
            className="flex flex-col items-center gap-3 p-6 bg-icon-brand/10 hover:bg-icon-brand text-icon-brand hover:text-white rounded-3xl transition-all group border border-icon-brand/10 active:scale-95 shadow-lg shadow-brand/0 hover:shadow-brand/20"
          >
            <DollarSign size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-black text-[10px] uppercase">Pagar Parcial</span>
          </button>
          <button
            onClick={onGeneratePDF}
            className="flex flex-col items-center gap-3 p-6 bg-icon-info/10 hover:bg-icon-info text-icon-info hover:text-white rounded-3xl transition-all group border border-icon-info/10 active:scale-95 shadow-lg shadow-info/0 hover:shadow-brand/20"
          >
            <FileText size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-black text-[10px] uppercase">PDF</span>
          </button>
          <button
            onClick={onGenerateExcel}
            className="flex flex-col items-center gap-3 p-6 bg-icon-success/10 hover:bg-icon-success text-icon-success hover:text-white rounded-3xl transition-all group border border-icon-success/10 active:scale-95 shadow-lg shadow-success/0 hover:shadow-success/20"
          >
            <FileText size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-black text-[10px] uppercase">Planilha</span>
          </button>
        </div>

        {balance && (
          <div className="space-y-4 pt-4 border-t border-border-subtle">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary font-bold uppercase text-[10px] tracking-wider">Total em Corridas Pendentes</span>
              <span className="text-text-primary font-black">{formatCurrency(balance.totalDebt)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-icon-brand/80 font-bold uppercase text-[10px] tracking-wider">Total Pago (Parcial)</span>
              <span className="text-icon-brand font-black">- {formatCurrency(balance.totalPaid)}</span>
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-border-strong bg-card/30 p-4 rounded-2xl border border-border-subtle">
              <div className="flex justify-between items-center">
                <span className="font-black text-destructive text-[10px] uppercase tracking-widest">Saldo devedor</span>
                <span className="font-black text-xl text-destructive tracking-tight">
                  {formatCurrency(balance.remainingBalance)}
                </span>
              </div>

              {balance.clientBalance > 0 && (
                <div className="flex justify-between items-center pt-3 border-t border-border-strong/50">
                  <span className="font-black text-icon-success text-[10px] uppercase tracking-widest">Credito disponivel</span>
                  <span className="font-black text-xl text-icon-success tracking-tight">
                    {formatCurrency(balance.clientBalance)}
                  </span>
                </div>
              )}
            </div>

            {balance.remainingBalance > 0 && (
              <button
                onClick={onCloseDebt}
                disabled={isSettling}
                className="w-full py-5 bg-button-primary text-button-primary-foreground hover:bg-button-primary-hover font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 mt-2 uppercase tracking-widest text-xs shadow-lg shadow-button-shadow"
              >
                {isSettling ? "PROCESSANDO..." : "QUITAR DIVIDA TOTAL"}
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
