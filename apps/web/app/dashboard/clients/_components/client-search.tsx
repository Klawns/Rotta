"use client";

import { Search } from "lucide-react";

interface ClientSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export function ClientSearch({ value, onChange }: ClientSearchProps) {
    return (
        <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-400 transition-colors text-slate-500">
                <Search size={20} />
            </div>
            <input
                type="text"
                placeholder="Buscar por nome do cliente..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
        </div>
    );
}
