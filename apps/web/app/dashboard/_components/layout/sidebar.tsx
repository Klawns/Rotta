"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@/hooks/use-auth";
import { MenuItem } from "../../_hooks/use-sidebar-state";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarFooter } from "./sidebar-footer";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User | null;
    menuItems: MenuItem[];
    logout: () => void;
}

export function Sidebar({ isOpen, setIsOpen, user, menuItems, logout }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "hidden fixed inset-y-0 left-0 z-[70] bg-sidebar-background backdrop-blur-xl border-r border-sidebar-border overflow-hidden lg:flex lg:flex-col transition-all duration-500 ease-in-out",
                isOpen ? "lg:w-72" : "lg:w-[88px]"
            )}
        >
            <div
                className={cn(
                    'flex h-full flex-col lg:min-w-0',
                    isOpen ? 'min-w-[18rem] p-6' : 'px-2 py-4',
                )}
            >
                <SidebarBrand
                    isOpen={isOpen}
                    onToggle={() => setIsOpen(!isOpen)}
                    onClose={() => setIsOpen(false)}
                />

                <SidebarNavigation
                    isOpen={isOpen}
                    pathname={pathname}
                    menuItems={menuItems}
                    user={user}
                    onItemClick={() => undefined}
                />

                <SidebarFooter
                    isOpen={isOpen}
                    user={user}
                    onLogout={logout}
                />
            </div>
        </aside>
    );
}
