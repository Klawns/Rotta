import { formatDisplayDateValue } from "@/lib/date-utils";
import { getBackupAutomationFrequencyPresentation } from "./backup-automation.presenter";

interface BackupsOverviewPresentationOptions {
  latestBackupAt?: string | null;
  retentionCount: number;
  isAutomationActive: boolean;
  functionalCron?: string | null;
}

export interface BackupsOverviewMetric {
  id: "latest" | "automation" | "retention";
  label: string;
  value: string;
  toneClassName: string;
}

export function getBackupsOverviewPresentation({
  latestBackupAt,
  retentionCount,
  isAutomationActive,
  functionalCron,
}: BackupsOverviewPresentationOptions) {
  const automationFrequency =
    getBackupAutomationFrequencyPresentation(functionalCron);

  return {
    metrics: [
      {
        id: "latest",
        label: "Ultimo backup",
        value: latestBackupAt
          ? formatDisplayDateValue(latestBackupAt)
          : "Nenhum backup valido",
        toneClassName: "border-primary/15 bg-primary/5 text-primary",
      },
      {
        id: "automation",
        label: "Automacao",
        value: isAutomationActive
          ? automationFrequency.summaryLabel
          : "Desativada",
        toneClassName: "border-info/15 bg-info/5 text-info",
      },
      {
        id: "retention",
        label: "Retencao",
        value: `${retentionCount} backups`,
        toneClassName: "border-warning/15 bg-warning/5 text-warning",
      },
    ] satisfies BackupsOverviewMetric[],
  };
}
