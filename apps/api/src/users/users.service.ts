import { Injectable, Inject } from '@nestjs/common';
import {
  IUsersRepository,
  CreateUserDto,
  UpdateUserDto,
} from './interfaces/users-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(IUsersRepository)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async create(data: any) {
    return this.usersRepository.create(data as CreateUserDto);
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async remove(id: string) {
    return this.usersRepository.remove(id);
  }

  async update(id: string, data: UpdateUserDto) {
    return this.usersRepository.update(id, data);
  }
}
