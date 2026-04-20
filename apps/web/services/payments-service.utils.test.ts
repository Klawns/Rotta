import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePaymentPlanFeatures, normalizePromoCode } from './payments-service.utils';

test('keeps only string features from payment plan payloads', () => {
  assert.deepEqual(
    normalizePaymentPlanFeatures(['Pix', false, 'Cartao'] as unknown[]),
    ['Pix', 'Cartao'],
  );
});

test('maps snake_case promo-code payloads to the current admin shape', () => {
  assert.deepEqual(
    normalizePromoCode({
      id: 'coupon-1',
      code: 'WELCOME10',
      name: 'Boas-vindas',
      percent_off: 10,
      duration: 'repeating',
      duration_in_months: 3,
      times_redeemed: 8,
      max_redemptions: 100,
    }),
    {
      id: 'coupon-1',
      code: 'WELCOME10',
      notes: 'Boas-vindas',
      percentOff: 10,
      amountOff: null,
      duration: 'repeating',
      durationInMonths: 3,
      useCount: 8,
      maxRedeems: 100,
    },
  );
});

test('falls back to a safe default promo-code shape for invalid payloads', () => {
  assert.deepEqual(normalizePromoCode(null), {
    id: undefined,
    code: '',
    notes: null,
    percentOff: null,
    amountOff: null,
    duration: 'once',
    durationInMonths: null,
    useCount: null,
    maxRedeems: null,
  });
});
