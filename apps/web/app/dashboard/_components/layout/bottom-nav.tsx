'use client';

import { usePathname } from 'next/navigation';
import { type User } from '@/hooks/use-auth';
import {
  DASHBOARD_MOBILE_NAV_HEIGHT,
  isDashboardNavItemActive,
  type DashboardNavItem,
} from '../../_lib/dashboard-navigation';
import { BottomNavItem } from './bottom-nav-item';
import { BottomNavSheet } from './bottom-nav-sheet';

interface BottomNavProps {
  primaryItems: DashboardNavItem[];
  secondaryItems: DashboardNavItem[];
  user: User | null;
  isSheetOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogout: () => void;
}

export function BottomNav({
  primaryItems,
  secondaryItems,
  user,
  isSheetOpen,
  onOpenChange,
  onLogout,
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div
          className="flex w-full items-center gap-1 border-x border-t border-border-subtle bg-background/98 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          style={{
            minHeight: DASHBOARD_MOBILE_NAV_HEIGHT,
            borderTopLeftRadius: '1.35rem',
            borderTopRightRadius: '1.35rem',
          }}
        >
          {primaryItems.map((item) => (
            <BottomNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.mobileLabel ?? item.label}
              isActive={isDashboardNavItemActive(item, pathname)}
              disabled={item.disabled}
              onNavigate={() => onOpenChange(false)}
            />
          ))}
        </div>
      </nav>

      <BottomNavSheet
        items={secondaryItems}
        user={user}
        pathname={pathname}
        isOpen={isSheetOpen}
        onOpenChange={onOpenChange}
        onLogout={onLogout}
      />
    </>
  );
}
