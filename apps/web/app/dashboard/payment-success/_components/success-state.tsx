import { motion } from "framer-motion";
import { ShieldCheck, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export function SuccessState() {
    const router = useRouter();

    return (
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
    );
}
