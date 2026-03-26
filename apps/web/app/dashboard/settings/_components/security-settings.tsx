"use client";

import { ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";

export function SecuritySettings() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h3 className="text-2xl font-display font-extrabold text-text-primary tracking-tight flex items-center gap-2">
                    <ShieldCheck size={24} className="text-primary" />
                    Segurança
                </h3>
                <p className="text-sm text-text-muted font-medium">Gerencie sua proteção e dados de acesso.</p>
            </div>

            <div className="p-10 bg-card-background border border-border-subtle rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Lock size={32} className="text-primary" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-xl font-display font-black text-text-primary uppercase tracking-tight">Em breve</h4>
                    <p className="text-text-secondary text-sm font-medium max-w-sm">
                        Novas funcionalidades de autenticação em dois fatores e logs de acesso estão sendo preparadas para sua conta.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
