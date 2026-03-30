'use client';

import { LogOut } from 'lucide-react';
import { type User } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  isOpen: boolean;
  user: User | null;
  onLogout: () => void;
}

export function SidebarFooter({
  isOpen,
  user,
  onLogout,
}: SidebarFooterProps) {
  return (
    <div className="pt-6 border-t border-sidebar-border mt-auto">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 mb-4',
          !isOpen && 'lg:justify-center lg:px-0',
        )}
      >
        <div className="w-10 h-10 rounded-full bg-icon-brand/10 text-icon-brand flex items-center justify-center font-bold text-sm shrink-0 border border-icon-brand/20 transition-colors">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        {isOpen && (
          <div className="overflow-hidden">
            <p className="font-semibold truncate text-text-primary">
              {user?.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-sidebar-foreground-muted truncate leading-none font-medium">
                {user?.email}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onLogout}
        className={cn(
          'w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-icon-destructive/10 text-sidebar-foreground-muted hover:text-icon-destructive transition-all group active:scale-95',
          !isOpen && 'lg:justify-center lg:px-0',
        )}
        title={!isOpen ? 'Sair' : ''}
      >
        <LogOut
          size={20}
          className="shrink-0 group-hover:-translate-x-1 transition-transform"
        />
        {isOpen && <span className="font-medium">Sair</span>}
      </button>
    </div>
  );
}
