import assert from 'node:assert/strict';
import test from 'node:test';

import { getSettingsTabItems } from './settings-tabs.config';

test('activates Atalhos on /dashboard/settings', () => {
  const tabs = getSettingsTabItems('/dashboard/settings');
  const generalTab = tabs.find((tab) => tab.id === 'general');
  const dangerTab = tabs.find((tab) => tab.id === 'danger');

  assert.ok(generalTab);
  assert.ok(dangerTab);
  assert.equal(generalTab.isActive, true);
  assert.equal(dangerTab.isActive, false);
});

test('activates Limpeza on /dashboard/settings/danger', () => {
  const tabs = getSettingsTabItems('/dashboard/settings/danger');
  const generalTab = tabs.find((tab) => tab.id === 'general');
  const dangerTab = tabs.find((tab) => tab.id === 'danger');

  assert.ok(generalTab);
  assert.ok(dangerTab);
  assert.equal(generalTab.isActive, false);
  assert.equal(dangerTab.isActive, true);
});
