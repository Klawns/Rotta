'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import type { AdminBillingPlan } from '@/types/admin-billing';
import type { UpdatePricingPlanInput } from '@/types/admin';

interface PlanCardProps {
  plan: AdminBillingPlan;
  isGlobalSaving: boolean;
  onSave: (id: string, data: UpdatePricingPlanInput) => Promise<void>;
}

function createPlanDraft(plan: AdminBillingPlan): UpdatePricingPlanInput {
  return {
    price: plan.price,
    interval: plan.interval || '',
    highlight: plan.highlight,
  };
}

function getPlanDraftKey(plan: AdminBillingPlan): string {
  return [
    plan.id,
    String(plan.price),
    plan.interval || '',
    plan.highlight ? '1' : '0',
  ].join(':');
}

function PlanCardForm({ plan, isGlobalSaving, onSave }: PlanCardProps) {
  const [edited, setEdited] = useState<UpdatePricingPlanInput>(() =>
    createPlanDraft(plan),
  );
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    edited.price !== plan.price ||
    edited.interval !== (plan.interval || '') ||
    edited.highlight !== plan.highlight;

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave(plan.id, edited);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Preco (centavos)</Label>
        <Input
          type="number"
          value={edited.price ?? 0}
          onChange={(event) =>
            setEdited((previous) => ({
              ...previous,
              price: Number(event.target.value),
            }))
          }
          className="border-border bg-white"
        />
        <p className="text-[10px] text-slate-500">
          Valor atual: {formatCurrency(plan.price / 100)}
        </p>
      </div>
      <div className="space-y-2">
        <Label>Intervalo</Label>
        <Input
          value={edited.interval || ''}
          onChange={(event) =>
            setEdited((previous) => ({
              ...previous,
              interval: event.target.value,
            }))
          }
          placeholder="ex: /mes"
          className="border-border bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label>Destaque</Label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(edited.highlight)}
            onChange={(event) =>
              setEdited((previous) => ({
                ...previous,
                highlight: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded border border-border bg-white"
          />
          <span className="text-sm text-slate-600">
            Mostrar como recomendado
          </span>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button
          disabled={!hasChanges || isSaving || isGlobalSaving}
          onClick={handleSave}
          className="w-full bg-blue-600 text-white hover:bg-blue-500"
        >
          {isSaving ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
          {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
        </Button>
      </div>
    </>
  );
}

export function PlanCard({ plan, isGlobalSaving, onSave }: PlanCardProps) {
  return (
    <Card className="flex flex-col rounded-[2rem] border-border/80 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <PlanCardForm
          key={getPlanDraftKey(plan)}
          plan={plan}
          isGlobalSaving={isGlobalSaving}
          onSave={onSave}
        />
      </CardContent>
    </Card>
  );
}
