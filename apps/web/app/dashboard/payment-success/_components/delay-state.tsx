import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface DelayStateProps {
    onRetry: () => void;
}

export function DelayState({ onRetry }: DelayStateProps) {
    const router = useRouter();

    return (
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
                    onClick={onRetry}
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
    );
}
