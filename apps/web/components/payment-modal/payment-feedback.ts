import type { ClientPaymentMutationSummary } from '@/services/clients-service';
import { formatCurrency } from '@/lib/utils';

function formatSettledRides(count: number) {
  return count === 1 ? '1 corrida quitada' : `${count} corridas quitadas`;
}

export function buildPaymentSuccessMessage(
  summary: ClientPaymentMutationSummary,
) {
  if (summary.generatedBalance > 0) {
    if (summary.settledRides > 0) {
      return `Pagamento registrado. ${formatSettledRides(summary.settledRides)} e ${formatCurrency(summary.generatedBalance)} viraram saldo do cliente.`;
    }

    return `Pagamento registrado. ${formatCurrency(summary.generatedBalance)} viraram saldo do cliente.`;
  }

  if (summary.unappliedAmount > 0 && summary.nextRideShortfall !== null) {
    if (summary.settledRides > 0) {
      return `Pagamento registrado. ${formatSettledRides(summary.settledRides)}. Já recebemos ${formatCurrency(summary.unappliedAmount)} e faltam ${formatCurrency(summary.nextRideShortfall)} para quitar a próxima corrida.`;
    }

    return `Pagamento registrado. Nenhuma corrida foi quitada ainda. Já recebemos ${formatCurrency(summary.unappliedAmount)} e faltam ${formatCurrency(summary.nextRideShortfall)} para quitar a próxima corrida.`;
  }

  if (summary.settledRides > 0) {
    return `Pagamento registrado. ${formatSettledRides(summary.settledRides)}.`;
  }

  return 'Pagamento registrado com sucesso.';
}
