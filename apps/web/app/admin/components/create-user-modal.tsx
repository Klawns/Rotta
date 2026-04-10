"use client";

import { useCreateUserDialog } from "../_hooks/use-create-user-dialog";
import { CreateUserModalView } from "./create-user-modal-view";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const dialog = useCreateUserDialog({
    open,
    onOpenChange,
  });

  return <CreateUserModalView dialog={dialog} />;
}
