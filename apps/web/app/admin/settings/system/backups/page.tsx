import { redirect } from 'next/navigation';

export default function LegacyAdminBackupsPage() {
  redirect('/admin/system/backups');
}
