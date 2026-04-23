'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { DashboardHomeMobileHeader } from './dashboard-home-mobile-header';

interface MobileHeaderProps {
  onOpenNavigationMenu: () => void;
  isNavigationMenuOpen: boolean;
  userName?: string | null;
}

function getDashboardMobileHeaderTitle(pathname: string) {
  if (pathname === '/dashboard') {
    return 'Controle de Corrida';
  }

  if (pathname.startsWith('/dashboard/clients')) {
    return 'Meus Clientes';
  }

  if (pathname.startsWith('/dashboard/rides')) {
    return 'Histórico de Corridas';
  }

  if (pathname.startsWith('/dashboard/finance')) {
    return 'Financeiro';
  }

  if (pathname.startsWith('/dashboard/settings/backups')) {
    return 'Backups';
  }

  if (pathname.startsWith('/dashboard/settings')) {
    return 'Configurações';
  }

  return null;
}

function getDashboardMobileHeaderGreeting(pathname: string) {
  if (pathname === '/dashboard') {
    return 'default';
  }

  return null;
}

export function MobileHeader({
  onOpenNavigationMenu,
  isNavigationMenuOpen,
  userName,
}: MobileHeaderProps) {
  const pathname = usePathname();
  const title = getDashboardMobileHeaderTitle(pathname);
  const greeting = getDashboardMobileHeaderGreeting(pathname);

  if (title) {
    return (
      <DashboardHomeMobileHeader
        onOpenNavigationMenu={onOpenNavigationMenu}
        isNavigationMenuOpen={isNavigationMenuOpen}
        userName={userName}
        title={title}
        greeting={greeting}
      />
    );
  }

  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/40 p-6 backdrop-blur-md lg:hidden">
      <Link
        href="/dashboard"
        aria-label="Ir para o Dashboard"
        className="flex items-center gap-3 transition-transform active:scale-95"
      >
        <div className="relative h-8 w-8">
          <Image
            src="/assets/logo8.jpg"
            alt="Rotta Logo"
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <span className="font-bold uppercase italic tracking-tight text-foreground">
          ROTTA
        </span>
      </Link>
      <button
        onClick={onOpenNavigationMenu}
        aria-expanded={isNavigationMenuOpen}
        aria-label={isNavigationMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        className="rounded-lg bg-accent/50 p-2 text-muted-foreground transition-transform active:scale-95"
      >
        <Menu size={20} />
      </button>
    </header>
  );
}
