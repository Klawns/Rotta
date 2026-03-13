"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Rocket, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentSuccessPage() {
    const router = useRouter();
    const { user, verify } = useAuth();
    const [status, setStatus] = useState<'verifying' | 'success' | 'delay' | 'error'>('verifying');
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function checkPaymentStatus() {
            try {
                const refreshedUser = await verify();

                if (!isMounted) return;

                // Se o plano não for mais starter e estiver ativo, sucesso!
                if (refreshedUser?.subscription?.plan !== 'starter' && refreshedUser?.subscription?.status === 'active') {
                    setStatus('success');
                    return;
                }

                // Se ainda for starter, incrementa tentativas
                if (attempts < 5) {
                    setAttempts(prev => prev + 1);
                    setTimeout(checkPaymentStatus, 3000);
                } else {
                    setStatus('delay');
                }
            } catch (err) {
                console.error("Erro ao verificar status:", err);
                if (isMounted) setStatus('error');
            }
        }

        const initialTimeout = setTimeout(checkPaymentStatus, 2000);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
        };
    }, [attempts, verify]);

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-lime-500/10 via-slate-950 to-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-slate-900 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-lime-500/10 blur-3xl rounded-full" />

                <AnimatePresence mode="wait">
                    {status === 'verifying' && (
                        <motion.div
                            key="verifying"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-20 h-20 bg-lime-500/10 rounded-3xl flex items-center justify-center border border-lime-500/20 relative">
                                <Loader2 className="text-lime-400 animate-spin" size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Verificando pagamento...</h1>
                            <p className="text-slate-400">Só um instante, estamos confirmando os dados com o banco.</p>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
                                <motion.div
                                    className="h-full bg-lime-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${(attempts / 5) * 100}%` }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-24 h-24 bg-lime-500 rounded-[2rem] flex items-center justify-center text-black shadow-[0_0_40px_rgba(132,204,22,0.3)]">
                                <ShieldCheck size={48} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white leading-tight">Bem-vindo ao Novo Rotta! 🚀</h2>
                                <p className="text-slate-400">Seu plano foi ativado com sucesso. Bem-vindo à elite.</p>
                            </div>

                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full bg-white text-black h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-[0.98] mt-4"
                            >
                                <Rocket size={20} />
                                Entrar no Painel
                            </button>
                        </motion.div>
                    )}

                    {status === 'delay' && (
                        <motion.div
                            key="delay"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 text-amber-500">
                                <Clock size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Pagamento em Processamento</h1>
                            <p className="text-slate-400">
                                Recebemos o sinal do pagamento, mas a rede está levando mais tempo que o comum para validar sua licença.
                            </p>

                            <div className="flex flex-col gap-3 w-full mt-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-white/5 border border-white/10 text-white h-14 rounded-2xl font-bold hover:bg-white/10 transition-all"
                                >
                                    Tentar Novamente
                                </button>
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="w-full text-slate-500 hover:text-white text-sm transition-colors py-2"
                                >
                                    Ainda não ativou? Ir para o dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Ops! Algo deu errado</h1>
                            <p className="text-slate-400">
                                Tivemos um problema técnico ao atualizar sua conta. Não se preocupe, seu pagamento está seguro.
                            </p>
                            <button
                                onClick={() => router.push("/pricing")}
                                className="w-full bg-white/5 border border-white/10 text-white h-14 rounded-2xl font-bold hover:bg-white/10 transition-all mt-4"
                            >
                                Voltar e Tentar Novamente
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="mt-10 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                    Suporte Rotta • ID Transação: {user?.id?.slice(0, 8)}
                </p>
            </motion.div>
        </div>
    );
}
