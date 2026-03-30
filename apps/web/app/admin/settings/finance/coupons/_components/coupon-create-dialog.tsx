'use client';

import { Hash, Clock3, Loader2, Percent, Plus, Save, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PromoCodeDuration } from '@/types/payments';
import {
  DiscountMode,
  useAdminCouponDialog,
} from '../_hooks/use-admin-coupon-dialog';

type CouponDialogState = ReturnType<typeof useAdminCouponDialog>;

interface CouponCreateDialogProps {
  dialog: CouponDialogState;
  isSubmitting: boolean;
}

export function CouponCreateDialog({
  dialog,
  isSubmitting,
}: CouponCreateDialogProps) {
  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-500">
          <Plus size={16} /> Novo Cupom
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle>Criar Novo Cupom</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para gerar um novo cupom.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={dialog.handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ticket size={14} /> Código do Cupom
            </Label>
            <Input
              value={dialog.code}
              onChange={(event) => dialog.setCode(event.target.value.toUpperCase())}
              placeholder="EX: PROMO2024"
              required
              className="border-white/10 bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent size={14} /> Tipo de Desconto
              </Label>
              <Select
                value={dialog.discountMode}
                onValueChange={(value) =>
                  dialog.setDiscountMode(value as DiscountMode)
                }
              >
                <SelectTrigger className="border-white/10 bg-slate-950 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  <SelectItem value="PERCENTAGE">Porcentagem</SelectItem>
                  <SelectItem value="FIXED">Valor Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor do Desconto</Label>
              <Input
                type="number"
                value={dialog.discountValue}
                onChange={(event) =>
                  dialog.setDiscountValue(Number(event.target.value))
                }
                required
                min="1"
                className="border-white/10 bg-slate-950"
              />
              <p className="text-[10px] text-slate-500">
                {dialog.discountMode === 'PERCENTAGE'
                  ? 'Informe 10 para 10% de desconto'
                  : 'Informe em centavos, ex: 500 para R$ 5,00'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock3 size={14} /> Duração
              </Label>
              <Select
                value={dialog.duration}
                onValueChange={(value) =>
                  dialog.setDuration(value as PromoCodeDuration)
                }
              >
                <SelectTrigger className="border-white/10 bg-slate-950 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  <SelectItem value="once">Uma vez</SelectItem>
                  <SelectItem value="repeating">Recorrente</SelectItem>
                  <SelectItem value="forever">Para sempre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dialog.duration === 'repeating' ? (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash size={14} /> Meses
                </Label>
                <Input
                  type="number"
                  value={dialog.durationInMonths}
                  onChange={(event) =>
                    dialog.setDurationInMonths(Number(event.target.value))
                  }
                  min="1"
                  required
                  className="border-white/10 bg-slate-950"
                />
              </div>
            ) : null}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => dialog.handleOpenChange(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <Save className="mr-2" size={16} />
              )}
              Criar Cupom
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
