"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBackupDownload } from "@/hooks/use-backup-download";
import { useToast } from "@/hooks/use-toast";
import { shouldPollBackupJobs } from "@/lib/backup-query-state";
import { parseApiError } from "@/lib/api-error";
import { adminKeys } from "@/lib/query-keys";
import { adminSystemService } from "@/services/admin-system.service";

export function useAdminBackups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const backupsQuery = useQuery({
    queryKey: adminKeys.technicalBackups(),
    queryFn: ({ signal }) => adminSystemService.listTechnicalBackups(signal),
    retry: false,
    refetchInterval: (query) => {
      return shouldPollBackupJobs(query.state.data) ? 3000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const settingsQuery = useQuery({
    queryKey: adminKeys.systemBackupSettings(),
    queryFn: ({ signal }) => adminSystemService.getSystemBackupSettings(signal),
    retry: false,
  });

  const createTechnicalBackupMutation = useMutation({
    mutationFn: () => adminSystemService.createManualTechnicalBackup(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.technicalBackups(),
      });
      toast({
        title: "Backup técnico iniciado",
        description: "O dump completo foi enviado para a fila.",
      });
    },
    onError: (error) => {
      toast({
        title: "Falha ao iniciar backup técnico",
        description: parseApiError(
          error,
          "Não foi possível iniciar o backup técnico agora. Tente novamente em instantes.",
        ),
        variant: "destructive",
      });
    },
  });

  const updateSystemBackupSettingsMutation = useMutation({
    mutationFn: adminSystemService.updateSystemBackupSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.systemBackupSettings(),
      });
      await queryClient.invalidateQueries({
        queryKey: adminKeys.technicalBackups(),
      });
      toast({
        title: "Configuração de backup atualizada",
        description: "O scheduler e a retenção sistêmica foram reaplicados.",
      });
    },
    onError: (error) => {
      toast({
        title: "Falha ao salvar configuração de backup",
        description: parseApiError(
          error,
          "Não foi possível salvar a configuração do backup sistêmico.",
        ),
        variant: "destructive",
      });
    },
  });

  const {
    downloadState,
    isPreparingDownload,
    isDownloadActive,
    startDownload,
  } = useBackupDownload({
    requestDownloadUrl: (backupId) =>
      adminSystemService.getTechnicalDownloadUrl(backupId),
    successTitle: "Download técnico iniciado",
    successDescription:
      "O navegador já iniciou a transferência do dump técnico.",
    errorTitle: "Falha ao baixar dump técnico",
    errorDescription:
      "Não foi possível preparar o download do dump técnico. Tente novamente.",
  });

  return {
    backups: backupsQuery.data ?? [],
    systemSettings: settingsQuery.data ?? null,
    isLoading: backupsQuery.isLoading,
    isSettingsLoading: settingsQuery.isLoading,
    backupDownloadState: downloadState,
    errorMessage: backupsQuery.isError
      ? parseApiError(
          backupsQuery.error,
          "Não foi possível carregar o histórico de backups técnicos.",
        )
      : null,
    settingsErrorMessage: settingsQuery.isError
      ? parseApiError(
          settingsQuery.error,
          "Não foi possível carregar a configuração do backup sistêmico.",
        )
      : null,
    isCreating: createTechnicalBackupMutation.isPending,
    isSavingSettings: updateSystemBackupSettingsMutation.isPending,
    isPreparingDownload,
    isDownloadActive,
    refresh: backupsQuery.refetch,
    createTechnicalBackup: () => createTechnicalBackupMutation.mutateAsync(),
    saveSystemBackupSettings: (
      input: Parameters<
        typeof adminSystemService.updateSystemBackupSettings
      >[0],
    ) => updateSystemBackupSettingsMutation.mutateAsync(input),
    openDownloadUrl: startDownload,
  };
}
