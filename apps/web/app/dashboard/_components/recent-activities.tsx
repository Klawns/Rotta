"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";
import { HybridInfiniteList } from "@/components/ui/hybrid-infinite-list";
import { Ride } from "@/types/rides";
import { useRecentActivities } from "../_hooks/use-recent-activities";
import { RecentActivityItem } from "./recent-activity-item";

interface RecentActivitiesProps {
    period: "today" | "week";
    onEditRide: (ride: Ride) => void;
    onDeleteRide: (ride: Ride) => void;
}

export function RecentActivities({
    period,
    onEditRide,
    onDeleteRide,
}: RecentActivitiesProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const recentActivities = useRecentActivities({ period });

    if (recentActivities.isInitialLoading) {
        return <RecentActivitiesSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex h-[540px] flex-col overflow-hidden rounded-3xl border border-border-subtle bg-card-background p-8 shadow-sm"
        >
            <RecentActivitiesHeader period={period} />

            <div className="relative min-h-0 flex-1 -mx-2">
                {recentActivities.rides.length === 0 ? (
                    <EmptyRecentActivities period={period} />
                ) : (
                    <InfiniteScrollContainer
                        ref={scrollContainerRef}
                        maxHeight="400px"
                        hideScrollbar={true}
                        className="w-full px-2"
                    >
                        <HybridInfiniteList
                            items={recentActivities.rides}
                            renderItem={(ride: Ride) => (
                                <RecentActivityItem
                                    key={ride.id}
                                    ride={ride}
                                    onEditRide={onEditRide}
                                    onDeleteRide={onDeleteRide}
                                    onTogglePaymentStatus={recentActivities.togglePaymentStatus}
                                />
                            )}
                            estimateSize={88}
                            containerRef={scrollContainerRef}
                            hasMore={recentActivities.hasNextPage}
                            onLoadMore={recentActivities.fetchNextPage}
                            isFetchingNextPage={recentActivities.isFetchingNextPage}
                        />
                    </InfiniteScrollContainer>
                )}
            </div>
        </motion.div>
    );
}

function RecentActivitiesHeader({ period }: { period: "today" | "week" }) {
    return (
        <div className="mb-8 flex flex-shrink-0 items-center justify-between">
            <div className="flex flex-col">
                <h2 className="text-xl font-black leading-none tracking-tight text-text-primary">
                    Atividades Recentes
                </h2>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60">
                    {period === "today" ? "Hoje" : "Esta Semana"}
                </span>
            </div>
            <Link
                href="/dashboard/rides"
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-icon-brand transition-colors hover:text-icon-brand/80"
            >
                Ver histórico <ChevronRight size={14} />
            </Link>
        </div>
    );
}

function RecentActivitiesSkeleton() {
    return (
        <div className="flex h-[540px] flex-col rounded-3xl border border-border-subtle bg-card-background p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight text-text-primary">
                    Atividades Recentes
                </h2>
            </div>
            <div className="flex flex-1 flex-col space-y-6">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-20 animate-pulse rounded-2xl bg-secondary/10"
                    />
                ))}
            </div>
        </div>
    );
}

function EmptyRecentActivities({ period }: { period: "today" | "week" }) {
    return (
        <p className="px-4 py-20 text-center text-sm font-medium italic text-text-secondary">
            {period === "today"
                ? "Nenhuma atividade registrada hoje."
                : "Nenhuma atividade registrada nesta semana."}
        </p>
    );
}
