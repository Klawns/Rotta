"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Bike, LogOut, ChevronRight, Menu, X, Wallet, Shield, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TutorialModal } from "@/components/dashboard/tutorial-modal";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { StarterLimitPopup } from "@/components/dashboard/starter-limit-popup";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading, isAuthenticated, updateUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        // Redireciona o admin para fora do dashboard do sistema
        if (!isLoading && isAuthenticated && user?.role === 'admin') {
            router.push("/admin");
            return;
        }

        // BLOQUEIO: Se não tem plano pago ativo, vai para a página de precificação
        if (!isLoading && isAuthenticated && user?.role === 'user') {
            const isStarter = user?.subscription?.plan === 'starter';
            const hasPaidPlan = user?.subscription?.plan === 'premium' || user?.subscription?.plan === 'lifetime';
            const isActive = user?.subscription?.status === 'active' || user?.subscription?.status === 'trial';
            const rideCount = user?.subscription?.rideCount || 0;

            const reachedLimit = isStarter && rideCount >= 20;

            // Bloqueia se:
            // 1. Atingiu o limite do Starter
            // 2. Não tem plano algum e não é Starter
            // 3. Status não é active/trial
            const shouldBlock = reachedLimit || (!hasPaidPlan && !isStarter) || !isActive;

            if (shouldBlock && pathname.startsWith('/dashboard') && pathname !== '/dashboard/payment-success') {
                console.log('[AccessGate] Bloqueando acesso - Redirecionando para /pricing', { plan: user?.subscription?.plan, rideCount, status: user?.subscription?.status });
                router.push("/pricing?reason=limit_reached");
            }
        }
    }, [isLoading, isAuthenticated, user, router, pathname]);

    useEffect(() => {
        // O tutorial só deve abrir se:
        // 1. O usuário não viu ainda
        // 2. O usuário é um usuário comum (não admin)
        // 3. O usuário tem um plano ativo (pagamento confirmado ou free selecionado)
        if (!isLoading && user && !user.hasSeenTutorial && user.role === 'user') {
            const hasActivePlan = user.subscription?.status === 'active' || user.subscription?.status === 'trial';
            if (hasActivePlan) {
                setIsTutorialOpen(true);
            }
        }
    }, [isLoading, user]);

    async function handleCloseTutorial() {
        setIsTutorialOpen(false);
        try {
            await api.patch("/settings/tutorial-seen");
            updateUser({ ...user, hasSeenTutorial: true } as any);
        } catch (err) {
            console.error("Erro ao marcar tutorial como visto", err);
        }
    }

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const menuItems = [
        { icon: LayoutDashboard, label: "Visão Geral", color: "text-blue-400", href: "/dashboard", roles: ["user"] },
        { icon: Users, label: "Clientes", color: "text-emerald-400", href: "/dashboard/clients", roles: ["user"] },
        { icon: Bike, label: "Corridas", color: "text-violet-400", href: "/dashboard/rides", roles: ["user"] },
        { icon: Wallet, label: "Financeiro", color: "text-amber-400", href: "/dashboard/finance", roles: ["user"] },
        { icon: Settings, label: "Configurações", color: "text-slate-400", href: "/dashboard/settings", roles: ["user"] },
        { icon: Sparkles, label: "Tutorial", color: "text-violet-400", href: "/dashboard/tutorial", roles: ["user"] },
        { icon: Shield, label: "Administração", color: "text-red-400", href: "/admin", roles: ["admin"] },
    ]

        // Antigo filter logic aqui (simplificado para brevidade no diff se possível, mas manterei fiel ao original)
        .filter(item => {
            const hasRole = item.roles.includes(user?.role || "user");
            if (user?.role === 'user' && user.subscription?.status === 'expired' && item.href !== '/dashboard' && item.href !== '/dashboard/settings') {
                return false;
            }
            return hasRole;
        });

    const isExpired = user?.role === 'user' && user.subscription?.status === 'expired';
    const isExpiringSoon = user?.role === 'user' && !isExpired && user.subscription?.validUntil && (
        (new Date(user.subscription.validUntil).getTime() - new Date().getTime()) < 5 * 24 * 60 * 60 * 1000
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex">
            {/* Tutorial Popup Component */}
            <TutorialModal isOpen={isTutorialOpen} onClose={handleCloseTutorial} />

            {/* Starter Limit Popup */}
            {user?.subscription?.plan === 'starter' && user?.subscription?.status === 'active' && (
                <StarterLimitPopup rideCount={user.subscription.rideCount || 0} />
            )}

            {/* Sidebar Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-20"
                )}
            >
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center justify-between mb-10">
                        <div className={cn("flex items-center gap-3 transition-opacity", !isSidebarOpen && "lg:opacity-0")}>
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">M</div>
                            <span className="font-bold text-xl tracking-tight">MDC App</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group active:scale-95"
                            >
                                <item.icon size={22} className={item.color} />
                                {isSidebarOpen && (
                                    <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                                )}
                            </Link>
                        ))}

                        {/* Upgrade Button for Starter Users */}
                        {user?.subscription?.plan === 'starter' && user?.subscription?.status === 'active' && isSidebarOpen && (
                            <Link
                                href="/pricing"
                                onClick={() => setIsSidebarOpen(false)}
                                className="mx-4 mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-lime-500 text-black font-black text-xs uppercase tracking-widest hover:bg-lime-400 transition-all shadow-lg shadow-lime-500/20 active:scale-95 group"
                            >
                                <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                                Fazer Upgrade
                            </Link>
                        )}

                        {isExpired && isSidebarOpen && (
                            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-4">
                                <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Acesso Bloqueado</p>
                                <p className="text-xs text-slate-400 leading-tight">Sua assinatura expirou. Renove para continuar.</p>
                                <Link href="/checkout?plan=premium" onClick={() => setIsSidebarOpen(false)} className="text-xs text-white font-bold mt-2 inline-block hover:underline">Renovar agora →</Link>
                            </div>
                        )}
                    </nav>

                    <div className="pt-6 border-t border-white/5">
                        <div className={cn("flex items-center gap-3 px-4 py-3 mb-4", !isSidebarOpen && "lg:justify-center")}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {isSidebarOpen && (
                                <div className="overflow-hidden">
                                    <p className="font-semibold truncate">{user?.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-slate-500 truncate leading-none">{user?.email}</p>
                                        {user?.subscription?.plan && (
                                            <span className={cn(
                                                "text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter leading-none shadow-sm",
                                                user.subscription.plan === 'premium' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                                    user.subscription.plan === 'lifetime' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                                        "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                            )}>
                                                {user.subscription.plan}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all group"
                        >
                            <LogOut size={20} />
                            {isSidebarOpen && <span className="font-medium">Sair</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto">
                {isExpired && (
                    <div className="bg-red-600 text-white px-6 py-2 text-center text-sm font-bold flex items-center justify-center gap-4 sticky top-0 z-[60]">
                        <span>Sua assinatura expirou! Os recursos premium foram desabilitados.</span>
                        <Link href="/dashboard/checkout?plan=premium" className="bg-white text-red-600 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                            Renovar Agora
                        </Link>
                    </div>
                )}

                {isExpiringSoon && (
                    <div className="bg-amber-500 text-slate-900 px-6 py-2 text-center text-sm font-bold flex items-center justify-center gap-4 sticky top-0 z-[60]">
                        <span>Atenção: Sua assinatura vence em menos de 5 dias. Não perca o acesso!</span>
                        <Link href="/dashboard/checkout?plan=premium" className="bg-slate-900 text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors">
                            Renovar por R$ 5,00
                        </Link>
                    </div>
                )}

                {/* Topbar Mobile */}
                <header className="lg:hidden flex items-center justify-between p-6 bg-slate-900/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">M</div>
                        <span className="font-bold">MDC</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg">
                        <Menu size={20} />
                    </button>
                </header>

                <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
