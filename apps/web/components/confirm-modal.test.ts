import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getConfirmModalActionClassName,
  getConfirmModalToneClassName,
} from './confirm-modal';

test('uses success styling for positive confirm actions', () => {
  const className = getConfirmModalActionClassName('success');

  assert.match(className, /bg-success/);
  assert.match(className, /text-success-foreground/);
});

test('keeps destructive styling for dangerous confirm actions', () => {
  const className = getConfirmModalActionClassName('danger');

  assert.match(className, /bg-button-destructive/);
});

test('uses success tone for restore messaging', () => {
  const tone = getConfirmModalToneClassName('success');

  assert.match(tone.content, /border-success/);
  assert.match(tone.title, /text-success/);
  assert.match(tone.description, /text-success/);
});
