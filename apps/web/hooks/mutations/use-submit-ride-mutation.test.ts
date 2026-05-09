import assert from "node:assert/strict";
import test from "node:test";

import { authKeys, clientKeys, financeKeys, rideKeys } from "@/lib/query-keys";
import {
  getAffectedRideUpsertClientIds,
  invalidateRideCachesAfterUpsert,
} from "./use-submit-ride-mutation";

test("builds unique affected client ids after ride upsert", () => {
  assert.deepEqual(
    getAffectedRideUpsertClientIds({
      rideClientId: "client-1",
      selectedClientId: "client-2",
      previousClientId: "client-1",
    }),
    ["client-1", "client-2"],
  );
});

test("invalidates specific ride, finance, auth, and client caches after ride upsert", async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient: Parameters<typeof invalidateRideCachesAfterUpsert>[0] = {
    invalidateQueries: async (filters) => {
      if (filters?.queryKey) {
        invalidated.push(filters.queryKey);
      }
    },
  };

  await invalidateRideCachesAfterUpsert(queryClient, ["client-1", "client-2"]);

  assert.deepEqual(invalidated, [
    rideKeys.lists(),
    [...rideKeys.all, "stats"],
    rideKeys.frequentClients(),
    financeKeys.all,
    authKeys.user(),
    clientKeys.detail("client-1"),
    clientKeys.balance("client-1"),
    clientKeys.payments("client-1"),
    clientKeys.detail("client-2"),
    clientKeys.balance("client-2"),
    clientKeys.payments("client-2"),
  ]);
});
