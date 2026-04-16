"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, DollarSign, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectionSummaryCard } from "@/components/ui/selection-summary-card";
import { RidePreset } from "@/types/rides";
import { formatCurrency } from "@/lib/utils";
import { RideFinancialImpactNotice } from "../ride-financial-impact-notice";

const QUICK_VALUES = [10, 12, 15, 20, 25, 30];

interface StepRideDetailsProps {
    presets: RidePreset[];
    value: string;
    setValue: (v: string) => void;
    location: string;
    setLocation: (l: string) => void;
    valueSelectionMode: "picker" | "custom-edit" | "summary";
    clientName?: string;
    willReopenDebtOnSave?: boolean;
    projectedDebtValue?: number;
    handlePresetClick: (preset: RidePreset) => void;
    handleQuickValueSelection: (quickValue: number) => void;
    startCustomValueEntry: () => void;
    confirmCustomValue: () => void;
    resetValueSelection: () => void;
}

export function StepRideDetails({
    presets,
    value,
    setValue,
    location,
    setLocation,
    valueSelectionMode,
    clientName,
    willReopenDebtOnSave = false,
    projectedDebtValue = 0,
    handlePresetClick,
    handleQuickValueSelection,
    startCustomValueEntry,
    confirmCustomValue,
    resetValueSelection,
}: StepRideDetailsProps) {
    const isValueSummaryVisible =
        valueSelectionMode === "summary" && Number(value) > 0;
    const isCustomValueEditorVisible = valueSelectionMode === "custom-edit";
    const formattedValue =
        isValueSummaryVisible && Number(value) > 0
            ? formatCurrency(Number(value))
            : "";

    return (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-secondary/10 p-4 shadow-inner">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-icon-info/10 bg-icon-info/10 text-xs font-bold uppercase text-icon-info">
                    {clientName?.substring(0, 2) || "CL"}
                </div>
                <div>
                    <p className="mb-0.5 text-[9px] font-bold uppercase leading-none tracking-widest text-text-secondary opacity-70">
                        Cliente Selecionado
                    </p>
                    <p className="font-bold tracking-tight text-text-primary">
                        {clientName || "Cliente"}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2 pl-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                    <DollarSign size={12} /> Valor e LocalizaÃ§Ã£o
                </label>

                {valueSelectionMode === "picker" ? (
                    <div className="grid grid-cols-3 gap-2.5">
                        {QUICK_VALUES.map((quickValue) => {
                            const matchingPreset = presets.find(
                                (preset) => preset.value === quickValue,
                            );

                            return (
                                <button
                                    key={quickValue}
                                    type="button"
                                    onClick={() => {
                                        if (matchingPreset) {
                                            handlePresetClick(matchingPreset);
                                            return;
                                        }

                                        handleQuickValueSelection(quickValue);
                                    }}
                                    className="flex flex-col items-center justify-center rounded-2xl border border-border-subtle bg-secondary/10 p-3.5 shadow-sm transition-all group active:scale-95 hover:bg-secondary/20 hover:text-text-primary text-text-secondary"
                                >
                                    <span className="text-base font-bold">
                                        R$ {quickValue}
                                    </span>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={startCustomValueEntry}
                            className="flex flex-col items-center justify-center rounded-2xl border border-border-subtle bg-secondary/10 p-3.5 text-text-secondary shadow-sm transition-all group active:scale-95 hover:bg-secondary/20 hover:text-text-primary"
                        >
                            <span className="text-[10px] text-sm font-bold uppercase tracking-widest">
                                OUTRO
                            </span>
                        </button>
                    </div>
                ) : null}

                <div className="flex items-center gap-2 px-1">
                    <Star size={10} className="text-icon-info/50 shadow-sm" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-text-secondary opacity-70">
                        Valores e locais fixos podem ser alterados nas{" "}
                        <Link
                            href="/dashboard/settings"
                            className="text-icon-info transition-all hover:opacity-100 hover:underline"
                        >
                            ConfiguraÃ§Ãµes
                        </Link>
                    </p>
                </div>

                <AnimatePresence>
                    {isCustomValueEditorVisible ? (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="pl-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                                    Valor Personalizado
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-text-secondary opacity-50">
                                        R$
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={value}
                                        onChange={(event) => setValue(event.target.value)}
                                        placeholder="Valor Personalizado"
                                        className="w-full rounded-2xl border border-border-subtle bg-secondary/10 py-4 pl-12 pr-4 text-xl font-bold text-text-primary shadow-inner transition-all placeholder:text-text-secondary/30 focus:border-icon-info/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-2xl"
                                    onClick={resetValueSelection}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    className="rounded-2xl"
                                    onClick={confirmCustomValue}
                                    disabled={Number(value) <= 0}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <AnimatePresence>
                    {isValueSummaryVisible ? (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden space-y-4"
                        >
                            <SelectionSummaryCard
                                title={formattedValue}
                                description="Valor selecionado"
                                icon={Banknote}
                                onClick={resetValueSelection}
                                ariaLabel={`Trocar valor ${formattedValue}`}
                            />

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 pl-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                                    <MapPin size={12} className="text-icon-info" />{" "}
                                    LocalizaÃ§Ã£o da Corrida
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    placeholder="Digite a localizaÃ§Ã£o"
                                    className="w-full rounded-2xl border border-border-subtle bg-secondary/10 px-5 py-4 text-sm font-bold text-text-primary shadow-inner transition-all placeholder:text-text-secondary/30 focus:border-icon-info/50 focus:outline-none"
                                />
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {willReopenDebtOnSave ? (
                    <RideFinancialImpactNotice debtValue={projectedDebtValue} />
                ) : null}
            </div>
        </motion.div>
    );
}
