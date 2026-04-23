"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import { useBulkDelete } from "../_hooks/use-bulk-delete";

export function DangerZone() {
  const {
    deleteAllClients,
    isDeletingClients,
    deleteAllRides,
    isDeletingRides,
  } = useBulkDelete();

  const [isConfirmClientsOpen, setIsConfirmClientsOpen] = useState(false);
  const [isConfirmRidesOpen, setIsConfirmRidesOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-2xl font-display font-bold tracking-tight text-destructive">
          Limpeza de dados
        </h3>
      </div>

      <div className="grid gap-6">
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-destructive/10 bg-card-background/95 p-8 shadow-sm transition-all hover:border-destructive/25">
          <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row">
            <div className="relative z-10 max-w-xl space-y-3 text-center md:text-left">
              <h4 className="text-xl font-display font-bold tracking-tight text-text-primary">
                Excluir todos os clientes
              </h4>
              <p className="text-sm font-medium leading-7 text-text-secondary">
                Apaga todos os clientes e os dados vinculados de forma
                permanente.
              </p>
            </div>

            <Button
              onClick={() => setIsConfirmClientsOpen(true)}
              disabled={isDeletingClients}
              className="relative z-20 h-12 w-full min-w-[200px] rounded-2xl bg-destructive/10 px-6 text-sm font-semibold tracking-[0.01em] text-destructive shadow-sm transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-[0.98] md:w-auto"
            >
              {isDeletingClients ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Trash2 size={16} strokeWidth={2.4} />
              )}
              {isDeletingClients ? "Excluindo..." : "Excluir tudo"}
            </Button>
          </div>

          <AnimatePresence>
            {isDeletingClients && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative z-10 flex items-center gap-2 text-xs font-semibold text-destructive"
              >
                <Loader2 className="animate-spin" size={12} />
                Processando exclusão em massa...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-destructive/10 bg-card-background/95 p-8 shadow-sm transition-all hover:border-destructive/25">
          <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row">
            <div className="relative z-10 max-w-xl space-y-3 text-center md:text-left">
              <h4 className="text-xl font-display font-bold tracking-tight text-text-primary">
                Limpar histórico de corridas
              </h4>
              <p className="text-sm font-medium leading-7 text-text-secondary">
                Remove todo o histórico de corridas e estatísticas de forma
                permanente.
              </p>
            </div>

            <Button
              onClick={() => setIsConfirmRidesOpen(true)}
              disabled={isDeletingRides}
              className="relative z-20 h-12 w-full min-w-[200px] rounded-2xl bg-destructive/10 px-6 text-sm font-semibold tracking-[0.01em] text-destructive shadow-sm transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-[0.98] md:w-auto"
            >
              {isDeletingRides ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Trash2 size={16} strokeWidth={2.4} />
              )}
              {isDeletingRides ? "Limpando..." : "Limpar histórico"}
            </Button>
          </div>

          <AnimatePresence>
            {isDeletingRides && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="relative z-10 flex items-center gap-2 text-xs font-semibold text-destructive"
              >
                <Loader2 className="animate-spin" size={12} />
                Resetando histórico de atividades...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmClientsOpen}
        onClose={() => setIsConfirmClientsOpen(false)}
        onConfirm={async () => {
          await deleteAllClients();
          setIsConfirmClientsOpen(false);
        }}
        title="Excluir todos os clientes"
        description="Todos os registros de clientes, corridas e pagamentos serão removidos definitivamente do sistema. Revise com cuidado antes de continuar."
        confirmText="Excluir tudo"
        variant="danger"
        isLoading={isDeletingClients}
      />

      <ConfirmModal
        isOpen={isConfirmRidesOpen}
        onClose={() => setIsConfirmRidesOpen(false)}
        onConfirm={async () => {
          await deleteAllRides();
          setIsConfirmRidesOpen(false);
        }}
        title="Limpar histórico de corridas"
        description="Todos os registros e estatísticas de corridas serão apagados permanentemente. Use esta ação apenas se quiser recomeçar esse histórico do zero."
        confirmText="Limpar histórico"
        variant="danger"
        isLoading={isDeletingRides}
      />
    </motion.div>
  );
}
