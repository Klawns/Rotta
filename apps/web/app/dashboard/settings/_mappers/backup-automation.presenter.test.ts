import assert from "node:assert/strict";
import test from "node:test";
import {
  getBackupAutomationFrequencyPresentation,
  getBackupAutomationNoticeDescription,
} from "./backup-automation.presenter";

test("builds frequency labels from cron expressions", () => {
  assert.equal(
    getBackupAutomationFrequencyPresentation("0 0 */5 * *").summaryLabel,
    "De 5 em 5 dias",
  );
  assert.equal(
    getBackupAutomationFrequencyPresentation("0 0 * * *").noticeText,
    "todos os dias",
  );
});

test("builds a healthy automation notice with retention info", () => {
  const description = getBackupAutomationNoticeDescription({
    automation: {
      health: "registered",
      automationEnabled: true,
      functionalCron: "0 0 */3 * *",
      technicalCron: "0 0 * * *",
      functionalRegistered: true,
      technicalRegistered: true,
      lastCheckedAt: null,
    },
    historyLimit: 7,
    retentionCount: 10,
  });

  assert.match(description, /de 3 em 3 dias/i);
  assert.match(description, /10 backups/i);
  assert.match(description, /mais recentes/i);
});
