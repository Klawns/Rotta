import assert from 'node:assert/strict';
import test from 'node:test';
import type { AdminPricingPlan } from '@/types/admin';
import {
  normalizeAdminPricingPlan,
  type RawAdminPricingPlan,
} from './admin-service.utils';

const premiumPlanBase: Omit<AdminPricingPlan, 'features'> = {
  id: 'premium',
  name: 'Premium',
  price: 2490,
  interval: 'month',
  description: 'Plano premium',
  cta: 'Assinar',
  highlight: true,
};

test('keeps only string features from array payloads in admin plans', () => {
  const result = normalizeAdminPricingPlan({
    ...premiumPlanBase,
    features: ['Suporte prioritario', 123, 'Sem anuncios'] as unknown[],
  } as RawAdminPricingPlan);

  assert.deepEqual(result.features, ['Suporte prioritario', 'Sem anuncios']);
});

test('parses JSON string features from admin plans', () => {
  const result = normalizeAdminPricingPlan({
    ...premiumPlanBase,
    features: '["Relatorios","Exportacao"]',
  });

  assert.deepEqual(result.features, ['Relatorios', 'Exportacao']);
});

test('falls back to an empty features list for invalid admin plan payloads', () => {
  const result = normalizeAdminPricingPlan({
    ...premiumPlanBase,
    features: '{invalid json}',
  });

  assert.deepEqual(result.features, []);
});
