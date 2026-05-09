import assert from 'node:assert/strict';
import test from 'node:test';
import { apiClient } from '@/services/api';
import { ridesService } from './rides-service';

test('maps archived metadata from archived rides responses', async () => {
  const originalGetPaginated = apiClient.getPaginated;

  apiClient.getPaginated = (async () => ({
    data: [
      {
        id: 'ride-1',
        value: 35,
        notes: null,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        rideDate: '2026-04-10T10:00:00.000Z',
        createdAt: '2026-04-10T10:00:00.000Z',
        archivedAt: '2026-04-12T11:00:00.000Z',
        archivedBy: 'user-1',
        archiveReason: 'user-delete',
        paidWithBalance: 0,
        debtValue: 0,
        location: 'Centro',
        photo: null,
        client: {
          id: 'client-1',
          name: 'Alice',
        },
      },
    ],
    meta: {},
  })) as typeof apiClient.getPaginated;

  try {
    const response = await ridesService.getArchivedRides({ limit: 10 });

    assert.equal(response.data[0]?.archivedAt, '2026-04-12T11:00:00.000Z');
    assert.equal(response.data[0]?.archivedBy, 'user-1');
    assert.equal(response.data[0]?.archiveReason, 'user-delete');
  } finally {
    apiClient.getPaginated = originalGetPaginated;
  }
});

test('calls the single-ride restore endpoint', async () => {
  const originalPost = apiClient.post;
  let calledUrl = '';

  apiClient.post = (async (url: string) => {
    calledUrl = url;
    return {
      id: 'ride-1',
      value: 35,
      notes: null,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      rideDate: '2026-04-10T10:00:00.000Z',
      createdAt: '2026-04-10T10:00:00.000Z',
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      paidWithBalance: 0,
      debtValue: 0,
      location: 'Centro',
      photo: null,
      client: {
        id: 'client-1',
        name: 'Alice',
      },
    };
  }) as typeof apiClient.post;

  try {
    await ridesService.restoreRide('ride-1');
    assert.equal(calledUrl, '/rides/ride-1/restore');
  } finally {
    apiClient.post = originalPost;
  }
});

test('calls the bulk restore endpoint', async () => {
  const originalPost = apiClient.post;
  let calledUrl = '';
  let calledBody: unknown = null;

  apiClient.post = (async (url: string, body?: unknown) => {
    calledUrl = url;
    calledBody = body;
    return {
      requestedCount: 2,
      restoredCount: 2,
    };
  }) as typeof apiClient.post;

  try {
    const result = await ridesService.restoreRides(['ride-1', 'ride-2']);
    assert.equal(calledUrl, '/rides/restore-bulk');
    assert.deepEqual(calledBody, { ids: ['ride-1', 'ride-2'] });
    assert.equal(result.restoredCount, 2);
  } finally {
    apiClient.post = originalPost;
  }
});
