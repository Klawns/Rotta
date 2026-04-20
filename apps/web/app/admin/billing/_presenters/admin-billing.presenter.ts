import { formatCurrency } from '@/lib/utils';
import type {
  AdminBillingGatewayCapability,
  AdminBillingSummary,
} from '@/types/admin-billing';

interface AdminBillingMetricPresentation {
  label: string;
  value: string;
}

interface AdminBillingGatewayPresentation {
  badgeLabel: string;
  description: string;
  providerLabel: string;
  tone: 'success' | 'warning' | 'muted';
}

export interface AdminBillingSummaryPresentation {
  gateway: AdminBillingGatewayPresentation;
  metrics: {
    activePlans: AdminBillingMetricPresentation;
    highlightedPlanName: AdminBillingMetricPresentation;
    monthlyRevenue: AdminBillingMetricPresentation;
    annualRevenue: AdminBillingMetricPresentation;
  };
}

export function formatBillingTextFallback(value: string | null | undefined) {
  if (!value?.trim()) {
    return '--';
  }

  return value;
}

export function formatBillingCurrencyFallback(
  valueInCents: number | null | undefined,
) {
  return formatCurrency((valueInCents ?? 0) / 100).replace(/\u00a0/g, ' ');
}

export function getAdminBillingGatewayPresentation(
  gateway: AdminBillingGatewayCapability,
): AdminBillingGatewayPresentation {
  switch (gateway.status) {
    case 'enabled':
      return {
        badgeLabel: 'Gateway ativo',
        description:
          gateway.message ??
          'Checkout e conciliacao ja podem evoluir sobre o provider atual.',
        providerLabel: formatBillingTextFallback(gateway.provider),
        tone: 'success',
      };
    case 'unavailable':
      return {
        badgeLabel: 'Gateway indisponivel',
        description:
          gateway.message ??
          'Nao foi possivel carregar a capacidade do gateway neste momento.',
        providerLabel: formatBillingTextFallback(gateway.provider),
        tone: 'muted',
      };
    case 'readOnly':
    default:
      return {
        badgeLabel: 'Somente preparacao',
        description:
          gateway.message ??
          'O gateway ainda nao esta configurado. A area segue pronta para receber a integracao futura.',
        providerLabel: formatBillingTextFallback(gateway.provider),
        tone: 'warning',
      };
  }
}

export function getAdminBillingSummaryPresentation(
  summary: AdminBillingSummary,
): AdminBillingSummaryPresentation {
  return {
    gateway: getAdminBillingGatewayPresentation(summary.gateway),
    metrics: {
      activePlans: {
        label: 'Planos ativos',
        value:
          typeof summary.metrics.activePlans === 'number'
            ? String(summary.metrics.activePlans)
            : '--',
      },
      highlightedPlanName: {
        label: 'Plano em destaque',
        value: formatBillingTextFallback(summary.metrics.highlightedPlanName),
      },
      monthlyRevenue: {
        label: 'Receita mensal',
        value: formatBillingCurrencyFallback(
          summary.metrics.monthlyRevenueInCents,
        ),
      },
      annualRevenue: {
        label: 'Receita anual',
        value: formatBillingCurrencyFallback(
          summary.metrics.annualRevenueInCents,
        ),
      },
    },
  };
}
