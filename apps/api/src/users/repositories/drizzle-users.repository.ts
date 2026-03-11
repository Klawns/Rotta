import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as schema from '@mdc/database';

import { DRIZZLE } from '../../database/database.provider';
import {
  IUsersRepository,
  User,
  CreateUserDto,
  UpdateUserDto,
} from '../interfaces/users-repository.interface';

@Injectable()
export class DrizzleUsersRepository implements IUsersRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: LibSQLDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return results[0];
  }

  async findById(id: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return results[0];
  }

  async create(data: CreateUserDto): Promise<User> {
    const role = data.role || 'user';

    const results = await this.db
      .insert(schema.users)
      .values({
        ...data,
        id: data.id || randomUUID(),
        role: role,
      } as any)
      .returning();

    return results[0];
  }

  async findAll(): Promise<User[]> {
    return this.db.select().from(schema.users);
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    await this.db.update(schema.users).set(data).where(eq(schema.users.id, id));
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(schema.users).where(eq(schema.users.id, id));
  }
}
