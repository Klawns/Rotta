import { BackupsPageContent } from '../_components/backups/backups-page-content';
import { SettingsPageShell } from '../_components/settings-page-shell';

export default function SettingsBackupsPage() {
  return (
    <SettingsPageShell headerVariant="none" showTabs={false}>
      <BackupsPageContent />
    </SettingsPageShell>
  );
}
