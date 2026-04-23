import type { BackupHeaderViewModel } from '../_types/admin-backups.types';

export function getAdminBackupsHeaderViewModel(): BackupHeaderViewModel {
  return {
    title: 'Backups técnicos',
    description:
      'Operação, histórico e configuração do fluxo de pg_dump para disaster recovery.',
  };
}
