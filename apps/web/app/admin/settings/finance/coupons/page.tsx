import { redirect } from 'next/navigation';

export default function LegacyAdminCouponsPage() {
  redirect('/admin/billing');
}
