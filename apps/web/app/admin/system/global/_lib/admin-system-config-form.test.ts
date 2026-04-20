import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAdminSystemConfigUpdates,
  getAdminSystemConfigFormValues,
} from './admin-system-config-form';

test('maps missing admin configs to empty form fields', () => {
  assert.deepEqual(getAdminSystemConfigFormValues({}), {
    supportEmail: '',
    supportWhatsapp: '',
  });
});

test('returns only changed config updates in a stable order', () => {
  assert.deepEqual(
    buildAdminSystemConfigUpdates(
      {
        supportEmail: 'suporte@rotta.app',
        supportWhatsapp: 'https://wa.me/5511999999999',
      },
      {
        supportEmail: 'suporte@rotta.app',
        supportWhatsapp: 'https://wa.me/5511888888888',
      },
    ),
    [
      {
        key: 'SUPPORT_WHATSAPP',
        value: 'https://wa.me/5511999999999',
      },
    ],
  );
});
