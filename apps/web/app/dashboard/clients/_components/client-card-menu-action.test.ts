import assert from 'node:assert/strict';
import test from 'node:test';
import { runClientCardMenuAction } from './client-card-menu-action';

test('runs immediate actions right after closing the menu', () => {
  const events: string[] = [];

  runClientCardMenuAction({
    closeMenu: () => {
      events.push('close');
    },
    action: () => {
      events.push('action');
    },
  });

  assert.deepEqual(events, ['close', 'action']);
});

test('defers after-close actions until the scheduler runs', () => {
  const events: string[] = [];
  const scheduledAction: { current?: () => void } = {};

  runClientCardMenuAction({
    closeMenu: () => {
      events.push('close');
    },
    action: () => {
      events.push('action');
    },
    mode: 'after-close',
    schedule: (action) => {
      events.push('scheduled');
      scheduledAction.current = action;
    },
  });

  assert.deepEqual(events, ['close', 'scheduled']);
  assert.equal(typeof scheduledAction.current, 'function');

  assert.ok(scheduledAction.current);
  scheduledAction.current();

  assert.deepEqual(events, ['close', 'scheduled', 'action']);
});
