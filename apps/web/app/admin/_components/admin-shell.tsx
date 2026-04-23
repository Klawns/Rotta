'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  Users,
  WalletCards,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  getAdminShellNavigation,
  type AdminResolvedNavigationItem,
} from '../_lib/admin-shell-navigation';

interface AdminShellProps {
  children: ReactNode;
}

const ADMIN_NAVIGATION_ICONS = {
  '/admin/overview': LayoutDashboard,
  '/admin/users': Users,
  '/admin/billing': WalletCards,
  '/admin/system/global': Settings2,
} as const;

function AdminShellNavLink({
  item,
  onNavigate,
  compact = false,
}: {
  item: AdminResolvedNavigationItem;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const Icon = ADMIN_NAVIGATION_ICONS[item.href as keyof typeof ADMIN_NAVIGATION_ICONS] ?? Settings2;

  return (
    <Link
      href={item.href}
      className={cn('admin-shell-link', compact && 'admin-shell-link-compact')}
      data-active={item.isActive}
      onClick={onNavigate}
    >
      <Icon className="size-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function AdminShellSidebar({
  navigation,
  onNavigate,
  showSubNavigation = false,
}: {
  navigation: ReturnType<typeof getAdminShellNavigation>;
  onNavigate?: () => void;
  showSubNavigation?: boolean;
}) {
  return (
    <nav className="space-y-8">
      <div className="space-y-3">
        <span className="admin-shell-section-label">Principal</span>
        <div className="space-y-2">
          {navigation.primaryNavigation.map((item) => (
            <AdminShellNavLink
              key={item.href}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {showSubNavigation && navigation.subNavigation ? (
        <div className="space-y-3">
          <span className="admin-shell-section-label">
            {navigation.subNavigation.title}
          </span>
          <div className="space-y-2">
            {navigation.subNavigation.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="admin-shell-subnav-link"
                data-active={item.isActive}
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigation = useMemo(
    () => getAdminShellNavigation(pathname),
    [pathname],
  );

  return (
    <div className="light admin-shell">
      <div className="admin-shell-layout">
        <aside className="admin-shell-sidebar">
          <div className="admin-shell-sidebar-panel">
            <div className="space-y-8">
              <AdminShellSidebar navigation={navigation} />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start rounded-2xl border-border bg-white/70 px-4 py-6 text-foreground hover:bg-white"
              onClick={logout}
            >
              <LogOut className="size-4" />
              Encerrar sessão
            </Button>
          </div>
        </aside>

        <div className="admin-shell-content">
          <header className="admin-shell-mobile-topbar md:hidden">
            <div className="min-w-0">
              <span className="admin-shell-section-label">Admin</span>
              <p className="truncate text-sm font-semibold text-foreground">
                {navigation.primaryActiveItem.label}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-2xl border-border bg-white/70 text-foreground hover:bg-white md:hidden"
                  >
                    <Menu className="size-4" />
                    <span className="sr-only">Abrir navegação administrativa</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[22rem] border-border bg-white px-0"
                >
                  <SheetHeader className="border-b border-border px-6 pb-4 text-left">
                    <SheetTitle className="text-left text-foreground">
                      Painel administrativo
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex h-full flex-col justify-between px-6 py-6">
                    <AdminShellSidebar
                      navigation={navigation}
                      onNavigate={() => setIsMobileMenuOpen(false)}
                      showSubNavigation
                    />

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start rounded-2xl border-border bg-white text-foreground hover:bg-accent"
                      onClick={logout}
                    >
                      <LogOut className="size-4" />
                      Encerrar sessão
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          {navigation.subNavigation ? (
            <nav className="admin-shell-subnav">
              {navigation.subNavigation.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="admin-shell-subnav-link"
                  data-active={item.isActive}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <main className="admin-shell-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
