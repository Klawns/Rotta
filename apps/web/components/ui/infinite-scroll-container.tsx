"use client";

import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InfiniteScrollContainerProps {
    children: ReactNode;
    className?: string;
    maxHeight?: string;
    hideScrollbar?: boolean;
    style?: React.CSSProperties;
    qaId?: string;
}

/**
 * Container para listagens com Infinite Scroll.
 * 
 * Resolve o problema de crescimento vertical ilimitado, mantendo a altura
 * fixa/máxima e permitindo scroll interno.
 */
export const InfiniteScrollContainer = forwardRef<HTMLDivElement, InfiniteScrollContainerProps>(
    ({ children, className, maxHeight, hideScrollbar = false, style, qaId }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "min-h-0 overflow-y-auto overscroll-contain px-1 -mx-1 scroll-smooth",
                    !hideScrollbar && "custom-scrollbar",
                    hideScrollbar && "scrollbar-hide",
                    className
                )}
                data-scroll-container="true"
                data-qa={qaId}
                style={{ 
                    ...(maxHeight ? { maxHeight } : null),
                    WebkitOverflowScrolling: 'touch', // Suave no iOS
                    ...style
                }}
            >
                {children}
            </div>
        );
    }
);

InfiniteScrollContainer.displayName = "InfiniteScrollContainer";
