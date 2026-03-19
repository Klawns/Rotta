import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface VerifyingStateProps {
    attempts: number;
    maxAttempts: number;
}

export function VerifyingState({ attempts, maxAttempts }: VerifyingStateProps) {
    return (
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
                    animate={{ width: `${(attempts / maxAttempts) * 100}%` }}
                />
            </div>
        </motion.div>
    );
}
