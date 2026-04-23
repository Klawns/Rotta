import assert from 'node:assert/strict';
import test from 'node:test';
import { getGeneralSettingsOverviewPresentation } from './general-settings-overview.presenter';

test('builds compact empty-state copy for overview when there are no presets', () => {
  const presentation = getGeneralSettingsOverviewPresentation({
    activePresetCount: 0,
  });

  assert.equal(presentation.primaryActionLabel, 'Criar primeiro atalho');
  assert.equal(presentation.activeCountLabel, '0 atalhos ativos');
  assert.equal(presentation.title, 'Atalhos do painel');
  assert.match(presentation.description, /valor e local/i);
});

test('pluralizes overview copy when presets already exist', () => {
  const presentation = getGeneralSettingsOverviewPresentation({
    activePresetCount: 3,
  });

  assert.equal(presentation.primaryActionLabel, 'Criar novo atalho');
  assert.equal(presentation.activeCountLabel, '3 atalhos ativos');
  assert.equal(presentation.activeCountValue, '3');
});
