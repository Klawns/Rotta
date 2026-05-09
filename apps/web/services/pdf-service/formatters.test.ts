import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getClientReportFileName,
  getClientReportPeriodLabel,
  getFinancialReportFileName,
  getPeriodLabel,
} from './formatters';

test('formats financial PDF custom ranges from date-only values without timezone rollback', () => {
  const range = { start: '2026-04-01', end: '2026-04-08' };

  assert.equal(getPeriodLabel('custom', range), '01/04/2026 a 08/04/2026');
  assert.equal(
    getFinancialReportFileName('custom', range),
    'Relatorio_Financeiro_01_04_2026_a_08_04_2026.pdf',
  );
});

test('formats client PDF custom ranges from date-only values without timezone rollback', () => {
  const range = { start: '2026-04-01', end: '2026-04-08' };

  assert.equal(
    getClientReportPeriodLabel(range),
    '01/04/2026 a 08/04/2026',
  );
  assert.equal(
    getClientReportFileName('Cliente Teste', 'all', range),
    'Cliente_Cliente_Teste_Todas_01_04_2026_a_08_04_2026.pdf',
  );
});
