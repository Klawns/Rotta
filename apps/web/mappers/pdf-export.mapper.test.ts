import assert from 'node:assert/strict';
import test from 'node:test';

import { getRidesPdfExportAvailability } from './pdf-export.mapper';

test('allows export when at least one ride is available', () => {
  assert.deepEqual(
    getRidesPdfExportAvailability({
      rides: [
        {
          id: 'ride-1',
          value: 42,
        },
      ],
    }),
    {
      ok: true,
      ridesCount: 1,
    },
  );
});

test('reports empty export when there are no rides and no expected count', () => {
  assert.deepEqual(
    getRidesPdfExportAvailability({
      rides: [],
    }),
    {
      ok: false,
      reason: 'empty',
    },
  );
});

test('reports filtered data mismatch when the summary expected rides but the export payload is empty', () => {
  assert.deepEqual(
    getRidesPdfExportAvailability({
      rides: [],
      expectedRideCount: 3,
    }),
    {
      ok: false,
      reason: 'missing-filtered-rides',
      expectedRideCount: 3,
    },
  );
});
