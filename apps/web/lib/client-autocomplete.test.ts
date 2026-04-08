import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
  getAppliedClientAfterInputChange,
  isAppliedClientSynced,
  shouldSearchClients,
} from './client-autocomplete';

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

test('only triggers client autocomplete searches when the input is long enough and diverges from the applied client', () => {
  assert.equal(shouldSearchClients('A', null), false);
  assert.equal(
    shouldSearchClients('Al', null, CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH),
    true,
  );
  assert.equal(
    shouldSearchClients(
      'Alice',
      appliedClient,
      CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
    ),
    false,
  );
});
