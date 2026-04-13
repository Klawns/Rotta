import assert from 'node:assert/strict';
import test from 'node:test';
import type { RideViewModel } from '@/types/rides';
import { getRideCardPresentation } from './ride-card.presenter';

function createRide(overrides: Partial<RideViewModel> = {}): RideViewModel {
  return {
    id: 'ride-1',
    value: 25,
    notes: null,
    status: 'COMPLETED',
    paymentStatus: 'PENDING',
    rideDate: '2026-04-10T10:00:00.000Z',
    createdAt: '2026-04-10T10:00:00.000Z',
    location: 'Centro',
    photo: null,
    client: {
      id: 'client-1',
      name: 'Alice',
    },
    clientId: 'client-1',
    clientName: 'Alice',
    paid: false,
    ...overrides,
  };
}

test('exposes the trimmed photo URL when the ride has an attached photo', () => {
  const presentation = getRideCardPresentation(
    createRide({
      photo: ' https://signed.example.com/ride-photo.webp ',
    }),
  );

  assert.equal(
    presentation.photoUrl,
    'https://signed.example.com/ride-photo.webp',
  );
});

test('keeps the photo URL empty when the ride has no attached photo', () => {
  const presentation = getRideCardPresentation(createRide());

  assert.equal(presentation.photoUrl, null);
});
