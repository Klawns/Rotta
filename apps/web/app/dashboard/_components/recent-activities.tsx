"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRecentActivities } from "../_hooks/use-recent-activities";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";
import { HybridInfiniteList } from "@/components/ui/hybrid-infinite-list";
import { PaymentComposition } from "@/components/ui/payment-composition";
import { useRef } from "react";
import { Ride } from "@/types/rides";

interface RecentActivitiesProps {
    period: 'today' | 'week';
    onEditRide: (ride: Ride) => void;
    onDeleteRide: (ride: Ride) => void;
}

export function RecentActivities({
    period,
    onEditRide,
    onDeleteRide
}: RecentActivitiesProps) {
    const { 
        rides, 
        isLoading, 
        hasNextPage, 
        fetchNextPage, 
        isFetchingNextPage,
        togglePaymentStatus 
    } = useRecentActivities({ period });
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (isLoading && rides.length === 0) {
        return (
            <div className="p-8 rounded-3xl border border-border-subtle bg-card-background h-[540px] flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-text-primary tracking-tight">Atividades Recentes</h2>
                </div>
                <div className="space-y-6 flex-1 flex flex-col">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-secondary/10 animate-pulse rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-3xl border border-border-subtle bg-card-background h-[540px] flex flex-col overflow-hidden shadow-sm"
        >
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-text-primary tracking-tight leading-none">Atividades Recentes</h2>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2 opacity-60">
                        {period === 'today' ? 'Hoje' : 'Esta Semana'}
                    </span>
                </div>
                <Link href="/dashboard/rides" className="text-sm text-icon-brand hover:text-icon-brand/80 font-bold flex items-center gap-1 transition-colors uppercase tracking-widest text-[10px]">
                    Ver histórico <ChevronRight size={14} />
                </Link>
            </div>

            <div className="flex-1 min-h-0 relative -mx-2">
                {rides.length === 0 ? (
                    <p className="text-text-secondary text-center py-20 text-sm italic font-medium px-4">Nenhuma atividade registrada no período.</p>
                ) : (
                    <InfiniteScrollContainer 
                        ref={scrollContainerRef}
                        maxHeight="400px"
                        hideScrollbar={true}
                        className="w-full px-2"
                    >
                        <HybridInfiniteList
                            items={rides}
                            renderItem={(ride: Ride) => (
                                <div
                                    key={ride.id}
                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-hover-accent transition-all border border-transparent hover:border-border-subtle group mb-4 relative"
                                >
                                    <div className="p-3 rounded-xl bg-icon-info/10 text-icon-info border border-icon-info/10 group-hover:bg-icon-info/20">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-text-primary truncate tracking-tight">ID: {ride.id?.split("-")[0] || "---"}</h4>
                                        <p className="text-[10px] text-text-secondary mt-0.5 font-bold uppercase tracking-wider">{new Date(ride.rideDate || ride.createdAt).toLocaleString()}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-right flex flex-col items-end">
                                            <PaymentComposition 
                                                size="sm"
                                                totalValue={ride.value}
                                                paidWithBalance={ride.paidWithBalance}
                                                debtValue={ride.debtValue}
                                                compact={true}
                                                showLabel={false}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePaymentStatus(ride);
                                                }}
                                                className={cn(
                                                    "text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full text-center block w-fit mt-1 border transition-all",
                                                    ride.paymentStatus === 'PAID'
                                                        ? "text-icon-success bg-icon-success/10 border-icon-success/10 hover:bg-icon-success/20"
                                                        : "text-icon-warning bg-icon-warning/10 border-icon-warning/10 hover:bg-icon-warning/20"
                                                )}
                                            >
                                                {ride.paymentStatus === 'PAID' ? "Pago" : "Pendente"}
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 absolute right-4 bg-card-background/90 backdrop-blur-sm p-1 rounded-xl border border-border-subtle shadow-lg">
                                            <button
                                                onClick={() => onEditRide(ride)}
                                                className="p-2 bg-icon-info/5 hover:bg-icon-info text-icon-info hover:text-white rounded-lg transition-all active:scale-90 border border-icon-info/10"
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteRide(ride)}
                                                className="p-2 bg-icon-destructive/5 hover:bg-icon-destructive text-icon-destructive hover:text-white rounded-lg transition-all active:scale-90 border border-icon-destructive/10"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            estimateSize={88}
                            containerRef={scrollContainerRef}
                            hasMore={!!hasNextPage}
                            onLoadMore={fetchNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                        />
                    </InfiniteScrollContainer>
                )}
            </div>
        </motion.div>
    );
}
