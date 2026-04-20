import type { AdminConfigs, UpdateAdminConfigInput } from '@/types/admin';

export interface AdminSystemConfigFormValues {
  supportWhatsapp: string;
  supportEmail: string;
}

export function getAdminSystemConfigFormValues(
  configs: Partial<AdminConfigs>,
): AdminSystemConfigFormValues {
  return {
    supportWhatsapp: configs.SUPPORT_WHATSAPP ?? '',
    supportEmail: configs.SUPPORT_EMAIL ?? '',
  };
}

export function buildAdminSystemConfigUpdates(
  nextValues: AdminSystemConfigFormValues,
  initialValues: AdminSystemConfigFormValues,
): UpdateAdminConfigInput[] {
  const updates: UpdateAdminConfigInput[] = [];

  if (nextValues.supportWhatsapp !== initialValues.supportWhatsapp) {
    updates.push({
      key: 'SUPPORT_WHATSAPP',
      value: nextValues.supportWhatsapp,
    });
  }

  if (nextValues.supportEmail !== initialValues.supportEmail) {
    updates.push({
      key: 'SUPPORT_EMAIL',
      value: nextValues.supportEmail,
    });
  }

  return updates;
}
