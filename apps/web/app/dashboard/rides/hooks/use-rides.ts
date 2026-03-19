"use client";

import { useRidesFilters } from "../_hooks/use-rides-filters";
import { useRidesPagination } from "../_hooks/use-rides-pagination";
import { useRidesData } from "../_hooks/use-rides-data";
import { useRidesModals } from "../_hooks/use-rides-modals";
import { useMemo, useCallback } from "react";

/**
 * Hook principal (Facade) para o módulo de Corridas.
 * Refatorado para estabilidade de referências e performance.
 */
export function useRides() {
    const filters = useRidesFilters();
    const pagination = useRidesPagination();

    const data = useRidesData({
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters: filters.filterState,
        setTotalCount: pagination.setTotalCount
    });

    const modals = useRidesModals({
        onSuccess: data.fetchRides
    });

    // 1. Estabilização de Setters (useCallback)
    // Isso garante que as funções passadas para os componentes de filtro sejam estáveis
    const setFiltersAndReset = useCallback(<T>(setter: (val: T) => void, val: T) => {
        setter(val);
        pagination.setPage(1);
    }, [pagination.setPage]);

    const stableSetters = useMemo(() => ({
        setSearch: (s: string) => setFiltersAndReset(filters.setSearch, s),
        setStatusFilter: (s: string) => setFiltersAndReset(filters.setStatusFilter, s),
        setPaymentFilter: (p: string) => setFiltersAndReset(filters.setPaymentFilter, p),
        setClientFilter: (c: string) => setFiltersAndReset(filters.setClientFilter, c),
        setStartDate: (d: string) => setFiltersAndReset(filters.setStartDate, d),
        setEndDate: (d: string) => setFiltersAndReset(filters.setEndDate, d),
    }), [filters.setSearch, filters.setStatusFilter, filters.setPaymentFilter, filters.setClientFilter, filters.setStartDate, filters.setEndDate, setFiltersAndReset]);

    const clearFiltersExtended = useCallback(() => {
        filters.clearFilters();
        pagination.resetPagination();
    }, [filters.clearFilters, pagination.resetPagination]);

    // 2. Memoização do Retorno (Facade)
    // Separamos dados (reativos) de ações (estáveis) para minimizar re-renders em consumidores
    return useMemo(() => ({
        // Estado de Dados
        rides: data.rides,
        clients: data.clients,
        frequentClients: data.frequentClients,
        isLoading: data.isLoading,
        isFrequentLoading: data.isFrequentLoading,
        totalCount: pagination.totalCount,
        
        // Filtros (Estado Memoizado)
        filterState: filters.filterState,
        isFiltersOpen: filters.isFiltersOpen,
        hasActiveFilters: filters.hasActiveFilters,
        setIsFiltersOpen: filters.setIsFiltersOpen,
        
        // Setters Estáveis
        ...stableSetters,
        clearFilters: clearFiltersExtended,
        
        // Paginação
        page: pagination.page,
        setPage: pagination.setPage,
        pageSize: pagination.pageSize,
        
        // Modais e Estados Auxiliares
        ...modals,
        
        // Ações Exportadas
        fetchData: data.fetchRides,
        fetchFrequentClients: data.fetchFrequentClients,
        togglePaymentStatus: data.togglePaymentStatus,
    }), [data, pagination, filters, modals, stableSetters, clearFiltersExtended]);
}
