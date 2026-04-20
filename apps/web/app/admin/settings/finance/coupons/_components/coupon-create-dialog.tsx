'use client';

import {
  Clock3,
  Hash,
  Loader2,
  Percent,
  Plus,
  Save,
  Ticket,
} from 'lucide-react';

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
          <Plus size={16} /> Novo cupom
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[1.75rem] border-border bg-white text-slate-950">
        <DialogHeader>
          <DialogTitle>Criar novo cupom</DialogTitle>
          <DialogDescription className="text-slate-500">
            Preencha os detalhes para gerar um novo cupom.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={dialog.handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ticket size={14} /> Codigo do cupom
            </Label>
            <Input
              value={dialog.code}
              onChange={(event) => dialog.setCode(event.target.value.toUpperCase())}
              placeholder="EX: PROMO2024"
              required
              className="border-border bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent size={14} /> Tipo de desconto
              </Label>
              <Select
                value={dialog.discountMode}
                onValueChange={(value) =>
                  dialog.setDiscountMode(value as DiscountMode)
                }
              >
                <SelectTrigger className="border-border bg-white text-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-white text-slate-700">
                  <SelectItem value="PERCENTAGE">Porcentagem</SelectItem>
                  <SelectItem value="FIXED">Valor fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor do desconto</Label>
              <Input
                type="number"
                value={dialog.discountValue}
                onChange={(event) =>
                  dialog.setDiscountValue(Number(event.target.value))
                }
                required
                min="1"
                className="border-border bg-white"
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
                <Clock3 size={14} /> Duracao
              </Label>
              <Select
                value={dialog.duration}
                onValueChange={(value) =>
                  dialog.setDuration(value as PromoCodeDuration)
                }
              >
                <SelectTrigger className="border-border bg-white text-slate-950">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-white text-slate-700">
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
                  className="border-border bg-white"
                />
              </div>
            ) : null}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => dialog.handleOpenChange(false)}
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-950"
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
              Criar cupom
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
