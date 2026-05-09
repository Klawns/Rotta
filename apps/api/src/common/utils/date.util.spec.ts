import { getDatesFromPeriod } from './date.util';

describe('date util', () => {
  it('converts date-only custom ranges to inclusive Sao Paulo calendar days', () => {
    const { startDate, endDate } = getDatesFromPeriod(
      'custom',
      '2026-04-01',
      '2026-04-08',
    );

    expect(startDate.toISOString()).toBe('2026-04-01T03:00:00.000Z');
    expect(endDate.toISOString()).toBe('2026-04-09T02:59:59.999Z');
  });
});
