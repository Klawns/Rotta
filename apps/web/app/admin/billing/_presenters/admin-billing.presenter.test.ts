import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatBillingCurrencyFallback,
  formatBillingTextFallback,
  getAdminBillingGatewayPresentation,
  getAdminBillingSummaryPresentation,
} from './admin-billing.presenter';

test('formats billing fallbacks for missing money and text values', () => {
  assert.equal(formatBillingCurrencyFallback(null), 'R$ 0,00');
  assert.equal(formatBillingCurrencyFallback(undefined), 'R$ 0,00');
  assert.equal(formatBillingTextFallback(''), '--');
  assert.equal(formatBillingTextFallback(null), '--');
});

test('builds a read-only billing summary when the gateway is disabled', () => {
  const presentation = getAdminBillingSummaryPresentation({
    gateway: {
      status: 'readOnly',
      provider: null,
      message: null,
    },
    metrics: {
      activePlans: null,
      highlightedPlanName: null,
      monthlyRevenueInCents: null,
      annualRevenueInCents: undefined,
    },
  });

  assert.equal(presentation.metrics.activePlans.value, '--');
  assert.equal(presentation.metrics.highlightedPlanName.value, '--');
  assert.equal(presentation.metrics.monthlyRevenue.value, 'R$ 0,00');
  assert.equal(presentation.metrics.annualRevenue.value, 'R$ 0,00');
  assert.equal(presentation.gateway.badgeLabel, 'Somente preparacao');
  assert.match(
    presentation.gateway.description,
    /gateway ainda nao esta configurado/i,
  );
});

test('builds an enabled gateway presentation with provider metadata', () => {
  const gateway = getAdminBillingGatewayPresentation({
    status: 'enabled',
    provider: 'abacatepay',
    message: 'Checkout e conciliacao disponiveis.',
  });

  assert.equal(gateway.badgeLabel, 'Gateway ativo');
  assert.equal(gateway.providerLabel, 'abacatepay');
  assert.equal(gateway.tone, 'success');
  assert.equal(gateway.description, 'Checkout e conciliacao disponiveis.');
});
