'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/api-error';
import { shouldPollImportJob } from '@/lib/backup-query-state';
import {
  clientKeys,
  financeKeys,
  rideKeys,
  settingsKeys,
} from '@/lib/query-keys';
import functionalBackupsService from '@/services/functional-backups.service';
import type { BackupImportJobResponse } from '@/types/backups';

const ACTIVE_IMPORT_STORAGE_KEY = 'backups.activeImportJobId';

function getInitialImportJobId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_IMPORT_STORAGE_KEY);
}

export function useBackupRestoreFlow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewResult, setPreviewResult] =
    useState<BackupImportJobResponse | null>(null);
  const [activeImportJobId, setActiveImportJobId] = useState<string | null>(
    getInitialImportJobId,
  );

  const setPersistedActiveImportJobId = (importJobId: string | null) => {
    setActiveImportJobId(importJobId);

    if (typeof window === 'undefined') {
      return;
    }

    if (importJobId) {
      window.localStorage.setItem(ACTIVE_IMPORT_STORAGE_KEY, importJobId);
      return;
    }

    window.localStorage.removeItem(ACTIVE_IMPORT_STORAGE_KEY);
  };

  const refreshImportedData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: settingsKeys.backups() }),
      queryClient.invalidateQueries({ queryKey: settingsKeys.backupsStatus() }),
      queryClient.invalidateQueries({ queryKey: settingsKeys.presets() }),
      queryClient.invalidateQueries({ queryKey: clientKeys.all }),
      queryClient.invalidateQueries({ queryKey: rideKeys.all }),
      queryClient.invalidateQueries({ queryKey: financeKeys.all }),
    ]);
  };

  const finalizeSuccessfulImport = async (
    importJob: BackupImportJobResponse,
  ) => {
    setPersistedActiveImportJobId(null);
    setPreviewResult(importJob);
    await refreshImportedData();
  };

  const handleResolvedImportJob = useEffectEvent(
    (importJob: BackupImportJobResponse) => {
      if (importJob.status === 'success') {
        void finalizeSuccessfulImport(importJob);
        return;
      }

      setPreviewResult(importJob);
      setPersistedActiveImportJobId(null);
    },
  );

  const importStatusQuery = useQuery({
    queryKey: settingsKeys.backupImport(activeImportJobId ?? 'idle'),
    enabled: Boolean(activeImportJobId),
    queryFn: ({ signal }) =>
      functionalBackupsService.getImportStatus(activeImportJobId!, signal),
    refetchInterval: (query) => {
      return shouldPollImportJob(query.state.data) ? 1500 : false;
    },
    refetchIntervalInBackground: true,
    retry: false,
  });

  useEffect(() => {
    const importJob = importStatusQuery.data;

    if (!importJob) {
      return;
    }

    if (importJob.status === 'running') {
      queueMicrotask(() => {
        setPreviewResult(importJob);
      });
      return;
    }

    queueMicrotask(() => {
      handleResolvedImportJob(importJob);
    });
  }, [importStatusQuery.data]);

  useEffect(() => {
    if (!importStatusQuery.error) {
      return;
    }

    queueMicrotask(() => {
      setPersistedActiveImportJobId(null);
    });
  }, [importStatusQuery.error]);

  const previewImportMutation = useMutation({
    mutationFn: (file: File) => functionalBackupsService.previewImport(file),
    onMutate: () => {
      setPreviewResult(null);
    },
    onSuccess: (response) => {
      setPreviewResult(response);
    },
    onError: (error) => {
      setPreviewResult(null);
      toast({
        title: 'Falha ao validar backup',
        description: parseApiError(
          error,
          'Nao foi possivel validar o arquivo do backup. Tente novamente.',
        ),
        variant: 'destructive',
      });
    },
  });

  const executeImportMutation = useMutation({
    mutationFn: (importJobId: string) =>
      functionalBackupsService.executeImport(importJobId),
    onMutate: (importJobId) => {
      setPersistedActiveImportJobId(importJobId);
      setPreviewResult((current) =>
        current && current.id === importJobId
          ? {
              ...current,
              status: 'running',
              phase: 'backing_up',
              errorMessage: null,
              startedAt: new Date().toISOString(),
              finishedAt: null,
            }
          : current,
      );
    },
    onSuccess: async (response) => {
      await finalizeSuccessfulImport(response);

      toast({
        title: 'Backup importado',
        description: 'Os dados operacionais foram restaurados com sucesso.',
      });
    },
    onError: (error) => {
      const description = parseApiError(
        error,
        'Nao foi possivel concluir a importacao do backup. Tente novamente.',
      );

      setPersistedActiveImportJobId(null);
      setPreviewResult((current) =>
        current
          ? {
              ...current,
              status: 'failed',
              phase: 'failed',
              errorMessage: description,
              finishedAt: new Date().toISOString(),
            }
          : current,
      );

      toast({
        title: 'Falha ao importar backup',
        description,
        variant: 'destructive',
      });
    },
  });

  const activeImportJob = importStatusQuery.data ?? previewResult;

  return {
    previewResult: activeImportJob ?? null,
    isPreviewingImport: previewImportMutation.isPending,
    isExecutingImport:
      executeImportMutation.isPending || activeImportJob?.status === 'running',
    previewImport: (file: File) => previewImportMutation.mutateAsync(file),
    executeImport: (importJobId: string) =>
      executeImportMutation.mutateAsync(importJobId),
    resetFlow: () => {
      setPreviewResult(null);
      setPersistedActiveImportJobId(null);
    },
  };
}
