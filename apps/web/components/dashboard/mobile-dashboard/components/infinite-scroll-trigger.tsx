"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollTriggerProps {
    onIntersect: () => void;
    hasMore: boolean;
    isLoading: boolean;
    error?: unknown;
    retry?: () => void;
    rootRef?: React.RefObject<HTMLElement | null>;
}

export function InfiniteScrollTrigger({
    onIntersect,
    hasMore,
    isLoading,
    error,
    retry,
    rootRef,
}: InfiniteScrollTriggerProps) {
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef?.current || null;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !error) {
                    onIntersect();
                }
            },
            { 
                threshold: 0.1,
                root,
                rootMargin: '100px' // Margem para carregar um pouco antes de chegar ao fim
            }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [onIntersect, hasMore, isLoading, error, rootRef]);

    if (error) {
        return (
            <div className="flex flex-col items-center gap-2 p-4">
                <p className="text-sm text-destructive">Erro ao carregar mais itens</p>
                <button 
                    onClick={retry}
                    className="text-xs font-medium text-primary hover:underline"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!hasMore && !isLoading) return null;

    return (
        <div
            ref={observerTarget}
            className="flex h-20 justify-center p-6"
            data-infinite-scroll-trigger="true"
            data-has-more={hasMore ? "true" : "false"}
            data-loading={isLoading ? "true" : "false"}
        >
            {isLoading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
        </div>
    );
}
