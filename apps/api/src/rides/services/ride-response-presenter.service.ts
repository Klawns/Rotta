import { Injectable } from '@nestjs/common';
import type { RideResponseDto } from '../dto/ride-response.dto';
import type {
  Ride,
  RideWithClient,
} from '../interfaces/rides-repository.interface';
import { RideMapper } from '../mappers/ride.mapper';
import { RidePhotoReferenceService } from './ride-photo-reference.service';

@Injectable()
export class RideResponsePresenterService {
  constructor(
    private readonly ridePhotoReferenceService: RidePhotoReferenceService,
  ) {}

  async present(entity: Ride | RideWithClient): Promise<RideResponseDto> {
    const dto = RideMapper.toHttp(entity);

    return this.presentMapped(dto);
  }

  async presentList(
    entities: (Ride | RideWithClient)[],
  ): Promise<RideResponseDto[]> {
    return Promise.all(entities.map((entity) => this.present(entity)));
  }

  async presentMapped(dto: RideResponseDto): Promise<RideResponseDto> {
    return {
      ...dto,
      photo: await this.ridePhotoReferenceService.resolveForResponse(dto.photo),
    };
  }

  async presentMappedList(dtos: RideResponseDto[]): Promise<RideResponseDto[]> {
    return Promise.all(dtos.map((dto) => this.presentMapped(dto)));
  }
}
