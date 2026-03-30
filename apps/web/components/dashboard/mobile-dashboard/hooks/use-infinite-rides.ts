import { useInfiniteQuery } from "@tanstack/react-query";
import { ridesService } from "@/services/rides-service";
import { RidesParams } from "@/types/rides";
import { rideKeys } from "@/lib/query-keys";

interface UseInfiniteRidesOptions {
    enabled?: boolean;
}

export function useInfiniteRides(
    params: Omit<RidesParams, "cursor">,
    options?: UseInfiniteRidesOptions,
) {
    return useInfiniteQuery({
        queryKey: rideKeys.infinite(params),
        queryFn: ({ pageParam, signal }) => ridesService.getRides({ 
            ...params, 
            cursor: pageParam 
        }, signal),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) =>
            lastPage.meta?.hasNextPage ? lastPage.meta.nextCursor : undefined,
        enabled: options?.enabled,
    });
}
