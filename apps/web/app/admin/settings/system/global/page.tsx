"use client";

import { useState } from "react";
import { Loader2, Mail, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminConfigs } from "./_hooks/use-admin-configs";

export default function GlobalSettingsPage() {
    const { configs, isLoading, isSaving, updateConfig } = useAdminConfigs();

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Configuracoes Globais</h1>
                <p className="text-slate-400">
                    Valores globais utilizados em toda a plataforma.
                </p>
            </div>
            <GlobalSettingsForm
                key={`${configs.SUPPORT_WHATSAPP || ""}:${configs.SUPPORT_EMAIL || ""}`}
                initialWhatsapp={configs.SUPPORT_WHATSAPP || ""}
                initialEmail={configs.SUPPORT_EMAIL || ""}
                isSaving={isSaving}
                onSave={updateConfig}
            />
        </div>
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
        <Card className="max-w-2xl border-white/5 bg-slate-900/40">
            <CardHeader>
                <CardTitle className="text-white">Opcoes Gerais</CardTitle>
                <CardDescription>
                    Estes parametros afetam contatos listados publicamente na plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Smartphone size={16} className="text-emerald-400" />
                        WhatsApp de Suporte
                    </Label>
                    <Input
                        value={supportWhatsapp}
                        onChange={(event) => setSupportWhatsapp(event.target.value)}
                        onBlur={() =>
                            onSave({
                                key: "SUPPORT_WHATSAPP",
                                value: supportWhatsapp,
                            })
                        }
                        placeholder="https://wa.me/..."
                        className="border-white/10 bg-slate-950"
                        disabled={isSaving}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Mail size={16} className="text-blue-400" />
                        E-mail de Suporte
                    </Label>
                    <Input
                        value={supportEmail}
                        onChange={(event) => setSupportEmail(event.target.value)}
                        onBlur={() =>
                            onSave({
                                key: "SUPPORT_EMAIL",
                                value: supportEmail,
                            })
                        }
                        placeholder="suporte@..."
                        className="border-white/10 bg-slate-950"
                        disabled={isSaving}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
