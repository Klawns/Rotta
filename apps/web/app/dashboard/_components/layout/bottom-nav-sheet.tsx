'use client';

import Link from 'next/link';
import { LogOut, Sparkles } from 'lucide-react';
import { type User } from '@/hooks/use-auth';
import {
  CHECKOUT_CTA_HREF,
  getFreeTrialState,
} from '@/services/free-trial-service';
import {
  isDashboardNavItemActive,
  DASHBOARD_MOBILE_SHEET_OFFSET,
  type DashboardNavItem,
} from '../../_lib/dashboard-navigation';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { BottomNavItem } from './bottom-nav-item';

interface BottomNavSheetProps {
  items: DashboardNavItem[];
  user: User | null;
  pathname: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogout: () => void;
}

export function BottomNavSheet({
  items,
  user,
  pathname,
  isOpen,
  onOpenChange,
  onLogout,
}: BottomNavSheetProps) {
  const trial = getFreeTrialState(user);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent
        className="rounded-t-[1.35rem] rounded-b-none border-x border-t border-border-subtle bg-background shadow-[0_-10px_24px_rgba(15,23,42,0.1)] lg:hidden"
        style={{ bottom: DASHBOARD_MOBILE_SHEET_OFFSET }}
      >
        <DrawerHeader className="px-4 pt-5 text-left">
          <DrawerTitle className="text-lg font-display font-extrabold text-text-primary">
            Mais atalhos
          </DrawerTitle>
          <DrawerDescription>
            Acesse rotas secundarias e acoes da sua conta sem voltar para o menu lateral.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-2 overflow-y-auto px-3 pb-3">
          {items.map((item) => (
            <BottomNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isDashboardNavItemActive(item, pathname)}
              disabled={item.disabled}
              variant="sheet"
              onNavigate={handleClose}
            />
          ))}

          {trial.isStarter ? (
            <Link
              href={CHECKOUT_CTA_HREF}
              onClick={handleClose}
              className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.4rem] bg-button-primary px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-button-primary-foreground shadow-lg shadow-button-shadow transition-colors hover:bg-button-primary-hover active:scale-[0.99]"
            >
              <Sparkles size={15} />
              Fazer upgrade
            </Link>
          ) : null}
        </div>

        <DrawerFooter className="gap-3 border-t border-border-subtle px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
          <div className="flex items-center gap-3 rounded-[1.6rem] border border-border-subtle bg-card-background px-4 py-3 shadow-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-icon-brand/20 bg-icon-brand/10 text-sm font-bold text-icon-brand">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                {user?.name || 'Usuario'}
              </p>
              <p className="truncate text-xs text-text-secondary">
                {user?.email || 'Sem email cadastrado'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.3rem] border border-border-subtle bg-card-background px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-icon-destructive/25 hover:bg-icon-destructive/10 hover:text-icon-destructive active:scale-[0.99]"
          >
            <LogOut size={16} />
            Sair
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
