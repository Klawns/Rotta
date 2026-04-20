import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePaymentPlanFeatures } from './payments-service.utils';

test('keeps only string features from payment plan payloads', () => {
  assert.deepEqual(
    normalizePaymentPlanFeatures(['Pix', false, 'Cartao'] as unknown[]),
    ['Pix', 'Cartao'],
  );
});
