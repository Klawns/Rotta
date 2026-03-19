"use client";

import Link from "next/link";

interface StatusBannersProps {
    isExpired: boolean;
    isExpiringSoon: boolean;
}

export function StatusBanners({ isExpired, isExpiringSoon }: StatusBannersProps) {
    return (
        <>
            {isExpired && (
                <div className="bg-red-600 text-white px-6 py-2 text-center text-sm font-bold flex items-center justify-center gap-4 sticky top-0 z-[60]">
                    <span>Sua assinatura expirou!</span>
                    <Link href="/dashboard/checkout?plan=premium" className="bg-white text-red-600 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0">
                        Renovar Agora
                    </Link>
                </div>
            )}

            {isExpiringSoon && (
                <div className="bg-amber-500 text-slate-900 px-6 py-2 text-center text-sm font-bold flex items-center justify-center gap-4 sticky top-0 z-[60]">
                    <span>Sua assinatura vence em breve.</span>
                    <Link href="/dashboard/checkout?plan=premium" className="bg-slate-900 text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0">
                        Pagar R$ 5,00
                    </Link>
                </div>
            )}
        </>
    );
}
