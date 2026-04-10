import { adminKeys } from "@/lib/query-keys";

interface AdminDashboardInvalidationClient {
  invalidateQueries(filters: {
    queryKey: readonly unknown[];
  }): Promise<unknown>;
}

export async function invalidateAdminDashboardQueries(
  queryClient: AdminDashboardInvalidationClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() }),
    queryClient.invalidateQueries({ queryKey: adminKeys.stats() }),
  ]);
}
