import { Plus } from "lucide-react";

interface ClientHeaderProps {
    onNewClient: () => void;
}

export function ClientHeader({ onNewClient }: ClientHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Meus Clientes</h1>
                <p className="text-slate-400 mt-1">Gerencie sua base e inicie novas corridas.</p>
            </div>
            <button
                onClick={onNewClient}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
                <Plus size={20} />
                Novo Cliente
            </button>
        </header>
    );
}
