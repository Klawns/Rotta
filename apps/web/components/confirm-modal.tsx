"use client";

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
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "success";
  isLoading?: boolean;
}

export function getConfirmModalActionClassName(
  variant: NonNullable<ConfirmModalProps['variant']>,
) {
  if (variant === 'danger') {
    return 'bg-button-destructive text-button-destructive-foreground shadow-destructive/20 hover:bg-button-destructive-hover';
  }

  if (variant === 'success') {
    return 'bg-success text-success-foreground shadow-success/20 hover:bg-success/90';
  }

  return 'bg-button-primary text-button-primary-foreground shadow-button-shadow hover:bg-button-primary-hover';
}

export function getConfirmModalToneClassName(
  variant: NonNullable<ConfirmModalProps['variant']>,
) {
  if (variant === 'danger') {
    return {
      content:
        'border-border-destructive/25 shadow-destructive/10',
      title: 'text-icon-destructive',
      description: 'text-icon-destructive/80',
    };
  }

  if (variant === 'success') {
    return {
      content: 'border-success/20 bg-success/5 shadow-success/10',
      title: 'text-success',
      description: 'text-success/80',
    };
  }

  return {
    content: 'border-border-subtle/80',
    title: 'text-text-primary',
    description: 'text-text-secondary/90',
  };
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  const toneClassName = getConfirmModalToneClassName(variant);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        className={cn(
          'rounded-[2.5rem] border bg-modal-background/95 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-10',
          toneClassName.content,
        )}
      >
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle
            className={cn(
              'max-w-[24rem] text-[1.75rem] font-display font-bold leading-tight tracking-tight sm:text-3xl',
              toneClassName.title,
            )}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={cn(
              'max-w-[31rem] text-[15px] font-medium leading-7',
              toneClassName.description,
            )}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 flex gap-3 sm:mt-9 sm:justify-start">
          <AlertDialogCancel
            onClick={onClose}
            className="h-12 rounded-2xl border border-border-subtle bg-secondary/10 px-6 text-sm font-semibold text-text-primary shadow-sm transition-all hover:bg-secondary/15 active:scale-[0.98] sm:min-w-[132px]"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              "h-12 rounded-2xl px-6 text-sm font-semibold tracking-[0.01em] shadow-lg transition-all active:scale-[0.98] disabled:cursor-wait sm:min-w-[168px]",
              getConfirmModalActionClassName(variant),
            )}
          >
            {isLoading ? "Processando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
