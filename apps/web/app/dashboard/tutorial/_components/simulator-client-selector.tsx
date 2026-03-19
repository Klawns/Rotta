"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Client {
    name: string;
}

interface SimulatorClientSelectorProps {
    onSelect: (client: Client) => void;
    clients: Client[];
    onAddClient: (name: string) => void;
}

export function SimulatorClientSelector({ onSelect, clients, onAddClient }: SimulatorClientSelectorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");

    const handleAdd = () => {
        if (name) {
            onAddClient(name);
            setName("");
            setIsAdding(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Selecione o Cliente</h4>
                <div className="h-0.5 flex-1 mx-4 bg-white/5 rounded-full" />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {clients.map((c) => (
                    <button
                        key={c.name}
                        onClick={() => onSelect(c)}
                        className="p-3 md:p-4 bg-slate-800 border border-white/5 rounded-xl md:rounded-2xl text-left hover:border-blue-500/50 transition-all group"
                    >
                        <p className="text-white font-bold text-sm md:text-base group-hover:text-blue-400 transition-colors uppercase truncate">{c.name}</p>
                    </button>
                ))}

                {isAdding ? (
                    <div className="col-span-1 xs:col-span-2 flex gap-2">
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Nome..."
                            className="bg-slate-950 border-white/10 h-11 text-sm"
                            autoFocus
                        />
                        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 font-bold px-4 h-11">Add</Button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-3 md:p-4 border-2 border-dashed border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-all"
                    >
                        <Plus size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
