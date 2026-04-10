import assert from "node:assert/strict";
import test from "node:test";

import { adminKeys } from "../../../lib/query-keys";
import { invalidateAdminDashboardQueries } from "./admin-dashboard-query-cache";

test("invalidates admin users and stats queries together", async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient = {
    invalidateQueries: async ({
      queryKey,
    }: {
      queryKey: readonly unknown[];
    }) => {
      invalidated.push(queryKey);
    },
  };

  await invalidateAdminDashboardQueries(queryClient);

  assert.deepEqual(invalidated, [adminKeys.usersAll(), adminKeys.stats()]);
});

test("attempts both invalidations before surfacing an error", async () => {
  const attempted: Array<readonly unknown[]> = [];
  const queryClient = {
    invalidateQueries: ({ queryKey }: { queryKey: readonly unknown[] }) => {
      attempted.push(queryKey);

      if (JSON.stringify(queryKey) === JSON.stringify(adminKeys.stats())) {
        return Promise.reject(new Error("stats invalidation failed"));
      }

      return Promise.resolve();
    },
  };

  await assert.rejects(
    () => invalidateAdminDashboardQueries(queryClient),
    /stats invalidation failed/,
  );

  assert.deepEqual(attempted, [adminKeys.usersAll(), adminKeys.stats()]);
});
