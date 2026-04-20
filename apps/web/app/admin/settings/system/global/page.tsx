'use client';

import { useState } from 'react';
import { Mail, Smartphone } from 'lucide-react';

import {
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
} from '@/app/admin/_components/admin-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminConfigs } from './_hooks/use-admin-configs';

export default function GlobalSettingsPage() {
  const { configs, isLoading, isSaving, updateConfig } = useAdminConfigs();

  if (isLoading) {
    return (
      <AdminLoadingState
        title="Carregando configuracoes"
        description="Buscando os parametros globais ativos na plataforma."
      />
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        badge="Sistema"
        title="Configuracoes globais"
        description="Valores globais utilizados em toda a plataforma."
      />

      <GlobalSettingsForm
        key={`${configs.SUPPORT_WHATSAPP || ''}:${configs.SUPPORT_EMAIL || ''}`}
        initialWhatsapp={configs.SUPPORT_WHATSAPP || ''}
        initialEmail={configs.SUPPORT_EMAIL || ''}
        isSaving={isSaving}
        onSave={updateConfig}
      />
    </AdminPage>
  );
}

interface GlobalSettingsFormProps {
  initialWhatsapp: string;
  initialEmail: string;
  isSaving: boolean;
  onSave: (input: { key: string; value: string }) => void;
}

function GlobalSettingsForm({
  initialWhatsapp,
  initialEmail,
  isSaving,
  onSave,
}: GlobalSettingsFormProps) {
  const [supportWhatsapp, setSupportWhatsapp] = useState(initialWhatsapp);
  const [supportEmail, setSupportEmail] = useState(initialEmail);

  return (
    <Card className="max-w-2xl rounded-[2rem] border-border/80 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <CardTitle>Opcoes gerais</CardTitle>
        <CardDescription>
          Estes parametros afetam contatos listados publicamente na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-500" />
            WhatsApp de suporte
          </Label>
          <Input
            value={supportWhatsapp}
            onChange={(event) => setSupportWhatsapp(event.target.value)}
            onBlur={() =>
              onSave({
                key: 'SUPPORT_WHATSAPP',
                value: supportWhatsapp,
              })
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
            value={supportEmail}
            onChange={(event) => setSupportEmail(event.target.value)}
            onBlur={() =>
              onSave({
                key: 'SUPPORT_EMAIL',
                value: supportEmail,
              })
            }
            placeholder="suporte@..."
            className="border-border bg-white"
            disabled={isSaving}
          />
        </div>
      </CardContent>
    </Card>
  );
}
