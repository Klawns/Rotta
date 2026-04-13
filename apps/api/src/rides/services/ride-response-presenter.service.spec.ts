import { RideResponsePresenterService } from './ride-response-presenter.service';
import type { RideResponseDto } from '../dto/ride-response.dto';

describe('RideResponsePresenterService', () => {
  let service: RideResponsePresenterService;
  let ridePhotoReferenceService: {
    resolveForResponse: jest.Mock;
  };

  beforeEach(() => {
    ridePhotoReferenceService = {
      resolveForResponse: jest.fn(),
    };

    service = new RideResponsePresenterService(
      ridePhotoReferenceService as never,
    );
  });

  function createRideResponseDto(
    overrides: Partial<RideResponseDto> = {},
  ): RideResponseDto {
    return {
      id: 'ride-1',
      value: 25,
      notes: null,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      rideDate: new Date('2026-04-03T10:00:00.000Z').toISOString(),
      createdAt: new Date('2026-04-03T10:00:00.000Z').toISOString(),
      paidWithBalance: 0,
      debtValue: 0,
      location: 'Centro',
      photo: null,
      client: {
        id: 'client-1',
        name: 'Alice',
      },
      ...overrides,
    };
  }

  it('resolves the photo field while preserving the remaining mapped response data', async () => {
    const dto = createRideResponseDto({
      photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    });
    ridePhotoReferenceService.resolveForResponse.mockResolvedValue(
      'https://signed.example.com/ride-photo',
    );

    await expect(service.presentMapped(dto)).resolves.toEqual({
      ...dto,
      photo: 'https://signed.example.com/ride-photo',
    });

    expect(ridePhotoReferenceService.resolveForResponse).toHaveBeenCalledWith(
      dto.photo,
    );
  });

  it('keeps the response contract stable when photo resolution degrades to null', async () => {
    const dto = createRideResponseDto({
      photo: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    });
    ridePhotoReferenceService.resolveForResponse.mockResolvedValue(null);

    await expect(service.presentMapped(dto)).resolves.toEqual({
      ...dto,
      photo: null,
    });
  });
});
