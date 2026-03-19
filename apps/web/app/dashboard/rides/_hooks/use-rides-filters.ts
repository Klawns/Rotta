"use client";

import { useState, useCallback, useMemo } from "react";
import { RidesFilterState } from "../types";

export function useRidesFilters() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");
    const [clientFilter, setClientFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const hasActiveFilters = 
        statusFilter !== "all" || 
        paymentFilter !== "all" || 
        clientFilter !== "all" || 
        startDate !== "" || 
        endDate !== "" || 
        search !== "";

    const clearFilters = useCallback(() => {
        setStatusFilter("all");
        setPaymentFilter("all");
        setClientFilter("all");
        setStartDate("");
        setEndDate("");
    }, []);

    const filterState = useMemo((): RidesFilterState => ({
        search,
        statusFilter,
        paymentFilter,
        clientFilter,
        startDate,
        endDate
    }), [search, statusFilter, paymentFilter, clientFilter, startDate, endDate]);

    return {
        filterState,
        setSearch,
        setStatusFilter,
        setPaymentFilter,
        setClientFilter,
        setStartDate,
        setEndDate,
        isFiltersOpen,
        setIsFiltersOpen,
        hasActiveFilters,
        clearFilters
    };
}
