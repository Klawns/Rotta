import type { BackupAutomationStatus } from "@/types/backups";

interface BackupAutomationFrequencyPresentation {
  days: number;
  summaryLabel: string;
  noticeText: string;
}

function getDaysFromCron(cron: string | undefined | null): number {
  if (!cron) {
    return 3;
  }

  const parts = cron.split(" ");

  if (parts.length >= 5) {
    const dayOfMonth = parts[2];

    if (dayOfMonth.startsWith("*/")) {
      return Number.parseInt(dayOfMonth.replace("*/", ""), 10) || 3;
    }

    if (dayOfMonth === "*") {
      return 1;
    }
  }

  return 3;
}

export function getBackupAutomationFrequencyPresentation(
  cron: string | undefined | null,
): BackupAutomationFrequencyPresentation {
  const days = getDaysFromCron(cron);

  return {
    days,
    summaryLabel: days === 1 ? "Diaria" : `De ${days} em ${days} dias`,
    noticeText: days === 1 ? "todos os dias" : `de ${days} em ${days} dias`,
  };
}

export function getBackupAutomationNoticeDescription(
  status: BackupAutomationStatus | null,
) {
  if (status?.automation.health === "registered") {
    const frequency = getBackupAutomationFrequencyPresentation(
      status.automation.functionalCron,
    );

    return `Fique tranquilo! Seus backups são gerados automaticamente de forma segura ${frequency.noticeText}. Nós armazenamos os seus últimos ${status.retentionCount} backups. Quando um novo backup é concluído acima desse limite, mantemos os mais recentes e removemos os mais antigos.`;
  }

  return "O agendamento automático não está disponível no momento. Recomendamos gerar backups manuais para sua segurança.";
}
