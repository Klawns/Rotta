import type { ReactNode } from 'react';

import { AdminAccessGate } from './_components/admin-access-gate';
import { AdminShell } from './_components/admin-shell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAccessGate>
      <AdminShell>{children}</AdminShell>
    </AdminAccessGate>
  );
}
