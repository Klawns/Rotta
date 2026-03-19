"use client";

import { useState } from "react";
import { LayoutDashboard, Users, Bike, Wallet, Settings, Sparkles, Shield, LucideIcon } from "lucide-react";
import { User } from "@/hooks/use-auth";

export interface MenuItem {
    icon: LucideIcon;
    label: string;
    color: string;
    href: string;
    roles: string[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
    { icon: LayoutDashboard, label: "Visão Geral", color: "text-blue-400", href: "/dashboard", roles: ["user"] },
    { icon: Users, label: "Clientes", color: "text-emerald-400", href: "/dashboard/clients", roles: ["user"] },
    { icon: Bike, label: "Corridas", color: "text-violet-400", href: "/dashboard/rides", roles: ["user"] },
    { icon: Wallet, label: "Financeiro", color: "text-amber-400", href: "/dashboard/finance", roles: ["user"] },
    { icon: Settings, label: "Configurações", color: "text-slate-400", href: "/dashboard/settings", roles: ["user"] },
    { icon: Sparkles, label: "Tutorial", color: "text-violet-400", href: "/dashboard/tutorial", roles: ["user"] },
    { icon: Shield, label: "Administração", color: "text-red-400", href: "/admin", roles: ["admin"] },
];

/**
 * Hook especializado para gerenciar o estado da Sidebar e itens de menu.
 */
export function useSidebarState(user: User | null) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filteredMenuItems = ALL_MENU_ITEMS.filter(item => {
        const hasRole = item.roles.includes(user?.role || "user");
        
        // Regra adicional: se expirado, bloqueia acesso a quase tudo exceto Dashboard e Config
        if (user?.role === 'user' && user.subscription?.status === 'expired') {
            return hasRole && (item.href === '/dashboard' || item.href === '/dashboard/settings');
        }
        
        return hasRole;
    });

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    return {
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        closeSidebar,
        menuItems: filteredMenuItems
    };
}
