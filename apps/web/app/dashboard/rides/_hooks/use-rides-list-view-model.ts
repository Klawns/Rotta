"use client";

import { useMemo } from "react";
import {
  buildRidesListPresenter,
  type BuildRidesListPresenterParams,
} from "../_mappers/rides-list.presenter";

export function useRidesListViewModel(params: BuildRidesListPresenterParams) {
  const {
    rides,
    totalCount,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    hasActiveFilters,
    scope,
    now,
  } = params;

  return useMemo(
    () =>
      buildRidesListPresenter({
        rides,
        totalCount,
        isLoading,
        isFetching,
        isFetchingNextPage,
        error,
        hasActiveFilters,
        scope,
        now,
      }),
    [
      error,
      hasActiveFilters,
      isFetching,
      isFetchingNextPage,
      isLoading,
      now,
      rides,
      scope,
      totalCount,
    ],
  );
}
