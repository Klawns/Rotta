"use client";

import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Rocket } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutSelector } from "@/components/dashboard/checkout-selector";
import { useAuth } from "@/hooks/use-auth";
import { getFreeTrialState } from "@/services/free-trial-service";

export default function PricingGatePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const isTrialExpired = reason === "trial_expired";
  const trial = getFreeTrialState(user);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground lg:px-24">
      {isTrialExpired && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-8 z-50 flex items-center gap-3 rounded-2xl border border-trial-expired/30 bg-trial-expired/10 px-6 py-3 shadow-2xl shadow-trial-expired/10 backdrop-blur-md"
        >
          <div className="h-2 w-2 animate-pulse rounded-full bg-trial-expired" />
          <p className="text-sm font-bold text-trial-expired">
            Seu período gratuito expirou. Assine para continuar usando o Rotta.
          </p>
        </motion.div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/12 to-transparent" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />

      <div className="relative w-full max-w-7xl">
        <header className="mb-16 space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary"
          >
            <Rocket size={14} />
            Upgrade de Conta
          </motion.div>

          <h1 className="text-4xl font-black tracking-tight lg:text-6xl">
            Desbloqueie o
            <br />
            <span className="bg-gradient-to-r from-primary to-trial-active bg-clip-text text-transparent">
              acesso completo
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary">
            Continue registrando corridas, gerenciando clientes e exportando
            relatórios sem interrupções.
          </p>
        </header>

        <CheckoutSelector />

        <footer className="mt-20 flex flex-col items-center gap-6">
          <div className="h-px w-24 bg-border-subtle" />

          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <button
              onClick={() => router.push("/dashboard")}
              className="group flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              {trial.isStarterExpired
                ? "Voltar ao dashboard bloqueado"
                : "Voltar ao dashboard"}
            </button>

            <button
              onClick={logout}
              className="group flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              <LogOut
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Sair da conta
            </button>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Pagamento processado com seguranca via AbacatePay (Pix).
          </p>
        </footer>
      </div>
    </div>
  );
}
