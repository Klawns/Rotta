import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFinanceDashboardParams,
  buildFinanceDashboardQueryKey,
} from './finance-dashboard-query';

test('builds finance dashboard params only when custom ranges are complete', () => {
  assert.equal(
    buildFinanceDashboardParams({ period: 'custom', startDate: '2026-04-01' }),
    null,
  );
  assert.deepEqual(
    buildFinanceDashboardParams(
      {
        period: 'custom',
        startDate: '2026-04-01',
        endDate: '2026-04-03',
      },
      'client-1',
    ),
    {
      period: 'custom',
      clientId: 'client-1',
      start: '2026-04-01',
      end: '2026-04-03',
    },
  );
  assert.deepEqual(
    buildFinanceDashboardQueryKey(
      {
        period: 'month',
      },
      'client-1',
    ),
    {
      period: 'month',
      clientId: 'client-1',
      start: undefined,
      end: undefined,
    },
  );
});
