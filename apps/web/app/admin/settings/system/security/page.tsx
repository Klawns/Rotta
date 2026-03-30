"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAdminPasswordChange } from "./_hooks/use-admin-password-change";

export default function SecuritySettingsPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 fade-in"
        >
            <div className="max-w-2xl">
                <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 relative overflow-hidden">
                    <h2 className="text-2xl font-bold text-white mb-2">Seguranca de Conta</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        Mantenha suas credenciais administrativas seguras, isso nao altera o acesso via provedores externos.
                    </p>
                    <PasswordChangeForm />
                </div>
            </div>
        </motion.div>
    );
}

function PasswordChangeForm() {
    const { changePassword, isSubmitting } = useAdminPasswordChange();
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);

        const result = await changePassword(form);
        setMessage(result);

        if (result.type === "success") {
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Senha Atual</label>
                <input
                    name="currentPassword"
                    type="password"
                    required
                    value={form.currentPassword}
                    onChange={(event) =>
                        setForm((current) => ({ ...current, currentPassword: event.target.value }))
                    }
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    placeholder="********"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nova Senha</label>
                <input
                    name="newPassword"
                    type="password"
                    required
                    value={form.newPassword}
                    onChange={(event) =>
                        setForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    placeholder="********"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Confirmar Nova Senha</label>
                <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(event) =>
                        setForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    placeholder="********"
                />
            </div>

            {message && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "mt-4 rounded-xl border p-4 text-sm font-medium",
                        message.type === "success"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/20 bg-red-500/10 text-red-400",
                    )}
                >
                    {message.text}
                </motion.p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 disabled:opacity-50"
            >
                {isSubmitting ? "Autenticando..." : "Atualizar Credenciais"}
            </button>
        </form>
    );
}
