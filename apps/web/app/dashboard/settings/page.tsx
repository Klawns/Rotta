import { GeneralSettings } from './_components/general-settings';
import { SettingsPageShell } from './_components/settings-page-shell';

export default function SettingsPage() {
  return (
    <SettingsPageShell headerVariant="none">
      <GeneralSettings />
    </SettingsPageShell>
  );
}
