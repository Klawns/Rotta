import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleClient } from '../../database/database.provider';
import {
  IUsersRepository,
  User,
  CreateUserDto,
  UpdateUserDto,
} from '../interfaces/users-repository.interface';

@Injectable()
export class DrizzleUsersRepository implements IUsersRepository {
  private readonly logger = new Logger(DrizzleUsersRepository.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleClient,
  ) {}

  private get db() {
    return this.drizzle.db;
  }

  private get schema() {
    return this.drizzle.schema;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(this.schema.users)
      .where(eq(this.schema.users.email, email))
      .limit(1);

    return results[0];
  }

  async findById(id: string): Promise<User | undefined> {
    const results = await this.db
      .select()
      .from(this.schema.users)
      .where(eq(this.schema.users.id, id))
      .limit(1);

    return results[0];
  }

  async create(data: CreateUserDto): Promise<User> {
    const role = data.role || 'user';

    const results = await this.db
      .insert(this.schema.users)
      .values({
        ...data,
        id: data.id || randomUUID(),
        role: role,
      } as any)
      .returning();

    return results[0];
  }

  async findAll(): Promise<User[]> {
    return this.db.select().from(this.schema.users);
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    await this.db.update(this.schema.users).set(data).where(eq(this.schema.users.id, id));
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(this.schema.users).where(eq(this.schema.users.id, id));
  }
}
