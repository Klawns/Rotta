'use client';

import { Check, ChevronDown, Circle, LoaderCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { PaymentStatus } from '@/types/rides';

interface RidePaymentActionProps {
  paymentStatus?: PaymentStatus;
  onChangeStatus?: (status: PaymentStatus) => void | Promise<unknown>;
  isLoading?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  xs: 'min-h-7 px-2.5 py-1 text-[8px] tracking-[0.14em]',
  sm: 'min-h-8 px-3 py-1 text-[9px] tracking-[0.16em]',
  md: 'min-h-9 px-3.5 py-1.5 text-[10px] tracking-[0.18em]',
};

export function RidePaymentAction({
  paymentStatus = 'PENDING',
  onChangeStatus,
  isLoading = false,
  size = 'sm',
  className,
}: RidePaymentActionProps) {
  const isPaid = paymentStatus === 'PAID';
  const statusLabel = isPaid ? 'Pago' : 'Pendente';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          disabled={isLoading || !onChangeStatus}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-full border font-black uppercase transition-all disabled:cursor-not-allowed disabled:opacity-70',
            isPaid
              ? 'border-icon-success/20 bg-icon-success/10 text-icon-success hover:bg-icon-success/20'
              : 'border-icon-warning/30 bg-icon-warning/10 text-icon-warning hover:bg-icon-warning/20',
            sizeClasses[size],
            className,
          )}
          title="Alterar status de pagamento"
        >
          {isLoading ? (
            <LoaderCircle className="size-3 animate-spin" />
          ) : isPaid ? (
            <Check className="size-3" />
          ) : (
            <Circle className="size-3 fill-current" />
          )}
          {isLoading ? 'Salvando' : statusLabel}
          <ChevronDown className="size-3 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-36 rounded-xl border-border-subtle bg-card-background"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <DropdownMenuRadioGroup
          value={paymentStatus}
          onValueChange={(value) => {
            void onChangeStatus?.(value as PaymentStatus);
          }}
        >
          <DropdownMenuRadioItem value="PAID">
            Pago
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="PENDING">
            Pendente
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
