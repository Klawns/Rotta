'use client';

import { CreditCard, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { AdminStats } from '@/types/admin';

interface AdminStatsGridProps {
  stats: AdminStats;
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const cards = [
    {
      label: 'Total de Usuários',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Assinaturas Ativas',
      value: stats.activeSubscriptions || 0,
      icon: Shield,
      color: 'text-emerald-400',
    },
    {
      label: 'Receita (30d)',
      value: formatCurrency((stats.revenue30d || 0) / 100),
      icon: CreditCard,
      color: 'text-violet-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card group rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 transition-all hover:bg-slate-900/60"
        >
          <div
            className={`mb-6 w-fit rounded-2xl bg-white/5 p-4 ${card.color} transition-transform group-hover:scale-110`}
          >
            <card.icon size={28} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            {card.label}
          </p>
          <h3 className="mt-1 text-4xl font-bold text-white">{card.value}</h3>
        </motion.div>
      ))}
    </div>
  );
}
