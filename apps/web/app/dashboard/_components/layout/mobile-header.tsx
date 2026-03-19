"use client";

import Image from "next/image";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
    onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
    return (
        <header className="lg:hidden flex items-center justify-between p-6 bg-slate-900/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                    <Image
                        src="/assets/logo8.jpg"
                        alt="Rotta Logo"
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>
                <span className="font-bold tracking-tight uppercase italic text-white">ROTTA</span>
            </div>
            <button 
                onClick={onOpenSidebar} 
                className="p-2 bg-white/5 rounded-lg text-slate-300 active:scale-95 transition-transform"
            >
                <Menu size={20} />
            </button>
        </header>
    );
}
