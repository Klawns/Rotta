"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, User, Bike, ChevronRight, X, Calendar, Trash2, Star } from "lucide-react";
import { api } from "@/services/api";
import { formatCurrency, cn } from "@/lib/utils";
import { RideModal } from "@/components/ride-modal";
import { ClientModal } from "@/components/client-modal";
import { useAuth } from "@/hooks/use-auth";

interface Client {
    id: string;
    name: string;
    userId: string;
    isPinned: boolean;
    createdAt: string;
}

interface Ride {
    id: string;
    clientId: string;
    value: number;
    notes?: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID';
    rideDate?: string;
    createdAt: string;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [rides, setRides] = useState<Ride[]>([]);
    const [isAddingClient, setIsAddingClient] = useState(false);
    const [isRideModalOpen, setIsRideModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // Client List Pagination
    const [clientPage, setClientPage] = useState(1);
    const [clientTotal, setClientTotal] = useState(0);
    const clientLimit = 9;

    // Ride History Pagination
    const [ridePage, setRidePage] = useState(1);
    const [rideTotal, setRideTotal] = useState(0);
    const rideLimit = 5;

    useEffect(() => {
        if (user) {
            fetchClients();
        } else {
            setIsLoading(false);
        }
    }, [clientPage, search, user]);

    useEffect(() => {
        if (selectedClient) {
            setRidePage(1);
            fetchRides(selectedClient.id, 1);
        }
    }, [selectedClient]);

    useEffect(() => {
        if (selectedClient && ridePage > 1) {
            fetchRides(selectedClient.id, ridePage);
        }
    }, [ridePage]);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("limit", clientLimit.toString());
            params.append("offset", ((clientPage - 1) * clientLimit).toString());
            if (search) params.append("search", search);

            const { data } = await api.get(`/clients?${params.toString()}`);
            setClients(data.clients || []);
            setClientTotal(data.total || 0);
        } catch (err) {
            console.error("Erro ao buscar clientes", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRides = async (clientId: string, page: number) => {
        try {
            const params = new URLSearchParams();
            params.append("limit", rideLimit.toString());
            params.append("offset", ((page - 1) * rideLimit).toString());

            const { data } = await api.get(`/rides/client/${clientId}?${params.toString()}`);

            // If it's the first page, replace results, otherwise append? 
            // Better to replace for clean pagination
            setRides(data.rides || []);
            setRideTotal(data.total || 0);
        } catch (err) {
            console.error("Erro ao buscar corridas", err);
        }
    };

    const handleEditClient = (client: Client) => {
        setClientToEdit(client);
        setIsClientModalOpen(true);
    };

    const handleNewClient = () => {
        setClientToEdit(null);
        setIsClientModalOpen(true);
    };

    const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;

        try {
            await api.post("/clients", { name });
            setIsAddingClient(false);
            fetchClients();
        } catch (err) {
            alert("Erro ao criar cliente");
        }
    };


    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Meus Clientes</h1>
                    <p className="text-slate-400 mt-1">Gerencie sua base e inicie novas corridas.</p>
                </div>
                <button
                    onClick={handleNewClient}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={20} />
                    Novo Cliente
                </button>
            </header>

            <div className="relative group max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-400 transition-colors text-slate-500">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nome do cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clients.map((client) => (
                            <motion.div
                                key={client.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleEditClient(client)}
                                className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-4 bg-white/5 rounded-2xl text-slate-300 group-hover:scale-110 transition-transform">
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-lg truncate">{client.name}</h3>
                                        <p className="text-sm text-slate-500">Clique para ver detalhes</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    await api.patch(`/clients/${client.id}`, { isPinned: !client.isPinned });
                                                    fetchClients();
                                                } catch (err) {
                                                    alert("Erro ao fixar cliente");
                                                }
                                            }}
                                            className={cn(
                                                "p-3 rounded-xl transition-all active:scale-90",
                                                client.isPinned
                                                    ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white shadow-lg shadow-amber-500/20"
                                                    : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white"
                                            )}
                                            title={client.isPinned ? "Desafixar" : "Fixar"}
                                        >
                                            <Star size={18} className={cn(client.isPinned && "fill-amber-500 hover:fill-white")} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedClient(client);
                                                setIsRideModalOpen(true);
                                            }}
                                            className="p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all active:scale-90 shadow-lg shadow-blue-600/0 hover:shadow-blue-600/20"
                                            title="Nova Corrida Rápida"
                                        >
                                            <Bike size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedClient(client);
                                            }}
                                            className="p-3 hover:bg-white/5 rounded-xl text-slate-600 hover:text-white transition-all group/arrow"
                                            title="Ver Histórico"
                                        >
                                            <ChevronRight className="group-hover/arrow:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Controles de Paginação (Clientes) */}
                    {clientTotal > clientLimit && (
                        <div className="flex items-center justify-between mt-10 px-2">
                            <p className="text-sm text-slate-500 font-medium">
                                <span className="text-white">{(clientPage - 1) * clientLimit + 1}</span>-
                                <span className="text-white">{Math.min(clientPage * clientLimit, clientTotal)}</span> de <span className="text-white">{clientTotal}</span> clientes
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={clientPage === 1}
                                    onClick={() => { setClientPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Anterior
                                </button>
                                <button
                                    disabled={clientPage * clientLimit >= clientTotal}
                                    onClick={() => { setClientPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Drawer de Detalhes do Cliente */}
            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClient(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-[#020617] border-l border-white/10 w-full max-w-xl relative z-10 shadow-2xl h-screen overflow-y-auto"
                        >
                            <div className="p-8 lg:p-12 space-y-10">
                                <header className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white tracking-tight">{selectedClient.name}</h2>
                                            <p className="text-slate-500">ID: {selectedClient.id.split("-")[0]}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedClient(null)}
                                        className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </header>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsRideModalOpen(true)}
                                        className="flex flex-col items-center gap-2 p-6 bg-blue-600 hover:bg-blue-500 rounded-[2rem] text-white transition-all group shadow-xl shadow-blue-600/20 active:scale-95"
                                    >
                                        <Bike size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-bold">Nova Corrida</span>
                                    </button>
                                    <button
                                        className="flex flex-col items-center gap-2 p-6 bg-white/5 hover:bg-red-500/10 rounded-[2rem] text-slate-400 hover:text-red-400 border border-white/5 transition-all group active:scale-95"
                                    >
                                        <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-bold">Excluir</span>
                                    </button>
                                </div>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white">Histórico de Corridas</h3>
                                        <span className="text-xs font-bold text-slate-500 uppercase bg-white/5 px-3 py-1 rounded-full">{rides.length} totais</span>
                                    </div>

                                    <div className="space-y-4">
                                        {rides.length === 0 ? (
                                            <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-3xl">
                                                <p className="text-slate-500 text-sm">Nenhuma corrida registrada para este cliente.</p>
                                            </div>
                                        ) : (
                                            <>
                                                {rides.map((ride) => (
                                                    <div key={ride.id} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                                            <Calendar size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-white truncate">ID: {ride.id.split("-")[0]}</h4>
                                                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(ride.rideDate || ride.createdAt).toLocaleString()}</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <span className={cn(
                                                                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                                                    ride.status === 'COMPLETED' ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                                                                )}>
                                                                    {ride.status === 'COMPLETED' ? 'OK' : 'Pendente'}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                                                    ride.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                                                )}>
                                                                    {ride.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-extrabold text-white text-lg">{formatCurrency(ride.value)}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {rideTotal > rideLimit && (
                                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                            Página <span className="text-white">{ridePage}</span> de <span className="text-white">{Math.ceil(rideTotal / rideLimit)}</span>
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                disabled={ridePage === 1}
                                                                onClick={() => setRidePage(p => p - 1)}
                                                                className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                Anterior
                                                            </button>
                                                            <button
                                                                disabled={ridePage * rideLimit >= rideTotal}
                                                                onClick={() => setRidePage(p => p + 1)}
                                                                className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                Próxima
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <RideModal
                isOpen={isRideModalOpen}
                onClose={() => setIsRideModalOpen(false)}
                onSuccess={() => selectedClient && fetchRides(selectedClient.id, ridePage)}
                clientId={selectedClient?.id}
                clientName={selectedClient?.name}
            />
            <ClientModal
                isOpen={isClientModalOpen}
                onClose={() => {
                    setIsClientModalOpen(false);
                    setClientToEdit(null);
                }}
                onSuccess={fetchClients}
                clientToEdit={clientToEdit || undefined}
            />
        </div>
    );
}
