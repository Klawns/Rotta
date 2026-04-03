import type {
  Client,
  ClientDirectoryEntry,
} from '../interfaces/clients-repository.interface';

export interface ClientResponseDto {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  isPinned: boolean;
  balance: number;
  createdAt: Date;
}

export interface ClientDirectoryResponseDto {
  id: string;
  name: string;
  isPinned: boolean;
}

export class ClientMapper {
  static toHttp(entity: Client): ClientResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      phone: entity.phone ?? null,
      address: entity.address ?? null,
      isPinned: !!entity.isPinned,
      balance: Number(entity.balance) || 0,
      createdAt: new Date(entity.createdAt),
    };
  }

  static toHttpList(entities: Client[]): ClientResponseDto[] {
    return entities.map((entity) => ClientMapper.toHttp(entity));
  }

  static toHttpDirectory(
    entity: ClientDirectoryEntry,
  ): ClientDirectoryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      isPinned: !!entity.isPinned,
    };
  }

  static toHttpDirectoryList(
    entities: ClientDirectoryEntry[],
  ): ClientDirectoryResponseDto[] {
    return entities.map((entity) => ClientMapper.toHttpDirectory(entity));
  }
}
