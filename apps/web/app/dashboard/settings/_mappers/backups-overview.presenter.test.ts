import assert from "node:assert/strict";
import test from "node:test";
import { getBackupsOverviewPresentation } from "./backups-overview.presenter";

test("builds compact overview metrics for active automation", () => {
  const presentation = getBackupsOverviewPresentation({
    latestBackupAt: "2026-04-10T12:00:00.000Z",
    retentionCount: 7,
    isAutomationActive: true,
    functionalCron: "0 0 */3 * *",
  });

  assert.equal(presentation.metrics[0].label, "Ultimo backup");
  assert.match(presentation.metrics[1].value, /3 em 3 dias/i);
  assert.equal(presentation.metrics[2].value, "7 backups");
});

test("falls back when there is no successful backup yet", () => {
  const presentation = getBackupsOverviewPresentation({
    latestBackupAt: null,
    retentionCount: 10,
    isAutomationActive: false,
    functionalCron: null,
  });

  assert.equal(presentation.metrics[0].value, "Nenhum backup valido");
  assert.equal(presentation.metrics[1].value, "Desativada");
});
