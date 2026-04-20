'use client';

import { motion } from 'framer-motion';
import { CreditCard, Shield, Users } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import { AdminStats } from '@/types/admin';

interface AdminStatsGridProps {
  stats: AdminStats;
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const cards = [
    {
      label: 'Total de usuarios',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Assinaturas ativas',
      value: stats.activeSubscriptions || 0,
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Receita (30d)',
      value: formatCurrency((stats.revenue30d || 0) / 100),
      icon: CreditCard,
      color: 'text-violet-600 bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="admin-card group p-8 transition-transform hover:-translate-y-0.5"
        >
          <div
            className={cn(
              'mb-6 w-fit rounded-2xl p-4 transition-transform group-hover:scale-110',
              card.color,
            )}
          >
            <card.icon size={28} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            {card.label}
          </p>
          <h3 className="mt-1 text-4xl font-bold text-slate-950">{card.value}</h3>
        </motion.div>
      ))}
    </div>
  );
}
