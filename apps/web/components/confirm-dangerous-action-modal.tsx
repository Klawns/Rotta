"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ConfirmDangerousActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  requiredText?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDangerousActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  requiredText = "RESTAURAR",
  confirmText = "Confirmar restauração",
  cancelText = "Cancelar",
  isLoading = false,
}: ConfirmDangerousActionModalProps) {
  const [inputValue, setInputValue] = useState("");
  const dialogKey = `${requiredText}-${isOpen ? "open" : "closed"}`;
  const isMatch =
    inputValue.trim().toUpperCase() === requiredText.toUpperCase();

  const handleConfirm = (event: React.MouseEvent) => {
    event.preventDefault();

    if (isMatch && !isLoading) {
      onConfirm();
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        key={dialogKey}
        className="max-w-xl rounded-[2.5rem] border border-destructive/15 bg-modal-background/95 p-8 shadow-2xl shadow-destructive/10 backdrop-blur-xl sm:p-10"
      >
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-inner">
              <AlertTriangle size={22} />
            </div>
            <AlertDialogTitle className="text-[1.75rem] font-display font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
              {title}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="max-w-[32rem] text-[15px] font-medium leading-7 text-text-secondary/90">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-8 space-y-4">
          <div className="rounded-[1.75rem] border border-destructive/15 bg-destructive/[0.04] p-5">
            <p className="text-sm font-medium leading-6 text-text-secondary">
              Para continuar, digite{" "}
              <span className="font-semibold text-destructive">
                &quot;{requiredText}&quot;
              </span>{" "}
              no campo abaixo.
            </p>
          </div>
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={requiredText}
            autoFocus
            className="h-14 rounded-2xl border border-border-subtle bg-background/60 px-5 text-base font-semibold tracking-[0.02em] text-text-primary shadow-inner transition-all placeholder:text-text-muted/50 focus:border-destructive/35 focus:ring-destructive/20"
            disabled={isLoading}
          />
        </div>

        <AlertDialogFooter className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:justify-start">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isLoading}
            className="h-12 w-full rounded-2xl border border-border-subtle bg-secondary/10 px-6 text-sm font-semibold text-text-primary shadow-sm transition-all hover:bg-secondary/15 active:scale-[0.98] sm:w-auto sm:min-w-[132px]"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isMatch || isLoading}
            className={cn(
              "relative h-12 w-full overflow-hidden rounded-2xl px-6 text-sm font-semibold tracking-[0.01em] shadow-lg transition-all active:scale-[0.98] sm:w-auto sm:min-w-[188px]",
              isMatch
                ? "bg-destructive text-white shadow-destructive/20 hover:bg-destructive/90"
                : "cursor-not-allowed border border-border-subtle bg-muted/80 text-muted-foreground shadow-none",
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span>Processando...</span>
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
