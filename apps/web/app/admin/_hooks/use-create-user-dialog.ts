"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "@/lib/api-error";
import { adminService } from "@/services/admin-service";
import {
  createInitialCreateUserFormValues,
  toCreateAdminUserInput,
  type CreateUserFormValues,
} from "../_mappers/admin-user-form.mapper";
import { invalidateAdminDashboardQueries } from "../_lib/admin-dashboard-query-cache";

interface UseCreateUserDialogOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function useCreateUserDialog({
  open,
  onOpenChange,
}: UseCreateUserDialogOptions) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateUserFormValues>(() =>
    createInitialCreateUserFormValues(),
  );

  const createUserMutation = useMutation({
    mutationFn: (values: CreateUserFormValues) =>
      adminService.createUser(toCreateAdminUserInput(values)),
    onSuccess: () => {
      void invalidateAdminDashboardQueries(queryClient);
    },
  });

  const resetDialogState = () => {
    setForm(createInitialCreateUserFormValues());
    createUserMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (createUserMutation.isPending) {
      return;
    }

    if (!nextOpen) {
      resetDialogState();
    }

    onOpenChange(nextOpen);
  };

  const handleFieldChange = <Field extends keyof CreateUserFormValues>(
    field: Field,
    value: CreateUserFormValues[Field],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const canSubmit =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || createUserMutation.isPending) {
      return;
    }

    createUserMutation.mutate(form, {
      onSuccess: () => {
        resetDialogState();
        onOpenChange(false);
      },
    });
  };

  return {
    open,
    form,
    error: createUserMutation.error
      ? parseApiError(
          createUserMutation.error,
          "Ocorreu um erro ao criar o usuario.",
        )
      : null,
    isSubmitting: createUserMutation.isPending,
    isSubmitDisabled: createUserMutation.isPending || !canSubmit,
    handleFieldChange,
    handleOpenChange,
    handleSubmit,
    handleCancel: () => handleOpenChange(false),
  };
}

export type CreateUserDialogState = ReturnType<typeof useCreateUserDialog>;
