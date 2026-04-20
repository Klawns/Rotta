import { redirect } from 'next/navigation';

export default function LegacyAdminFinancePlansPage() {
  redirect('/admin/billing/plans');
}
