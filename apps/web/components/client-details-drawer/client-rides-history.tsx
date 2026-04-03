"use client";

import type { RefObject } from "react";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { ClientRidesCardsContainer } from "@/components/ui/client-rides-cards-container";
import { PaymentComposition } from "@/components/ui/payment-composition";
import { RidePaymentAction } from "@/components/ui/ride-payment-action";
import { resolveRideDateValue } from "@/lib/date-utils";
import { type RideViewModel } from "@/types/rides";

interface ClientRidesHistoryProps {
  rides: RideViewModel[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  containerRef?: RefObject<HTMLElement | null>;
  onEditRide: (ride: RideViewModel) => void;
  onDeleteRide: (ride: RideViewModel) => void;
  onChangePaymentStatus: (
    ride: RideViewModel,
    status: "PAID" | "PENDING",
  ) => void | Promise<unknown>;
  isPaymentUpdating: (rideId: string) => boolean;
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-border-subtle bg-card-background/40 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/30" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-secondary/30" />
                <div className="h-3 w-24 rounded bg-secondary/20" />
              </div>
            </div>
            <div className="h-8 w-20 rounded bg-secondary/20" />
          </div>
          <div className="mt-4 h-8 w-full rounded-xl bg-secondary/20" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-[1.75rem] border border-dashed border-border-subtle bg-card-background/40 p-8 text-center">
      <div className="max-w-xs space-y-2">
        <p className="text-base font-semibold text-text-primary">
          O historico ainda esta vazio.
        </p>
        <p className="text-sm text-text-secondary">
          Use a acao Nova corrida para adicionar o primeiro registro deste
          cliente.
        </p>
      </div>
    </div>
  );
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
  const rideCountLabel =
    rides.length === 1
      ? "1 corrida carregada"
      : `${rides.length} corridas carregadas`;

  const ridesList = (
    <ClientRidesCardsContainer<RideViewModel>
      items={rides}
      containerRef={containerRef}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={(ride: RideViewModel) => {
        const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);
        const formattedDate = rideDate
          ? rideDate.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Data indisponivel";
        const formattedTime = rideDate
          ? rideDate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null;
        const shortId = String(ride.id).split("-")[0];

        return (
          <div
            key={ride.id}
            className="rounded-2xl border border-border-subtle bg-card-background/55 p-4 shadow-sm transition-colors hover:bg-card-background"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="rounded-xl border border-icon-info/10 bg-icon-info/10 p-3 text-icon-info">
                  <Calendar size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate font-semibold text-text-primary">
                    {formattedDate}
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary">
                    {formattedTime ? `${formattedTime} - ` : ""}
                    ID {shortId}
                  </p>
                  {ride.location ? (
                    <p className="mt-2 line-clamp-1 text-sm text-text-secondary">
                      {ride.location}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end justify-center text-right">
                <PaymentComposition
                  size="sm"
                  totalValue={ride.value}
                  paidWithBalance={ride.paidWithBalance}
                  debtValue={ride.debtValue}
                  showLabel={false}
                  compact={true}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
              <RidePaymentAction
                paymentStatus={ride.paymentStatus}
                onChangeStatus={(status) => onChangePaymentStatus(ride, status)}
                isLoading={isPaymentUpdating(ride.id)}
                size="xs"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditRide(ride)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-secondary/10 px-3 py-2 text-xs font-semibold text-text-secondary transition-all hover:bg-secondary/15 hover:text-text-primary active:scale-95"
                  title="Editar corrida"
                >
                  <Pencil size={14} />
                  Editar
                </button>
                <button
                  onClick={() => onDeleteRide(ride)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-destructive/15 bg-button-destructive-subtle px-3 py-2 text-xs font-semibold text-icon-destructive transition-all hover:bg-button-destructive-subtle/80 active:scale-95"
                  title="Excluir corrida"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        );
      }}
    />
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary">
            Historico de corridas
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {rides.length === 0 && !isLoading
              ? "Nenhuma corrida registrada para este cliente."
              : rideCountLabel}
          </p>
        </div>
        {hasNextPage ? (
          <span className="rounded-full border border-border-subtle bg-secondary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
            Mais registros ao rolar
          </span>
        ) : null}
      </div>

      {isLoading && rides.length === 0 ? <LoadingState /> : null}
      {!isLoading && rides.length === 0 ? <EmptyState /> : null}
      {rides.length > 0 ? ridesList : null}
    </section>
  );
}
