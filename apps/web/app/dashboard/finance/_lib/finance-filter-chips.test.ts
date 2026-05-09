import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFinanceFilterChips } from './finance-filter-chips';

test('formats custom finance date chips from date-only values without timezone rollback', () => {
  assert.deepEqual(
    buildFinanceFilterChips({
      period: 'custom',
      periodLabel: 'Personalizado',
      paymentStatus: 'all',
      startDate: '2026-04-01',
      endDate: '2026-04-08',
    }),
    [
      {
        id: 'period',
        label: '01/04 - 08/04',
      },
    ],
  );
});
