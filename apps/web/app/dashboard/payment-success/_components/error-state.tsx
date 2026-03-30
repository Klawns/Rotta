import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
    onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
    const router = useRouter();

    return (
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
                Tivemos um problema tecnico ao atualizar sua conta. Nao se preocupe, seu pagamento esta seguro.
            </p>
            <div className="mt-4 flex w-full flex-col gap-3">
                <button
                    onClick={onRetry}
                    className="w-full bg-white text-slate-950 h-14 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                >
                    Tentar Novamente
                </button>
                <button
                    onClick={() => router.push("/pricing")}
                    className="w-full bg-white/5 border border-white/10 text-white h-14 rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                    Voltar para os Planos
                </button>
            </div>
        </motion.div>
    );
}
