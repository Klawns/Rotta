import assert from 'node:assert/strict';
import test from 'node:test';
import { ridesService } from '@/services/rides-service';
import { fetchRidesPage } from './use-rides-data';

test('calls getRides for the active scope', async () => {
  const originalGetRides = ridesService.getRides;
  const originalGetArchivedRides = ridesService.getArchivedRides;
  let calledScope: string | null = null;

  ridesService.getRides = (async () => {
    calledScope = 'active';
    return {
      data: [],
      meta: {},
    };
  }) as typeof ridesService.getRides;
  ridesService.getArchivedRides = (async () => {
    calledScope = 'archived';
    return {
      data: [],
      meta: {},
    };
  }) as typeof ridesService.getArchivedRides;

  try {
    await fetchRidesPage('active', { limit: 10 });
    assert.equal(calledScope, 'active');
  } finally {
    ridesService.getRides = originalGetRides;
    ridesService.getArchivedRides = originalGetArchivedRides;
  }
});

test('calls getArchivedRides for the archived scope', async () => {
  const originalGetRides = ridesService.getRides;
  const originalGetArchivedRides = ridesService.getArchivedRides;
  let calledScope: string | null = null;

  ridesService.getRides = (async () => {
    calledScope = 'active';
    return {
      data: [],
      meta: {},
    };
  }) as typeof ridesService.getRides;
  ridesService.getArchivedRides = (async () => {
    calledScope = 'archived';
    return {
      data: [],
      meta: {},
    };
  }) as typeof ridesService.getArchivedRides;

  try {
    await fetchRidesPage('archived', { limit: 10 });
    assert.equal(calledScope, 'archived');
  } finally {
    ridesService.getRides = originalGetRides;
    ridesService.getArchivedRides = originalGetArchivedRides;
  }
});
