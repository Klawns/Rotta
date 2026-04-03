import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFinanceDashboardParams,
  buildFinanceDashboardQueryKey,
} from './finance-dashboard-query';
import {
  FINANCE_CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
  getAppliedClientAfterInputChange,
  isAppliedClientSynced,
  shouldSearchFinanceClients,
} from './finance-client-autocomplete';

const appliedClient = {
  id: 'client-1',
  name: 'Alice',
};

test('keeps the applied client only while the input stays synced', () => {
  assert.equal(isAppliedClientSynced('Alice', appliedClient), true);
  assert.deepEqual(getAppliedClientAfterInputChange('Alice', appliedClient), appliedClient);
  assert.equal(getAppliedClientAfterInputChange('Alicia', appliedClient), null);
  assert.equal(getAppliedClientAfterInputChange('', appliedClient), null);
});

test('only triggers finance autocomplete searches when the input is long enough and diverges from the applied client', () => {
  assert.equal(
    shouldSearchFinanceClients('A', null),
    false,
  );
  assert.equal(
    shouldSearchFinanceClients(
      'Al',
      null,
      FINANCE_CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
    ),
    true,
  );
  assert.equal(
    shouldSearchFinanceClients(
      'Alice',
      appliedClient,
      FINANCE_CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
    ),
    false,
  );
});

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
