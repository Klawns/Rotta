import { clients, rides } from '@mdc/database';
import { RideReadRepository } from './ride-read.repository';
import { RideCursorService } from './ride-cursor.service';

function createListQueryMock(result: unknown[]) {
  return {
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  };
}

function createCountQueryMock(result: Array<{ count: number }>) {
  return {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue(result),
  };
}

describe('RideReadRepository', () => {
  it('includes archive metadata when listing archived rides', async () => {
    const archivedAt = new Date('2026-04-05T10:00:00.000Z');
    const ride = {
      id: 'ride-1',
      displayId: 1,
      clientId: 'client-1',
      userId: 'user-1',
      value: 35,
      notes: null,
      status: 'COMPLETED' as const,
      paymentStatus: 'PAID' as const,
      paidWithBalance: 0,
      debtValue: 0,
      rideDate: new Date('2026-04-03T10:00:00.000Z'),
      createdAt: new Date('2026-04-03T10:00:00.000Z'),
      location: 'Centro',
      photo: null,
      archivedAt,
      archivedBy: 'user-1',
      archiveReason: 'user-delete',
      client: {
        id: 'client-1',
        name: 'Alice',
      },
    };
    const listQuery = createListQueryMock([ride]);
    const countQuery = createCountQueryMock([{ count: 1 }]);
    const select = jest
      .fn()
      .mockReturnValueOnce(listQuery)
      .mockReturnValueOnce(countQuery);
    const repository = new RideReadRepository(
      {
        db: { select },
        schema: { rides, clients },
      } as never,
      new RideCursorService(),
    );

    const result = await repository.findArchived('user-1', 20);

    expect(select).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        archivedAt: rides.archivedAt,
        archivedBy: rides.archivedBy,
        archiveReason: rides.archiveReason,
      }),
    );
    expect(result).toEqual({
      rides: [ride],
      total: 1,
      nextCursor: undefined,
      hasNextPage: false,
    });
  });
});
