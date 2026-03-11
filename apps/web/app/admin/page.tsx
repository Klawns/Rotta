"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, CreditCard, Search, ArrowUpRight, MoreHorizontal, Trash2, Settings } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { DeleteUserModal } from "./components/delete-user-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSettings } from "./components/admin-settings";

export default function AdminDashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ totalUsers: 0, activeSubscriptions: 0, revenue30d: 0 });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("users");

    // Estados para Exclusão
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/area-restrita");
            } else if (user?.role !== "admin") {
                router.push("/dashboard");
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    useEffect(() => {
        if (user?.role === "admin") {
            loadStats();
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === "admin" && activeTab === "users") {
            loadUsers(currentPage);
        }
    }, [user, currentPage, activeTab]);

    async function loadStats() {
        try {
            const { data } = await api.get("/admin/stats");
            setStats(data);
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        }
    }

    async function loadUsers(page: number) {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/admin/users/recent?page=${page}&limit=10`);
            setRecentUsers(data.data);
            setPagination(data.meta);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteUser(userId: string) {
        try {
            await api.delete(`/admin/users/${userId}`);
            // Recarrega os dados após deletar
            loadUsers(currentPage);
            loadStats();
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            throw error;
        }
    }

    if (authLoading || user?.role !== "admin") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="animate-pulse text-lg font-medium tracking-tight">Validando acesso restrito...</div>
            </div>
        );
    }

    const adminStats = [
        { label: "Total de Usuários", value: stats.totalUsers || 0, icon: Users, color: "text-blue-400" },
        { label: "Assinaturas Ativas", value: stats.activeSubscriptions || 0, icon: Shield, color: "text-emerald-400" },
        { label: "Receita (30d)", value: formatCurrency((stats.revenue30d || 0) / 100), icon: CreditCard, color: "text-violet-400" },
    ];

    return (
        <div className="min-h-screen bg-[#020617] p-8 lg:p-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tighter">Painel Admin</h1>
                    <p className="text-slate-400 mt-2">Visão consolidada do Mohamed Delivery Control</p>
                </div>

                <div className="bg-slate-900/50 p-1 rounded-2xl border border-white/5 flex gap-1">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "users" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Users size={18} />
                        Usuários
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "settings" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Settings size={18} />
                        Configurações
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === "users" ? (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-10"
                    >
                        {/* Admin Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {adminStats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card p-8 rounded-[2rem] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group"
                                >
                                    <div className={`p-4 rounded-2xl bg-white/5 w-fit ${stat.color} mb-6 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={28} />
                                    </div>
                                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-4xl font-bold text-white mt-1">{stat.value}</h3>
                                </motion.div>
                            ))}
                        </div>

                        {/* List Sections */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="xl:col-span-2 glass-card rounded-[2rem] border border-white/5 bg-slate-900/40 overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                                    <h2 className="text-xl font-bold text-white">Usuários Recentes</h2>
                                    <div className="relative group max-w-xs">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <Search size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Buscar usuário..."
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                                <th className="px-8 py-5">Usuário</th>
                                                <th className="px-8 py-5">Email</th>
                                                <th className="px-8 py-5">Plano</th>
                                                <th className="px-8 py-5 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {isLoading ? (
                                                [1, 2, 3].map(i => (
                                                    <tr key={i} className="animate-pulse">
                                                        <td colSpan={4} className="px-8 py-6 h-20 bg-white/5" />
                                                    </tr>
                                                ))
                                            ) : recentUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-10 text-center text-slate-500 italic">Nenhum usuário encontrado.</td>
                                                </tr>
                                            ) : (
                                                recentUsers.map((u: any, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-8 py-6 font-semibold text-white">{u.name}</td>
                                                        <td className="px-8 py-6 text-slate-400">{u.email}</td>
                                                        <td className="px-8 py-6">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase",
                                                                u.plan === "lifetime" ? "bg-violet-500/10 text-violet-400" :
                                                                    u.plan === "premium" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                                                            )}>
                                                                {u.plan || 'No Plan'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setUserToDelete(u);
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                    className="text-red-400 hover:text-red-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                                <button className="text-blue-400 hover:text-blue-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ArrowUpRight size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/5">
                                    <p className="text-sm text-slate-500">
                                        Mostrando <span className="text-white font-medium">{recentUsers.length}</span> de <span className="text-white font-medium">{pagination.total}</span> usuários
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1 || isLoading}
                                            className="px-5 py-2.5 rounded-xl border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900/50 transition-all font-semibold"
                                        >
                                            Anterior
                                        </button>
                                        <div className="bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 text-sm font-bold text-blue-400">
                                            {currentPage} / {pagination.totalPages}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                            disabled={currentPage === pagination.totalPages || isLoading}
                                            className="px-5 py-2.5 rounded-xl border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900/50 transition-all font-semibold"
                                        >
                                            Próximo
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Password Change */}
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-card p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-blue-600/5 to-violet-600/5 relative overflow-hidden"
                                >
                                    <h2 className="text-2xl font-bold text-white mb-2">Segurança</h2>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">Gerencie as suas credenciais de administrador.</p>
                                    <PasswordChangeForm />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <AdminSettings />
                    </motion.div>
                )}
            </AnimatePresence>

            <DeleteUserModal
                user={userToDelete}
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={handleDeleteUser}
            />
        </div>
    );
}

function PasswordChangeForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const { api } = await import("@/services/api");
            await api.patch("/auth/change-password", data);
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Erro ao alterar senha. Verifique os dados.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Senha Atual</label>
                <input
                    name="currentPassword"
                    type="password"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="••••••••"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nova Senha</label>
                <input
                    name="newPassword"
                    type="password"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="••••••••"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Confirmar Nova Senha</label>
                <input
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="••••••••"
                />
            </div>

            {message && (
                <p className={cn(
                    "text-sm font-medium p-3 rounded-xl",
                    message.type === 'success' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                )}>
                    {message.text}
                </p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
                {isLoading ? "Processando..." : "Atualizar Senha"}
            </button>
        </form>
    );
}
