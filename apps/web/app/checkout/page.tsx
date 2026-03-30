"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TaxDataModal } from "./_components/tax-data-modal";
import { useCheckout } from "./_hooks/use-checkout";

function CheckoutContent() {
    const {
        error,
        selectedPlan,
        isCreatingCheckout,
        showTaxModal,
        setShowTaxModal,
        retry,
        goToDashboard,
        submitTaxData,
    } = useCheckout();

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full text-center space-y-8 relative z-10">
                {!error ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto relative" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {selectedPlan ? `Assinando ${selectedPlan.name}` : "Preparando checkout..."}
                            </h1>
                            <p className="text-slate-400 text-lg">
                                {selectedPlan
                                    ? `Total: ${formatCurrency(selectedPlan.price / 100)}${selectedPlan.interval || ""}`
                                    : "Aguarde um momento..."}
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm shadow-2xl">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {isCreatingCheckout
                                    ? "Finalizando sua solicitação..."
                                    : "Aguarde enquanto preparamos seus dados para uma transação 100% segura."}
                            </p>
                        </div>

                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                            Ambiente Criptografado & Seguro
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/5 border border-red-500/20 p-10 rounded-[2.5rem] space-y-6 backdrop-blur-xl shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <span className="text-red-500 text-2xl font-bold">!</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">Ops! Tivemos um problema</h1>
                            <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={retry}
                                className="w-full bg-white text-black h-14 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                            >
                                Tentar Novamente
                            </button>
                            <button
                                onClick={goToDashboard}
                                className="w-full text-slate-500 hover:text-white text-sm font-medium transition-colors"
                            >
                                Ir para o Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <TaxDataModal
                isOpen={showTaxModal}
                onOpenChange={setShowTaxModal}
                onSubmit={submitTaxData}
                isLoading={isCreatingCheckout}
            />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
