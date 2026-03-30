"use client";

import React from "react";
import { InfiniteScrollTrigger } from "@/components/dashboard/mobile-dashboard/components/infinite-scroll-trigger";

interface VirtualizedInfiniteListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    estimateSize: number;
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    error?: unknown;
    retry?: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    className?: string;
    gap?: number;
    overscan?: number;
}

export function VirtualizedInfiniteList<T>({
    items,
    renderItem,
    hasMore,
    isLoading,
    onLoadMore,
    error,
    retry,
    containerRef,
    className,
    gap = 8,
}: VirtualizedInfiniteListProps<T>) {
    return (
        <div className={className}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: `${gap}px`,
                    width: "100%",
                }}
            >
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {renderItem(item, index)}
                    </React.Fragment>
                ))}
            </div>

            <InfiniteScrollTrigger
                hasMore={hasMore}
                isLoading={isLoading}
                onIntersect={onLoadMore}
                error={error}
                retry={retry}
                rootRef={containerRef}
            />
        </div>
    );
}
