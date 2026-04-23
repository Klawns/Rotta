"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Mail, Smartphone } from "lucide-react";

import {
  AdminCard,
  AdminInlineNotice,
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
} from "@/app/admin/_components/admin-ui";
import { QueryErrorState } from "@/components/query-error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseApiError } from "@/lib/api-error";
import {
  buildAdminSystemConfigUpdates,
  getAdminSystemConfigFormValues,
  type AdminSystemConfigFormValues,
} from "./_lib/admin-system-config-form";
import { useAdminConfigs } from "./_hooks/use-admin-configs";

export function GlobalSettingsView() {
  const {
    configs,
    hasLoadedConfigs,
    isLoading,
    error,
    refetch,
    isSaving,
    saveConfigs,
  } = useAdminConfigs();
  const initialValues = useMemo(
    () => getAdminSystemConfigFormValues(configs),
    [configs],
  );

  if (isLoading) {
    return (
      <AdminLoadingState
        title="Carregando configurações"
        description="Buscando os parâmetros globais ativos na plataforma."
      />
    );
  }

  if (error && !hasLoadedConfigs) {
    return (
      <QueryErrorState
        error={error}
        title="Não foi possível carregar as configurações globais"
        description="Revise a conectividade da área administrativa e tente novamente."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Configurações globais"
        description="Valores globais utilizados em toda a plataforma."
      />

      <GlobalSettingsForm
        initialValues={initialValues}
        isSaving={isSaving}
        onSave={saveConfigs}
      />
    </AdminPage>
  );
}

interface GlobalSettingsFormProps {
  initialValues: AdminSystemConfigFormValues;
  isSaving: boolean;
  onSave: ReturnType<typeof useAdminConfigs>["saveConfigs"];
}

function GlobalSettingsForm({
  initialValues,
  isSaving,
  onSave,
}: GlobalSettingsFormProps) {
  const [formValues, setFormValues] =
    useState<AdminSystemConfigFormValues>(initialValues);
  const [message, setMessage] = useState<{
    tone: "success" | "danger";
    text: string;
  } | null>(null);

  useEffect(() => {
    setFormValues(initialValues);
    setMessage(null);
  }, [initialValues]);

  const pendingUpdates = useMemo(
    () => buildAdminSystemConfigUpdates(formValues, initialValues),
    [formValues, initialValues],
  );
  const hasChanges = pendingUpdates.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasChanges) {
      setMessage({
        tone: "danger",
        text: "Nenhuma alteração pendente para salvar.",
      });
      return;
    }

    try {
      await onSave(pendingUpdates);
      setMessage({
        tone: "success",
        text: "Configurações globais atualizadas com sucesso.",
      });
    } catch (error) {
      setMessage({
        tone: "danger",
        text: parseApiError(
          error,
          "Não foi possível salvar as configurações globais.",
        ),
      });
    }
  };

  return (
    <AdminCard className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Canais de suporte
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Atualize de forma explícita os contatos publicados para suporte.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-500" />
            WhatsApp de suporte
          </Label>
          <Input
            value={formValues.supportWhatsapp}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                supportWhatsapp: event.target.value,
              }))
            }
            placeholder="https://wa.me/..."
            className="border-border bg-white"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail size={16} className="text-blue-600" />
            E-mail de suporte
          </Label>
          <Input
            value={formValues.supportEmail}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                supportEmail: event.target.value,
              }))
            }
            placeholder="suporte@..."
            className="border-border bg-white"
            disabled={isSaving}
          />
        </div>

        {message ? (
          <AdminInlineNotice tone={message.tone}>
            {message.text}
          </AdminInlineNotice>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={isSaving || !hasChanges}
            onClick={() => {
              setFormValues(initialValues);
              setMessage(null);
            }}
          >
            Descartar alterações
          </Button>
          <Button
            type="submit"
            className="rounded-xl"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
