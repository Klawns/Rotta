import assert from "node:assert/strict";
import test from "node:test";
import {
  clampPage,
  filterBackups,
  getTotalPages,
  paginateBackups,
} from "./use-backup-list-state";

const viewModels = [
  {
    id: "backup-1",
    createdAtLabel: "20/04/2026, 10:00",
    createdAtRelativeLabel: "há 2h",
    sourceLabel: "Manual",
    sizeLabel: "1,00 MB",
    fileNameLabel: "backup-1.sql.gz",
    checksumLabel: "abc",
    checksumTitle: "abc",
    manifestLabel: "Manifest v1",
    startedAtLabel: "10:00",
    finishedAtLabel: "10:01",
    warningMessage: null,
    errorMessage: null,
    status: {
      label: "Concluído",
      tone: "success" as const,
    },
    canDownload: true,
  },
  {
    id: "backup-2",
    createdAtLabel: "20/04/2026, 11:00",
    createdAtRelativeLabel: "há 1h",
    sourceLabel: "Automático",
    sizeLabel: "--",
    fileNameLabel: "backup-2.sql.gz",
    checksumLabel: "def",
    checksumTitle: "def",
    manifestLabel: "Manifest v1",
    startedAtLabel: "--",
    finishedAtLabel: "--",
    warningMessage: null,
    errorMessage: "erro",
    status: {
      label: "Falhou",
      tone: "danger" as const,
    },
    canDownload: false,
  },
];

const rawBackups = [
  {
    id: "backup-1",
    status: "success" as const,
    trigger: "manual" as const,
  },
  {
    id: "backup-2",
    status: "failed" as const,
    trigger: "scheduled" as const,
  },
];

test("filters backups by status and origin together", () => {
  const results = filterBackups(
    {
      backups: viewModels,
      rawBackups,
    },
    {
      statusFilter: "failed",
      sourceFilter: "scheduled",
    },
  );

  assert.deepEqual(
    results.map((item) => item.id),
    ["backup-2"],
  );
});

test("clamps and paginates pages safely", () => {
  assert.equal(getTotalPages(0), 1);
  assert.equal(getTotalPages(17), 3);
  assert.equal(clampPage(0, 4), 1);
  assert.equal(clampPage(8, 4), 4);

  const paginated = paginateBackups(
    Array.from({ length: 9 }, (_, index) => ({
      ...viewModels[0],
      id: `backup-${index + 1}`,
    })),
    2,
  );

  assert.deepEqual(
    paginated.map((item) => item.id),
    ["backup-9"],
  );
});
