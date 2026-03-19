"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/hooks/use-auth";
import { MenuItem } from "../../_hooks/use-sidebar-state";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User | null;
    menuItems: MenuItem[];
    logout: () => void;
}

export function Sidebar({ isOpen, setIsOpen, user, menuItems, logout }: SidebarProps) {
    const pathname = usePathname();

    const handleMenuClick = () => {
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={cn(
                    "fixed lg:relative inset-y-0 left-0 z-50 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 transition-all duration-500 ease-in-out overflow-hidden flex flex-col",
                    isOpen ? "w-72 translate-x-0" : "w-0 lg:w-24 -translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full p-6 min-w-[18rem] lg:min-w-0">
                    <div className="flex items-center justify-between mb-10 overflow-hidden h-12">
                        <AnimatePresence mode="wait">
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex items-center gap-3 shrink-0"
                                >
                                    <div className="relative w-10 h-10 shrink-0">
                                        <Image
                                            src="/assets/logo8.jpg"
                                            alt="Rotta Logo"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                    <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap italic">Rotta App</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white bg-white/5 active:scale-90",
                                !isOpen && "hidden lg:flex"
                            )}
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={handleMenuClick}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group active:scale-95",
                                    pathname === item.href && "bg-white/5 text-white shadow-inner",
                                    !isOpen && "lg:justify-center lg:px-0"
                                )}
                                title={!isOpen ? item.label : ""}
                            >
                                <item.icon size={22} className={cn(item.color, "shrink-0")} />
                                {isOpen && (
                                    <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                                )}
                            </Link>
                        ))}

                        {user?.subscription?.plan === 'starter' && user?.subscription?.status === 'active' && isOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Link
                                    href="/pricing"
                                    onClick={handleMenuClick}
                                    className="mx-4 mt-6 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
                                >
                                    <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                                    Fazer Upgrade
                                </Link>
                            </motion.div>
                        )}
                    </nav>

                    <div className="pt-6 border-t border-white/5 mt-auto">
                        <div className={cn("flex items-center gap-3 px-4 py-3 mb-4", !isOpen && "lg:justify-center lg:px-0")}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center font-bold text-sm shrink-0">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {isOpen && (
                                <div className="overflow-hidden">
                                    <p className="font-semibold truncate">{user?.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-slate-500 truncate leading-none">{user?.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={logout}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all group",
                                !isOpen && "lg:justify-center lg:px-0"
                            )}
                            title={!isOpen ? "Sair" : ""}
                        >
                            <LogOut size={20} className="shrink-0" />
                            {isOpen && <span className="font-medium">Sair</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
