'use client';

import { useState } from 'react';

import { type AdminRecentUser } from '@/types/admin';

export function useAdminUsersState() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminRecentUser | null>(null);

  const openCreateModal = () => setIsCreateModalOpen(true);

  const openDeleteModal = (user: AdminRecentUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = (open: boolean) => {
    setIsDeleteModalOpen(open);

    if (!open) {
      setUserToDelete(null);
    }
  };

  const previousPage = () => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  };

  const nextPage = (totalPages: number) => {
    setCurrentPage((previous) => Math.min(totalPages, previous + 1));
  };

  return {
    currentPage,
    isDeleteModalOpen,
    setIsDeleteModalOpen: closeDeleteModal,
    isCreateModalOpen,
    setIsCreateModalOpen,
    userToDelete,
    openCreateModal,
    openDeleteModal,
    previousPage,
    nextPage,
  };
}
