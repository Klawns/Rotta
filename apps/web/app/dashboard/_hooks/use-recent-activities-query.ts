"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { rideKeys } from "@/lib/query-keys";
import { ridesService } from "@/services/rides-service";

interface RecentActivitiesQueryFilters {
    limit: number;
    startDate: string;
}

export function useRecentActivitiesQuery(
    filters: RecentActivitiesQueryFilters,
    enabled: boolean,
) {
    return useInfiniteQuery({
        queryKey: rideKeys.infinite({ ...filters, dashboard: true }),
        queryFn: ({ pageParam, signal }) =>
            ridesService.getRides(
                {
                    ...filters,
                    cursor: pageParam as string | undefined,
                },
                signal,
            ),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) =>
            lastPage.meta?.hasNextPage ? lastPage.meta.nextCursor : undefined,
        enabled,
        staleTime: 60000,
    });
}
