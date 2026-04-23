import { DangerZone } from '../_components/danger-zone';
import { SettingsPageShell } from '../_components/settings-page-shell';

export default function SettingsDangerPage() {
  return (
    <SettingsPageShell headerVariant="none">
      <DangerZone />
    </SettingsPageShell>
  );
}
