"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ConfirmDangerousActionModal } from "@/components/confirm-dangerous-action-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getBackupImportCardPresentation } from "../../_mappers/backup-import.presenter";
import type { BackupImportJobResponse } from "@/types/backups";
import { BackupImportProgressStep } from "./backup-import-progress-step";
import { BackupImportReviewStep } from "./backup-import-review-step";
import { BackupImportUploadStep } from "./backup-import-upload-step";

interface BackupImportCardProps {
  preview: BackupImportJobResponse | null;
  isPreviewing: boolean;
  isExecuting: boolean;
  onPreview: (file: File) => Promise<unknown>;
  onExecute: (importJobId: string) => Promise<unknown>;
}

export function BackupImportCard({
  preview,
  isPreviewing,
  isExecuting,
  onPreview,
  onExecute,
}: BackupImportCardProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const presentation = getBackupImportCardPresentation({
    preview,
    selectedFileName,
    isOpen,
    isExecuting,
    currentUserId: user?.id,
    currentUserName: user?.name,
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFileName(file.name);

    try {
      await onPreview(file);
    } catch {
      setSelectedFileName(null);
    } finally {
      event.target.value = "";
    }
  };

  const handleExecute = async () => {
    if (!preview) {
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!preview) {
      return;
    }

    try {
      await onExecute(preview.id);
      setIsConfirmModalOpen(false);
      setIsOpen(false);
      setSelectedFileName(null);
    } catch {
      // The mutation layer already shows a toast; keep the modal open for retry.
    }
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-destructive/20 bg-destructive/5 transition-colors">
      <button
        onClick={() => {
          if (!presentation.canToggle) {
            return;
          }

          setIsOpen((current) => !current);
        }}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-destructive/10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-destructive">
              Restaurar sistema a partir de um backup
            </h3>
            <p className="mt-0.5 text-sm font-medium text-destructive/80">
              Operação de alto risco. Destrói os dados atuais.
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-destructive transition-transform duration-300 ${
            presentation.isExpanded ? "-rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {presentation.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-destructive/20 p-6 pt-2">
              <div className="mb-6 space-y-2">
                <p className="max-w-3xl text-sm leading-6 text-foreground/80">
                  A restauração irá{" "}
                  <strong className="font-bold text-destructive">
                    apagar todos os dados atuais da sua operação
                  </strong>{" "}
                  e substituí-los pelo conteúdo do backup selecionado.
                  Certifique-se de que ninguém está utilizando o sistema durante
                  este processo.
                </p>
              </div>

              <div className="space-y-6">
                <BackupImportUploadStep
                  step={presentation.step}
                  displayedFileName={presentation.displayedFileName}
                  isPreviewing={isPreviewing}
                  isExecuting={isExecuting}
                  fileInputRef={fileInputRef}
                  onFileChange={handleFileChange}
                  onPickFile={() => fileInputRef.current?.click()}
                />

                <BackupImportReviewStep
                  step={presentation.step}
                  preview={preview}
                  ownerDisplayName={presentation.ownerDisplayName}
                  createdAtLabel={presentation.createdAtLabel}
                  isExecuting={isExecuting}
                  executeButtonLabel={presentation.executeButtonLabel}
                  onExecute={() => void handleExecute()}
                />

                {isExecuting && (
                  <>
                    <BackupImportProgressStep
                      stepNumber={3}
                      title="3. Gerando backup de segurança"
                      description="O estado atual do sistema está sendo salvo antes da restauração."
                      executionPhase={presentation.executionPhase}
                    />

                    <BackupImportProgressStep
                      stepNumber={4}
                      title="4. Importando dados do backup"
                      description="Depois do backup de segurança, os dados do arquivo são aplicados no sistema."
                      executionPhase={presentation.executionPhase}
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDangerousActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmRestore}
        isLoading={isExecuting}
        title="Restaurar backup"
        description="Antes de restaurar, será gerado um backup de segurança do estado atual. Depois disso, os dados atuais serão apagados e substituídos pelo conteúdo deste backup. Esta ação é irreversível."
        requiredText="RESTAURAR"
      />
    </div>
  );
}
