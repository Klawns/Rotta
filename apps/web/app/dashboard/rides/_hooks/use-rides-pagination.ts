"use client";

import { useState, useCallback, useMemo } from "react";

export function useRidesPagination(initialPage = 1, initialPageSize = 10) {
    const [page, setPage] = useState(initialPage);
    const [pageSize] = useState(initialPageSize);
    const [totalCount, setTotalCount] = useState(0);

    const resetPagination = useCallback(() => {
        setPage(1);
    }, []);

    return useMemo(() => ({
        page,
        setPage,
        pageSize,
        totalCount,
        setTotalCount,
        resetPagination
    }), [page, setPage, pageSize, totalCount, setTotalCount, resetPagination]);
}
