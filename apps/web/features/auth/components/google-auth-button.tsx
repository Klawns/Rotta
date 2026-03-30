import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GoogleIcon } from './google-icon';

interface GoogleAuthButtonProps {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}

export function GoogleAuthButton({
  children,
  disabled = false,
  onClick,
}: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-auto w-full items-center justify-center gap-3 rounded-2xl py-4 font-bold shadow-xl transition-all',
        disabled
          ? 'bg-slate-700 text-slate-300 shadow-none'
          : 'bg-white text-slate-950 shadow-white/5 hover:bg-slate-100',
      )}
    >
      <GoogleIcon />
      {children}
    </Button>
  );
}
