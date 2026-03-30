'use client';

import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePaymentPlans } from '@/hooks/use-payment-plans';
import { cn } from '@/lib/utils';

export function CheckoutSelector() {
  const router = useRouter();
  const { data: plans = [], isLoading } = usePaymentPlans();

  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return 'Gratis';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(priceInCents / 100);
  };

  const handlePlanSelect = (planId: string) => {
    if (planId === 'starter') {
      router.push('/dashboard');
      return;
    }

    router.push('/contato');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-text-secondary">
          Carregando planos disponiveis...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="grid gap-8 lg:grid-cols-3"
      >
        {plans.map((tier, idx) => (
          <motion.div
            key={tier.id ?? idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              'relative flex flex-col rounded-3xl border p-10 transition-all',
              tier.highlight
                ? 'border-primary/40 bg-card-background shadow-2xl shadow-primary/10'
                : 'border-border-subtle bg-card-background/80 hover:border-border-strong',
            )}
          >
            {tier.highlight && (
              <div className="absolute right-10 top-0 -translate-y-1/2 rounded-full bg-button-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-button-primary-foreground shadow-lg shadow-button-shadow">
                Mais Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="mb-2 text-xl font-bold text-text-primary">
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-text-primary">
                  {formatPrice(tier.price)}
                </span>
                {tier.interval && (
                  <span className="text-sm text-text-muted">
                    {tier.interval}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {tier.description}
              </p>
            </div>

            <ul className="mb-10 flex-grow space-y-4">
              {tier.features.map((feature, index) => (
                <li
                  key={`${tier.id}-${index}`}
                  className="flex items-center gap-3 text-sm text-text-secondary"
                >
                  <Check size={16} className="shrink-0 text-trial-active" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanSelect(tier.id)}
              className={cn(
                'w-full rounded-xl py-4 text-sm font-bold transition-all active:scale-[0.98]',
                tier.highlight
                  ? 'bg-button-primary text-button-primary-foreground shadow-lg shadow-button-shadow hover:bg-button-primary-hover'
                  : 'border border-border-subtle bg-muted text-text-primary hover:bg-hover-accent',
              )}
            >
              {tier.cta}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
