import assert from "node:assert/strict";
import test from "node:test";
import {
  formatBackupHistoryRelativeDate,
  getBackupHistoryRowPresentation,
} from "./backup-history.presenter";

function toLocalIso(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
) {
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

function createBackup(
  overrides: Partial<
    Parameters<typeof getBackupHistoryRowPresentation>[0]
  > = {},
) {
  return {
    id: "backup-1",
    kind: "functional_user" as const,
    trigger: "manual" as const,
    status: "success" as const,
    checksum: null,
    sizeBytes: 0,
    manifestVersion: 2,
    errorMessage: null,
    createdAt: toLocalIso(2026, 4, 1, 10, 0),
    startedAt: null,
    finishedAt: null,
    metadata: null,
    ...overrides,
  };
}

function createIdleDownloadState() {
  return {
    backupId: null,
    phase: "idle" as const,
    message: null,
  };
}

test("keeps failed download feedback on the matching backup row", () => {
  const presentation = getBackupHistoryRowPresentation(createBackup(), {
    downloadState: {
      backupId: "backup-1",
      phase: "failed",
      message: "falhou",
    },
    isPreparingDownload: false,
  });

  assert.equal(presentation.sizeLabel, "0,00 MB");
  assert.equal(presentation.download.label, "Tentar novamente");
  assert.equal(presentation.download.isDisabled, false);
  assert.equal(presentation.download.isFeedbackVisible, true);
  assert.equal(presentation.download.rowToneClassName, "bg-destructive/5");
});

test("formats today and yesterday labels with calendar awareness", () => {
  const now = new Date(2026, 3, 10, 15, 30, 0);

  assert.equal(
    formatBackupHistoryRelativeDate(new Date(2026, 3, 10, 10, 0, 0), now),
    "Hoje, 10:00",
  );
  assert.equal(
    formatBackupHistoryRelativeDate(new Date(2026, 3, 9, 23, 30, 0), now),
    "Ontem, 23:30",
  );
  assert.equal(
    formatBackupHistoryRelativeDate("invalid", now),
    "Data indisponível",
  );
});

test("maps failed jobs to a public error message", () => {
  const presentation = getBackupHistoryRowPresentation(
    createBackup({
      status: "failed",
      errorMessage: "internal",
    }),
    {
      downloadState: createIdleDownloadState(),
      isPreparingDownload: false,
    },
  );

  assert.equal(presentation.status.label, "Falhou");
  assert.match(presentation.errorLabel ?? "", /revise a configuração/i);
  assert.equal(presentation.download.isDisabled, true);
});

test("disables download while another request is being prepared", () => {
  const presentation = getBackupHistoryRowPresentation(createBackup(), {
    downloadState: createIdleDownloadState(),
    isPreparingDownload: true,
  });

  assert.equal(presentation.download.label, "Baixar");
  assert.equal(presentation.download.isDisabled, true);
  assert.equal(presentation.download.isFeedbackVisible, false);
});
