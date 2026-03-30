'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { AdminPricingPlan, UpdatePricingPlanInput } from '@/types/admin';

interface PlanCardProps {
  plan: AdminPricingPlan;
  isGlobalSaving: boolean;
  onSave: (id: string, data: UpdatePricingPlanInput) => Promise<void>;
}

function createPlanDraft(plan: AdminPricingPlan): UpdatePricingPlanInput {
  return {
    price: plan.price,
    interval: plan.interval || '',
    highlight: plan.highlight,
  };
}

function getPlanDraftKey(plan: AdminPricingPlan): string {
  return [
    plan.id,
    String(plan.price),
    plan.interval || '',
    plan.highlight ? '1' : '0',
  ].join(':');
}

function PlanCardForm({
  plan,
  isGlobalSaving,
  onSave,
}: PlanCardProps) {
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
        <Label>Preço (centavos)</Label>
        <Input
          type="number"
          value={edited.price ?? 0}
          onChange={(event) =>
            setEdited((previous) => ({
              ...previous,
              price: Number(event.target.value),
            }))
          }
          className="border-white/10 bg-slate-950"
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
          placeholder="ex: /mês"
          className="border-white/10 bg-slate-950"
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
            className="h-4 w-4 rounded border-white/10 bg-slate-950"
          />
          <span className="text-sm text-slate-400">
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
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </>
  );
}

export function PlanCard({
  plan,
  isGlobalSaving,
  onSave,
}: PlanCardProps) {
  return (
    <Card className="flex flex-col border-white/5 bg-slate-900/40">
      <CardHeader>
        <CardTitle className="text-white">{plan.name}</CardTitle>
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
