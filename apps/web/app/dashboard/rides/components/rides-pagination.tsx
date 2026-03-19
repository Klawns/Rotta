"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface RidesPaginationProps {
    page: number;
    setPage: (p: number) => void;
    totalCount: number;
    pageSize: number;
}

export function RidesPagination({ page, setPage, totalCount, pageSize }: RidesPaginationProps) {
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalCount === 0) return null;

    return (
        <div className="flex items-center justify-between bg-slate-900/40 p-4 border border-white/5 rounded-2xl">
            <p className="text-sm text-slate-500">
                Mostrando <span className="text-white font-bold">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> a <span className="text-white font-bold">{Math.min(page * pageSize, totalCount)}</span> de <span className="text-white font-bold">{totalCount}</span> corridas
            </p>
            <div className="flex gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 rounded-xl bg-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center px-4 font-bold text-white text-sm">
                    Página {page} de {totalPages}
                </div>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 rounded-xl bg-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
