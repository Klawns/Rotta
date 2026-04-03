import { Bike, SearchX } from "lucide-react";
import { HybridInfiniteList } from "@/components/ui/hybrid-infinite-list";
import { parseApiError } from "@/lib/api-error";
import { PaymentStatus, RideViewModel } from "@/types/rides";
import { RideCard } from "./ride-card";
import { RideSkeleton } from "./ride-skeleton";

interface RidesListContainerProps {
    rides: RideViewModel[];
    isLoading: boolean;
    isFetching?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    error?: unknown;
    retry?: () => void | Promise<unknown>;
    onEdit: (ride: RideViewModel) => void;
    onDelete: (ride: RideViewModel) => void;
    onChangePaymentStatus: (ride: RideViewModel, status: PaymentStatus) => void | Promise<unknown>;
    isPaymentUpdating: (rideId: string) => boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export function RidesListContainer({
    rides,
    isLoading,
    isFetching,
    hasNextPage,
    onLoadMore,
    isFetchingNextPage,
    error,
    retry,
    onEdit,
    onDelete,
    onChangePaymentStatus,
    isPaymentUpdating,
    hasActiveFilters,
    onClearFilters,
}: RidesListContainerProps) {
    const showSkeletons =
        (isLoading || (isFetching && rides.length === 0)) && !isFetchingNextPage;

    const renderContent = () => {
        if (showSkeletons) {
            return (
                <div className="flex flex-col gap-4 px-1 sm:gap-6 sm:px-2">
                    {[...Array(5)].map((_, index) => (
                        <RideSkeleton key={index} />
                    ))}
                </div>
            );
        }

        if (error && rides.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-6 rounded-[3.5rem] border border-border-subtle bg-secondary/5 py-24 shadow-inner">
                    <div className="max-w-md space-y-2 px-6 text-center">
                        <h3 className="text-2xl font-display font-extrabold tracking-tight text-text-primary">
                            Erro ao carregar corridas
                        </h3>
                        <p className="text-sm font-medium text-text-secondary opacity-70">
                            {parseApiError(
                                error,
                                "Nao foi possivel carregar o historico agora.",
                            )}
                        </p>
                    </div>
                    {retry ? (
                        <button
                            onClick={() => void retry()}
                            className="mt-2 rounded-2xl bg-button-primary px-10 py-4 text-xs font-bold uppercase tracking-widest text-button-primary-foreground shadow-xl shadow-button-shadow transition-all active:scale-95 hover:bg-button-primary-hover"
                        >
                            Tentar novamente
                        </button>
                    ) : null}
                </div>
            );
        }

        if (rides.length === 0 && !isFetching) {
            return (
                <div className="flex flex-col items-center justify-center gap-6 rounded-[3.5rem] border border-border-subtle bg-secondary/5 py-24 shadow-inner">
                    <div className="rounded-full border border-border-subtle/50 bg-secondary/10 p-8 text-text-secondary/20 shadow-sm">
                        {hasActiveFilters ? (
                            <SearchX size={56} opacity={0.3} />
                        ) : (
                            <Bike size={56} opacity={0.3} />
                        )}
                    </div>
                    <div className="space-y-2 text-center">
                        <h3 className="text-2xl font-display font-extrabold tracking-tight text-text-primary">
                            {hasActiveFilters ? "Nada encontrado" : "Tudo limpo por aqui"}
                        </h3>
                        <p className="mx-auto max-w-xs text-sm font-medium text-text-secondary opacity-70">
                            {hasActiveFilters
                                ? "Nao encontramos resultados para seus filtros atuais."
                                : "Voce ainda nao tem corridas registradas no periodo selecionado."}
                        </p>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="mt-4 rounded-2xl bg-button-primary px-10 py-4 text-xs font-bold uppercase tracking-widest text-button-primary-foreground shadow-xl shadow-button-shadow transition-all active:scale-95 hover:bg-button-primary-hover"
                        >
                            Limpar filtros e ver todos
                        </button>
                    )}
                </div>
            );
        }

        return (
            <HybridInfiniteList
                items={rides.filter(Boolean)}
                renderItem={(ride) => (
                    <RideCard
                        key={ride.id}
                        ride={ride}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onChangePaymentStatus={onChangePaymentStatus}
                        isPaymentUpdating={isPaymentUpdating(ride.id)}
                    />
                )}
                estimateSize={140}
                hasMore={!!hasNextPage}
                onLoadMore={onLoadMore || (() => {})}
                isFetchingNextPage={isFetchingNextPage}
                className="w-full scrollbar-hide"
                gap={16}
                listClassName="flex flex-col gap-4 px-1 pb-20 sm:gap-6 sm:px-2"
                maxHeight="min(68dvh, 56rem)"
                hideScrollbar={true}
                scrollBoundaryMode="handoff"
            />
        );
    };

    return (
        <section className="flex flex-col overflow-hidden rounded-[2rem] border border-border-subtle bg-card-background/20 p-1.5 shadow-inner sm:p-2">
            <div className="flex shrink-0 items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-text-muted opacity-80">
                        Atividades recentes
                    </h2>
                </div>
            </div>

            <div className="min-h-0">
                {renderContent()}
            </div>
        </section>
    );
}
