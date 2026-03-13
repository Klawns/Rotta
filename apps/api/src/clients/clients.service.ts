import { Injectable, Inject } from '@nestjs/common';
import {
  IClientsRepository,
  CreateClientDto,
} from './interfaces/clients-repository.interface';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(IClientsRepository)
    private readonly clientsRepository: IClientsRepository,
  ) { }

  async findAll(
    userId: string,
    limit?: number,
    offset?: number,
    search?: string,
  ) {
    return this.clientsRepository.findAll(userId, limit, offset, search);
  }

  async create(userId: string, data: { name: string }) {
    return this.clientsRepository.create({
      userId,
      name: data.name,
    } as CreateClientDto);
  }

  async findOne(userId: string, id: string) {
    return this.clientsRepository.findOne(userId, id);
  }

  async update(userId: string, id: string, data: { name: string }) {
    return this.clientsRepository.update(userId, id, data);
  }

  async delete(userId: string, id: string) {
    return this.clientsRepository.delete(userId, id);
  }
}
