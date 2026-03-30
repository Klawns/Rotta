"use client";

import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/query-keys";
import { QueryErrorBoundary } from "@/components/query-error-boundary";
import { DeleteUserModal } from "./components/delete-user-modal";
import { CreateUserModal } from "./components/create-user-modal";
import { useAdminDashboard } from "./_hooks/use-admin-dashboard";
import { useAdminAccess } from "./_hooks/use-admin-access";
import { useAdminDashboardState } from "./_hooks/use-admin-dashboard-state";
import { AdminStatsGrid } from "./components/admin-stats-grid";
import { RecentUsersTable } from "./components/recent-users-table";

export default function AdminDashboardPage() {
    const { user, isLoading, isAdmin } = useAdminAccess();
    const queryClient = useQueryClient();
    const state = useAdminDashboardState();

    const {
        stats,
        users,
        pagination,
        isLoadingUsers,
        isUpdatingUserPlan,
        handleDeleteUser,
        handleUpdateUserPlan,
    } = useAdminDashboard(state.currentPage, isAdmin);

    if (isLoading || !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="animate-pulse text-lg font-medium tracking-tight">
                    Validando acesso restrito...
                </div>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 fade-in"
            >
                <QueryErrorBoundary message="Não foi possível carregar as estatísticas do painel.">
                    <AdminStatsGrid stats={stats} />
                </QueryErrorBoundary>

                <div className="w-full">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <QueryErrorBoundary message="Não foi possível carregar a lista de usuários.">
                            <RecentUsersTable
                                users={users}
                                pagination={pagination}
                                currentPage={state.currentPage}
                                isLoading={isLoadingUsers}
                                isUpdatingPlan={isUpdatingUserPlan}
                                onCreateUser={state.openCreateModal}
                                onDeleteUser={state.openDeleteModal}
                                onUpdatePlan={handleUpdateUserPlan}
                                onPreviousPage={state.previousPage}
                                onNextPage={() => state.nextPage(pagination.totalPages)}
                            />
                        </QueryErrorBoundary>
                    </motion.div>
                </div>
            </motion.div>

            <CreateUserModal
                key={state.isCreateModalOpen ? "create-open" : "create-closed"}
                open={state.isCreateModalOpen}
                onOpenChange={state.setIsCreateModalOpen}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() });
                    queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
                }}
            />

            <DeleteUserModal
                key={state.userToDelete?.id ?? "delete-none"}
                user={state.userToDelete}
                open={state.isDeleteModalOpen}
                onOpenChange={state.setIsDeleteModalOpen}
                onConfirm={handleDeleteUser}
            />
        </>
    );
}
