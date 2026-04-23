import assert from "node:assert/strict";
import test from "node:test";
import { getBackupItemViewModel } from "./backup-item.presenter";

test("maps successful backups into concise list item view models", () => {
  const viewModel = getBackupItemViewModel({
    id: "backup-1",
    kind: "technical_full",
    trigger: "scheduled",
    status: "success",
    checksum: "1234567890abcdef1234567890abcdef",
    sizeBytes: 1024 * 1024 * 2,
    manifestVersion: 3,
    errorMessage: null,
    warnings: ["Fallback para r2 executado."],
    displayName: "technical-backup-2026-04-20.sql.gz",
    createdAt: "2026-04-20T10:00:00.000Z",
    startedAt: "2026-04-20T10:01:00.000Z",
    finishedAt: "2026-04-20T10:02:00.000Z",
    metadata: null,
  });

  assert.equal(viewModel.sourceLabel, "Automático");
  assert.equal(viewModel.sizeLabel, "2,00 MB");
  assert.equal(viewModel.status.label, "Concluído");
  assert.equal(viewModel.status.tone, "success");
  assert.equal(viewModel.canDownload, true);
  assert.equal(viewModel.warningMessage, "Fallback para r2 executado.");
  assert.equal(viewModel.checksumLabel, "1234567890abcdef...");
});

test("marks failed backups as non-downloadable and keeps fallback labels", () => {
  const viewModel = getBackupItemViewModel({
    id: "backup-2",
    kind: "technical_full",
    trigger: "manual",
    status: "failed",
    checksum: null,
    sizeBytes: null,
    manifestVersion: 1,
    errorMessage: "pg_dump unavailable",
    warnings: [],
    displayName: null,
    createdAt: "invalid",
    startedAt: null,
    finishedAt: null,
    metadata: null,
  });

  assert.equal(viewModel.createdAtLabel, "Data indisponível");
  assert.equal(viewModel.checksumLabel, "Checksum indisponível");
  assert.equal(viewModel.status.tone, "danger");
  assert.equal(viewModel.canDownload, false);
  assert.equal(viewModel.errorMessage, "pg_dump unavailable");
});
