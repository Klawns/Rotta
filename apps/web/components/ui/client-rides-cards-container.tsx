"use client";

import type { ReactNode, RefObject } from "react";
import { HybridInfiniteList } from "./hybrid-infinite-list";

interface ClientRidesCardsContainerProps<T extends { id: string | number }> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  containerRef?: RefObject<HTMLElement | null>;
  estimateSize?: number;
  maxHeight?: string;
  gap?: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingNextPage?: boolean;
  error?: unknown;
  retry?: () => void;
}

export function ClientRidesCardsContainer<T extends { id: string | number }>({
  items,
  renderItem,
  containerRef,
  estimateSize = 110,
  maxHeight = "50vh",
  gap = 16,
  isLoading,
  hasMore,
  onLoadMore,
  isFetchingNextPage,
  error,
  retry,
}: ClientRidesCardsContainerProps<T>) {
  return (
    <HybridInfiniteList<T>
      items={items}
      renderItem={renderItem}
      estimateSize={estimateSize}
      containerRef={containerRef}
      hasMore={!!hasMore}
      onLoadMore={onLoadMore || (() => {})}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      error={error}
      retry={retry}
      maxHeight={containerRef ? undefined : maxHeight}
      gap={gap}
      hideScrollbar={true}
      className="h-full w-full pb-10"
    />
  );
}
