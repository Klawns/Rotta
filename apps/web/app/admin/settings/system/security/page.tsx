import { redirect } from 'next/navigation';

export default function LegacySecuritySettingsPage() {
  redirect('/admin/system/security');
}
