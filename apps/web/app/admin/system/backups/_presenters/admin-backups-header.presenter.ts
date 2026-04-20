import type { BackupHeaderViewModel } from '../_types/admin-backups.types';

export function getAdminBackupsHeaderViewModel(): BackupHeaderViewModel {
  return {
    title: 'Backups tecnicos',
    description:
      'Operacao, historico e configuracao do fluxo de pg_dump para disaster recovery.',
  };
}
