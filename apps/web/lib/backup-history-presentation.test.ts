import assert from "node:assert/strict";
import test from "node:test";
import {
  getBackupOriginLabel,
  getLatestSuccessfulSummaryBackup,
} from "./backup-history-presentation";

test("maps each backup trigger to its public label", () => {
  assert.equal(getBackupOriginLabel("scheduled"), "Automático");
  assert.equal(getBackupOriginLabel("manual"), "Manual");
  assert.equal(getBackupOriginLabel("pre_import"), "Pré-importação");
});

test("ignores pre-import backups in the main summary and prefers manual or scheduled ones", () => {
  const result = getLatestSuccessfulSummaryBackup([
    {
      id: "pre-import-1",
      kind: "functional_user",
      trigger: "pre_import",
      status: "success",
      checksum: "checksum-1",
      sizeBytes: 1024,
      manifestVersion: 1,
      errorMessage: null,
      createdAt: "2026-04-01T12:00:00.000Z",
      startedAt: "2026-04-01T12:00:01.000Z",
      finishedAt: "2026-04-01T12:00:02.000Z",
      metadata: null,
    },
    {
      id: "manual-1",
      kind: "functional_user",
      trigger: "manual",
      status: "success",
      checksum: "checksum-2",
      sizeBytes: 2048,
      manifestVersion: 1,
      errorMessage: null,
      createdAt: "2026-03-31T12:00:00.000Z",
      startedAt: "2026-03-31T12:00:01.000Z",
      finishedAt: "2026-03-31T12:00:02.000Z",
      metadata: null,
    },
  ]);

  assert.deepEqual(result, {
    id: "manual-1",
    kind: "functional_user",
    trigger: "manual",
    status: "success",
    checksum: "checksum-2",
    sizeBytes: 2048,
    manifestVersion: 1,
    errorMessage: null,
    createdAt: "2026-03-31T12:00:00.000Z",
    startedAt: "2026-03-31T12:00:01.000Z",
    finishedAt: "2026-03-31T12:00:02.000Z",
    metadata: null,
  });
});

test("returns null when only pre-import backups succeeded", () => {
  const result = getLatestSuccessfulSummaryBackup([
    {
      id: "pre-import-1",
      kind: "functional_user",
      trigger: "pre_import",
      status: "success",
      checksum: "checksum-1",
      sizeBytes: 1024,
      manifestVersion: 1,
      errorMessage: null,
      createdAt: "2026-04-01T12:00:00.000Z",
      startedAt: "2026-04-01T12:00:01.000Z",
      finishedAt: "2026-04-01T12:00:02.000Z",
      metadata: null,
    },
  ]);

  assert.equal(result, null);
});
