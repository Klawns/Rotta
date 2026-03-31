'use client';

import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { HybridInfiniteList } from '@/components/ui/hybrid-infinite-list';
import { PaymentComposition } from '@/components/ui/payment-composition';
import { RidePaymentAction } from '@/components/ui/ride-payment-action';
import { resolveRideDateValue } from '@/lib/date-utils';
import { type Ride } from '@/types/rides';

interface ClientRidesHistoryProps {
  rides: Ride[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onEditRide: (ride: Ride) => void;
  onDeleteRide: (ride: Ride) => void;
  onChangePaymentStatus: (
    ride: Ride,
    status: 'PAID' | 'PENDING',
  ) => void | Promise<unknown>;
  isPaymentUpdating: (rideId: string) => boolean;
}

export function ClientRidesHistory({
  rides,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  containerRef,
  onEditRide,
  onDeleteRide,
  onChangePaymentStatus,
  isPaymentUpdating,
}: ClientRidesHistoryProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text-primary">Histórico de Corridas</h3>
        <span className="text-xs font-bold text-text-secondary uppercase bg-secondary/10 px-3 py-1 rounded-full border border-border-subtle">Recentes</span>
      </div>

      <HybridInfiniteList<Ride>
        items={rides}
        estimateSize={110}
        containerRef={containerRef}
        hasMore={hasNextPage}
        onLoadMore={fetchNextPage}
        isLoading={isLoading && rides.length === 0}
        isFetchingNextPage={isFetchingNextPage}
        gap={16}
        className="pb-10"
        renderItem={(ride: Ride) => {
          const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);

          return (
            <div key={ride.id} className="flex items-center gap-4 p-5 bg-card-background/50 rounded-2xl border border-border-subtle group hover:bg-card-background transition-colors shadow-sm hover:shadow-md">
              <div className="p-3 bg-icon-info/10 rounded-xl text-icon-info border border-icon-info/10">
                <Calendar size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-text-primary truncate">ID: {String(ride.id).split("-")[0]}</h4>
                <p className="text-[10px] text-text-secondary mt-0.5 font-medium">
                  {rideDate?.toLocaleString('pt-BR') || 'Data indisponivel'}
                </p>
                <div className="flex gap-2 mt-2">
                  <RidePaymentAction
                    paymentStatus={ride.paymentStatus}
                    onChangeStatus={(status) =>
                      onChangePaymentStatus(ride, status)
                    }
                    isLoading={isPaymentUpdating(ride.id)}
                    size="xs"
                  />
                </div>
              </div>
              <div className="text-right flex flex-col items-end justify-center min-w-[80px]">
                <PaymentComposition
                  size="sm"
                  totalValue={ride.value}
                  paidWithBalance={ride.paidWithBalance}
                  debtValue={ride.debtValue}
                  showLabel={false}
                  compact={true}
                />
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bg-card-background/90 backdrop-blur-sm p-1 rounded-lg">
                <button
                  onClick={() => onEditRide(ride)}
                  className="p-2 bg-icon-info/10 hover:bg-icon-info text-icon-info hover:text-white rounded-lg transition-all active:scale-90 border border-icon-info/10"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDeleteRide(ride)}
                  className="p-2 bg-icon-destructive/10 hover:bg-icon-destructive text-icon-destructive hover:text-white rounded-lg transition-all active:scale-90 border border-icon-destructive/10"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        }}
      />
    </section>
  );
}
