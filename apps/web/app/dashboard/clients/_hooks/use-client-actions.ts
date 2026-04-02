'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { removeClientCaches, upsertClientCaches } from '@/lib/client-cache';
import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import {
  invalidateRideCachesForClient,
  removeRideCaches,
  removeRideCachesByClient,
} from '@/lib/ride-cache';
import { formatCurrency } from '@/lib/utils';
import { clientsService } from '@/services/clients-service';
import { ridesService } from '@/services/rides-service';
import { type Client, type Ride } from '@/types/rides';

function getRideClientId(ride: Ride) {
  return ride.clientId || ride.client?.id || '';
}

export function useClientActions() {
  const queryClient = useQueryClient();

  const togglePinMutation = useMutation({
    mutationFn: (client: Client) => clientsService.togglePin(client.id, !!client.isPinned),
    onSuccess: (_, client) => {
      upsertClientCaches(queryClient, {
        ...client,
        isPinned: !client.isPinned,
      });

      toast.success('Cliente fixado/desfixado!');
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao alterar fixacao do cliente.'));
    },
  });

  const closeDebtMutation = useMutation({
    mutationFn: (clientId: string) => clientsService.closeDebt(clientId),
    onSuccess: async (result, clientId) => {
      await invalidateRideCachesForClient(queryClient, clientId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId), exact: true }),
        queryClient.invalidateQueries({ queryKey: clientKeys.balance(clientId), exact: true }),
        queryClient.invalidateQueries({ queryKey: clientKeys.payments(clientId) }),
        queryClient.invalidateQueries({ queryKey: financeKeys.all }),
      ]);

      toast.success(
        result.generatedBalance > 0
          ? `Divida fechada. ${result.settledRides} corridas quitadas e ${formatCurrency(result.generatedBalance)} em saldo.`
          : `Divida fechada. ${result.settledRides} corridas quitadas.`,
      );
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao fechar divida.'));
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (clientId: string) => clientsService.deleteClient(clientId),
    onSuccess: async (_, clientId) => {
      removeClientCaches(queryClient, clientId);
      removeRideCachesByClient(queryClient, clientId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...rideKeys.all, 'stats'] }),
        queryClient.invalidateQueries({ queryKey: financeKeys.all }),
      ]);

      toast.success('Cliente excluido com sucesso.');
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao excluir cliente. Verifique pendencias.'));
    },
  });

  const deleteRideMutation = useMutation({
    mutationFn: (ride: Ride) => ridesService.deleteRide(ride.id),
    onSuccess: async (_, ride) => {
      removeRideCaches(queryClient, ride.id);

      const clientId = getRideClientId(ride);
      const tasks = [
        queryClient.invalidateQueries({ queryKey: rideKeys.frequentClients() }),
        queryClient.invalidateQueries({ queryKey: financeKeys.all }),
      ];

      if (clientId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: clientKeys.detail(clientId),
            exact: true,
          }),
        );
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: clientKeys.balance(clientId),
            exact: true,
          }),
        );
      }

      await Promise.all(tasks);

      toast.success('Corrida excluida com sucesso.');
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao excluir corrida.'));
    },
  });

  return {
    isSettling: closeDebtMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
    isDeletingRide: deleteRideMutation.isPending,
    isTogglingPin: togglePinMutation.isPending,
    togglePin: async (client: Client) => {
      try {
        await togglePinMutation.mutateAsync(client);
        return true;
      } catch {
        return false;
      }
    },
    closeDebt: async (clientId: string) => {
      try {
        await closeDebtMutation.mutateAsync(clientId);
        return true;
      } catch {
        return false;
      }
    },
    deleteClient: async (clientId: string) => {
      try {
        await deleteClientMutation.mutateAsync(clientId);
        return true;
      } catch {
        return false;
      }
    },
    deleteRide: async (ride: Ride) => {
      try {
        await deleteRideMutation.mutateAsync(ride);
        return true;
      } catch {
        return false;
      }
    },
  };
}
