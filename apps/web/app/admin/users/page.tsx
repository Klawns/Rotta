'use client';

import { motion } from 'framer-motion';

import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { QueryErrorState } from '@/components/query-error-state';
import { CreateUserModal } from '../components/create-user-modal';
import { DeleteUserModal } from '../components/delete-user-modal';
import { RecentUsersTable } from '../components/recent-users-table';
import { AdminPage, AdminPageHeader } from '../_components/admin-ui';
import { useAdminUsers } from './_hooks/use-admin-users';
import { useAdminUsersState } from './_hooks/use-admin-users-state';

export default function AdminUsersPage() {
  const state = useAdminUsersState();
  const {
    users,
    pagination,
    usersError,
    isUsersPending,
    refetchUsers,
    isUpdatingUserPlan,
    handleUpdateUserPlan,
  } = useAdminUsers(state.currentPage);

  const resolvedUsers = users ?? [];
  const resolvedPagination = pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fade-in"
      >
        <AdminPage>
          <AdminPageHeader
            badge="Usuarios"
            title="Gestao administrativa de usuarios"
            description="Listagem paginada com criacao, exclusao e troca de plano sem misturar a visao geral do painel."
          />

          <QueryErrorBoundary message="Nao foi possivel carregar a lista de usuarios.">
            {usersError && !users ? (
              <QueryErrorState
                error={usersError}
                title="Nao foi possivel carregar a lista de usuarios"
                onRetry={() => {
                  void refetchUsers();
                }}
              />
            ) : (
              <div className="space-y-4">
                {usersError ? (
                  <QueryErrorState
                    error={usersError}
                    title="Falha ao atualizar a lista de usuarios"
                    description="Os dados em cache foram mantidos, mas a ultima consulta falhou."
                    onRetry={() => {
                      void refetchUsers();
                    }}
                  />
                ) : null}

                <RecentUsersTable
                  users={resolvedUsers}
                  pagination={resolvedPagination}
                  currentPage={state.currentPage}
                  isLoading={isUsersPending}
                  isUpdatingPlan={isUpdatingUserPlan}
                  onCreateUser={state.openCreateModal}
                  onDeleteUser={state.openDeleteModal}
                  onUpdatePlan={handleUpdateUserPlan}
                  onPreviousPage={state.previousPage}
                  onNextPage={() =>
                    state.nextPage(resolvedPagination.totalPages)
                  }
                />
              </div>
            )}
          </QueryErrorBoundary>
        </AdminPage>
      </motion.div>

      <CreateUserModal
        open={state.isCreateModalOpen}
        onOpenChange={state.setIsCreateModalOpen}
      />

      <DeleteUserModal
        user={state.userToDelete}
        open={state.isDeleteModalOpen}
        onOpenChange={state.setIsDeleteModalOpen}
      />
    </>
  );
}
