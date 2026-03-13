"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/area-restrita");
            } else if (user?.role !== "admin") {
                router.push("/dashboard");
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    if (authLoading || user?.role !== "admin") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="animate-pulse text-lg font-medium tracking-tight">Validando acesso restrito...</div>
            </div>
        );
    }

    const isSettings = pathname?.startsWith('/admin/settings');

    return (
        <div className="min-h-screen bg-[#020617] p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tighter">Painel Admin</h1>
                    <p className="text-slate-400 mt-2">Visão consolidada do Rotta</p>
                </div>

                <div className="bg-slate-900/50 p-1 rounded-2xl border border-white/5 flex gap-1">
                    <Link
                        href="/admin"
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            !isSettings ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Users size={18} />
                        Usuários
                    </Link>
                    <Link
                        href="/admin/settings"
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            isSettings ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Settings size={18} />
                        Configurações
                    </Link>
                </div>

                <Button
                    onClick={logout}
                    variant="ghost"
                    className="group bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-2xl px-6 py-6 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                            <LogOut size={18} className="text-red-500" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-white leading-none">Sair do Painel</div>
                            <div className="text-[10px] text-red-500/60 font-medium mt-0.5">Encerrar Sessão</div>
                        </div>
                    </div>
                </Button>
            </header>

            {children}
        </div>
    );
}
