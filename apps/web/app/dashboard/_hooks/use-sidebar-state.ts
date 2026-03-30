"use client";

import { useState } from "react";
import { LayoutDashboard, Users, Bike, Wallet, Settings, Sparkles, Shield, LucideIcon } from "lucide-react";
import { User } from "@/hooks/use-auth";
import { getFreeTrialState } from "@/services/free-trial-service";

export interface MenuItem {
    icon: LucideIcon;
    label: string;
    color: string;
    href: string;
    roles: string[];
    disabled?: boolean;
}

const ALL_MENU_ITEMS: MenuItem[] = [
    { icon: LayoutDashboard, label: "Visão Geral", color: "text-icon-info", href: "/dashboard", roles: ["user"] },
    { icon: Users, label: "Clientes", color: "text-icon-success", href: "/dashboard/clients", roles: ["user"] },
    { icon: Bike, label: "Corridas", color: "text-icon-brand", href: "/dashboard/rides", roles: ["user"] },
    { icon: Wallet, label: "Financeiro", color: "text-icon-warning", href: "/dashboard/finance", roles: ["user"] },
    { icon: Settings, label: "Configurações", color: "text-icon-brand", href: "/dashboard/settings", roles: ["user"] },
    { icon: Sparkles, label: "Tutorial", color: "text-icon-brand", href: "/dashboard/tutorial", roles: ["user"] },
    { icon: Shield, label: "Administração", color: "text-icon-destructive", href: "/admin", roles: ["admin"] },
];

/**
 * Hook especializado para gerenciar o estado da Sidebar e itens de menu.
 */
export function useSidebarState(user: User | null) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const trial = getFreeTrialState(user);

    const filteredMenuItems = ALL_MENU_ITEMS.filter(item => {
        return item.roles.includes(user?.role || "user");
    }).map((item) => ({
        ...item,
        disabled: Boolean(
            user?.role === 'user' &&
            trial.shouldLockFeatures &&
            item.href !== '/dashboard' &&
            item.href !== '/dashboard/settings',
        ),
    }));

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
