import { users } from '@mdc/database';

export type User = typeof users.$inferSelect;
export type CreateUserDto = typeof users.$inferInsert;
export type UpdateUserDto = Partial<CreateUserDto>;

export const IUsersRepository = Symbol('IUsersRepository');

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  create(data: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserDto): Promise<void>;
  remove(id: string): Promise<void>;
}
