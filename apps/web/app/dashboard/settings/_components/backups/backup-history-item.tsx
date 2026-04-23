"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { BackupDownloadInlineStatus } from "@/components/backup-download-inline-status";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDisplayDateValue } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { BackupDownloadState } from "@/hooks/use-backup-download";
import type { BackupJobSummary } from "@/types/backups";
import { getBackupHistoryRowPresentation } from "../../_mappers/backup-history.presenter";

interface BackupHistoryItemProps {
  backup: BackupJobSummary;
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  onDownload: (backupId: string) => void;
}

export function BackupHistoryItem({
  backup,
  downloadState,
  isPreparingDownload,
  onDownload,
}: BackupHistoryItemProps) {
  const presentation = getBackupHistoryRowPresentation(backup, {
    downloadState,
    isPreparingDownload,
  });
  const StatusIcon = presentation.status.icon;
  const DownloadIcon = presentation.download.icon;
  const [isOpen, setIsOpen] = useState(Boolean(presentation.errorLabel));
  const isExpanded =
    isOpen ||
    (downloadState.backupId === backup.id && downloadState.phase !== "idle");

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "px-4 py-4 sm:px-5",
          presentation.download.rowToneClassName,
        )}
      >
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] lg:items-center">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              {presentation.createdAtLabel}
            </p>
            <p className="text-xs text-text-secondary">
              Inicio {formatDisplayDateValue(backup.startedAt, "--")}
            </p>
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-text-primary">
              {presentation.originLabel}
            </p>
            <p className="text-xs text-text-secondary">
              {presentation.sizeLabel}
            </p>
          </div>

          <div className="min-w-0 space-y-1">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium",
                presentation.status.className,
              )}
            >
              <StatusIcon className="h-4 w-4" />
              {presentation.status.label}
            </span>
            {presentation.errorLabel ? (
              <p className="text-xs text-destructive">
                {presentation.errorLabel}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-2xl"
              disabled={presentation.download.isDisabled}
              onClick={() => onDownload(backup.id)}
            >
              <DownloadIcon
                className={cn(
                  "mr-2 h-4 w-4",
                  presentation.download.iconClassName,
                )}
              />
              {presentation.download.label}
            </Button>

            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-2xl"
              >
                {isExpanded ? (
                  <ChevronDown className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                Detalhes
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <BackupDownloadInlineStatus
          state={downloadState}
          isVisible={presentation.download.isFeedbackVisible}
          className="mt-3"
        />

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mt-4 rounded-[1.25rem] border border-border-subtle bg-background/65 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Info className="h-4 w-4 text-text-secondary" />
              Detalhes do job
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                  ID
                </p>
                <p className="break-all font-mono text-xs text-text-primary">
                  {backup.id}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                  Tipo
                </p>
                <p className="text-sm text-text-primary">
                  {presentation.kindLabel}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                  Finalizado em
                </p>
                <p className="text-sm text-text-primary">
                  {formatDisplayDateValue(backup.finishedAt, "--")}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                  Checksum
                </p>
                <p
                  className="truncate font-mono text-xs text-text-primary"
                  title={backup.checksum ?? undefined}
                >
                  {backup.checksum ?? "--"}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
