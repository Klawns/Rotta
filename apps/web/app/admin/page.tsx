"use client";

import { motion } from "framer-motion";
import { QueryErrorBoundary } from "@/components/query-error-boundary";
import { QueryErrorState } from "@/components/query-error-state";
import { DeleteUserModal } from "./components/delete-user-modal";
import { CreateUserModal } from "./components/create-user-modal";
import { useAdminDashboard } from "./_hooks/use-admin-dashboard";
import { useAdminDashboardState } from "./_hooks/use-admin-dashboard-state";
import { AdminStatsGrid } from "./components/admin-stats-grid";
import { RecentUsersTable } from "./components/recent-users-table";
import { AdminCard, AdminPage, AdminPageHeader } from "./_components/admin-ui";

export default function AdminDashboardPage() {
  const state = useAdminDashboardState();

  const {
    stats,
    users,
    pagination,
    statsError,
    usersError,
    isStatsPending,
    isUsersPending,
    refetchStats,
    refetchUsers,
    isUpdatingUserPlan,
    handleUpdateUserPlan,
  } = useAdminDashboard(state.currentPage);

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
            badge="Painel"
            title="Operacao administrativa"
            description="Resumo atual da base e gestao manual de usuarios sem duplicar auth, loading ou error fora do shell."
          />

          <QueryErrorBoundary message="Nao foi possivel carregar as estatisticas do painel.">
            {statsError && !stats ? (
              <QueryErrorState
                error={statsError}
                title="Nao foi possivel carregar as estatisticas do painel"
                onRetry={() => {
                  void refetchStats();
                }}
              />
            ) : (
              <div className="space-y-4">
                {statsError ? (
                  <QueryErrorState
                    error={statsError}
                    title="Falha ao atualizar as estatisticas"
                    description="Os dados em cache foram mantidos, mas a ultima atualizacao falhou."
                    onRetry={() => {
                      void refetchStats();
                    }}
                  />
                ) : null}

                {stats ? <AdminStatsGrid stats={stats} /> : null}

                {isStatsPending && !stats ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                      <AdminCard
                        key={item}
                        className="h-40 animate-pulse border-dashed bg-white/60"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </QueryErrorBoundary>

          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
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
            </motion.div>
          </div>
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
