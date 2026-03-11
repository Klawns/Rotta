"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings,
    Plus,
    Trash2,
    Save,
    MapPin,
    DollarSign,
    Tag,
    Info,
    CheckCircle2,
    Pencil
} from "lucide-react";
import { api } from "@/services/api";
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const { toast } = useToast();
    const [presets, setPresets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Edit Preset States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<any>(null);
    const [editValue, setEditValue] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // New Preset Form
    const [newPreset, setNewPreset] = useState({
        value: "",
        location: ""
    });

    useEffect(() => {
        loadPresets();
    }, []);

    async function loadPresets() {
        try {
            const { data } = await api.get("/settings/ride-presets");
            setPresets(data);
        } catch (err) {
            console.error("Erro ao carregar presets", err);
            toast({
                title: "Erro ao carregar",
                description: "Não foi possível carregar seus atalhos.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddPreset() {
        if (!newPreset.value || !newPreset.location) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha valor e localidade.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            const { data } = await api.post("/settings/ride-presets", {
                ...newPreset,
                label: newPreset.location, // Usar localização como etiqueta técnica se necessário, ou remover do body se a API permitir
                value: Number(newPreset.value)
            });
            setPresets(prev => [...prev, data]);
            setNewPreset({ value: "", location: "" });
            toast({
                title: "Atalho adicionado! 🚀",
                description: "Seu novo botão já está disponível no painel mobile.",
            });
        } catch (err) {
            toast({
                title: "Erro ao adicionar",
                description: "Tente novamente mais tarde.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeletePreset(id: string) {
        try {
            await api.delete(`/settings/ride-presets/${id}`);
            setPresets(prev => prev.filter(p => p.id !== id));
            toast({
                title: "Atalho removido",
                description: "O botão foi excluído com sucesso.",
            });
        } catch (err) {
            toast({
                title: "Erro ao remover",
                description: "Tente novamente mais tarde.",
                variant: "destructive"
            });
        }
    }

    function handleOpenEdit(preset: any) {
        setEditingPreset(preset);
        setEditValue(preset.value.toString());
        setEditLocation(preset.location);
        setIsEditModalOpen(true);
    }

    async function handleUpdatePreset() {
        if (!editingPreset) return;
        setIsUpdating(true);
        try {
            const { data } = await api.patch(`/settings/ride-presets/${editingPreset.id}`, {
                label: editLocation, // Persistir localização como etiqueta para compatibilidade técnica
                value: Number(editValue),
                location: editLocation
            });

            setPresets(prev => prev.map(p => p.id === data.id ? data : p));
            toast({ title: "Atalho atualizado! ✏️" });
            setIsEditModalOpen(false);
        } catch (err) {
            toast({ title: "Erro ao atualizar", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                        <Settings size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
                </div>
                <p className="text-slate-400">Personalize seu fluxo de trabalho e atalhos de faturamento.</p>
            </header>

            {/* Quick Pricing Buttons Section */}
            <section className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40 space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <DollarSign size={20} className="text-blue-400" />
                        Atalhos de Corrida
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Estes botões aparecerão na sua tela principal no celular para registros rápidos.
                    </p>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Criar Novo Atalho</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 font-bold ml-1">VALOR (R$)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={newPreset.value}
                                    onChange={e => setNewPreset(prev => ({ ...prev, value: e.target.value }))}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 font-bold ml-1">LOCALIDADE (DESCRIÇÃO DO BOTÃO)</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Ex: Centro"
                                    value={newPreset.location}
                                    onChange={e => setNewPreset(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleAddPreset}
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl mt-2 shadow-lg shadow-blue-600/20"
                    >
                        {isSaving ? "Adicionando..." : "Adicionar Atalho à Grid"}
                    </Button>
                </div>

                {/* List of Existing Presets */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        Seus Atalhos Ativos
                        <span className="bg-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full">{presets.length}</span>
                    </h3>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : presets.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Info className="mx-auto text-slate-600 mb-2" />
                            <p className="text-slate-500 italic text-sm">Nenhum atalhos configurado. Crie o primeiro acima!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {presets.map((preset) => (
                                    <motion.div
                                        key={preset.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => handleOpenEdit(preset)}
                                        className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-all border-l-4 border-l-blue-500 cursor-pointer"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black text-white">{formatCurrency(preset.value)}</span>
                                            </div>
                                            <p className="text-xs text-slate-300 font-bold flex items-center gap-1 uppercase tracking-wider">
                                                <MapPin size={12} className="text-blue-400" /> {preset.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-3 text-white bg-blue-600/20 hover:bg-blue-600/40 rounded-xl transition-all border border-blue-500/20"
                                                title="Editar"
                                            >
                                                <Pencil size={18} className="text-blue-400" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeletePreset(preset.id);
                                                }}
                                                className="p-3 text-white bg-red-600/20 hover:bg-red-600/40 rounded-xl transition-all border border-red-500/20"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} className="text-red-400" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {/* Help / Tips */}
            <div className="flex items-start gap-4 p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20">
                <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-white text-sm">Dica Pro</h4>
                    <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                        Organize seus atalhos por distância ou região. Por exemplo, crie um atalho "CENTRO" com valor R$ 15,00
                        e outro "AIRPORT" com valor R$ 80,00. Isso agiliza seu dia a dia em até 80%!
                    </p>
                </div>
            </div>

            {/* Modal de Edição de Atalho */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] w-[95%] max-w-sm mx-auto p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                            <Pencil size={20} className="text-blue-400" />
                            Editar Atalho
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-6 border-y border-white/5 my-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor Sugerido (R$)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                                <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="bg-slate-950 border-white/10 h-12 pl-12 rounded-xl focus:ring-blue-500 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Localidade Padrão</Label>
                            <Input
                                value={editLocation}
                                onChange={(e) => setEditLocation(e.target.value)}
                                className="bg-slate-950 border-white/10 h-12 rounded-xl focus:ring-blue-500"
                                placeholder="Ex: Centro, Bairro..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-row gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 h-12 rounded-xl text-slate-500 font-bold hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdatePreset}
                            disabled={isUpdating}
                            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20"
                        >
                            {isUpdating ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
