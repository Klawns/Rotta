'use client';

import { useMutation } from '@tanstack/react-query';
import { parseApiError } from '@/lib/api-error';
import { adminService } from '@/services/admin-service';
import { type ChangePasswordInput } from '@/types/admin';

export function useAdminPasswordChange() {
  const mutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => adminService.changePassword(data),
  });

  const changePassword = async (data: ChangePasswordInput) => {
    try {
      await mutation.mutateAsync(data);
      return {
        type: 'success' as const,
        text: 'Senha alterada com sucesso!',
      };
    } catch (error) {
      return {
        type: 'error' as const,
        text: parseApiError(error, 'Erro ao alterar senha. Verifique os dados.'),
      };
    }
  };

  return {
    changePassword,
    isSubmitting: mutation.isPending,
  };
}
