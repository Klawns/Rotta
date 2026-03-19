"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function FinanceCard() {
    return (
        <Link href="/dashboard/finance" className="block outline-none h-full">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-blue-600/20 to-violet-600/20 relative overflow-hidden group hover:from-blue-600/30 transition-all cursor-pointer h-full"
            >
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white">Relatórios Financeiros</h2>
                    <p className="text-slate-300 mt-2 max-w-[80%]">Analise suas métricas detalhadas e exporte relatórios em PDF.</p>
                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl group-hover:scale-105 transition-all">
                        Acessar agora
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full"></div>
            </motion.div>
        </Link>
    );
}
