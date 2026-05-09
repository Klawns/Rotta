import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBulkDialogCopy,
  getRideDialogCopy,
} from './use-rides-page-controller';

test('uses success variant when confirming a restore action', () => {
  const rideDialog = getRideDialogCopy(true);
  const bulkDialog = getBulkDialogCopy(true, 2);

  assert.equal(rideDialog.confirmText, 'Restaurar');
  assert.equal(rideDialog.variant, 'success');
  assert.equal(bulkDialog.confirmText, 'Restaurar selecionadas');
  assert.equal(bulkDialog.variant, 'success');
});
