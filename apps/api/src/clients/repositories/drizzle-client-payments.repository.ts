import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';

import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleClient } from '../../database/database.provider';
import {
  IClientPaymentsRepository,
  ClientPayment,
  CreateClientPaymentDto,
} from '../interfaces/client-payments-repository.interface';

@Injectable()
export class DrizzleClientPaymentsRepository implements IClientPaymentsRepository {
  private readonly logger = new Logger(DrizzleClientPaymentsRepository.name);

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

  async findByClient(
    clientId: string,
    userId: string,
    status?: 'UNUSED' | 'USED',
  ): Promise<ClientPayment[]> {
    const conditions = [
      eq(this.schema.clientPayments.clientId, clientId),
      eq(this.schema.clientPayments.userId, userId),
    ];

    if (status) {
      conditions.push(eq(this.schema.clientPayments.status, status));
    }

    return this.db
      .select()
      .from(this.schema.clientPayments)
      .where(and(...conditions))
      .orderBy(desc(this.schema.clientPayments.createdAt));
  }

  async create(data: CreateClientPaymentDto): Promise<ClientPayment> {
    const results = await this.db
      .insert(this.schema.clientPayments)
      .values({
        ...data,
        id: data.id || randomUUID(),
      } as any)
      .returning();

    return results[0];
  }

  async markAsUsed(clientId: string, userId: string): Promise<void> {
    await this.db
      .update(this.schema.clientPayments)
      .set({ status: 'USED' })
      .where(
        and(
          eq(this.schema.clientPayments.clientId, clientId),
          eq(this.schema.clientPayments.userId, userId),
          eq(this.schema.clientPayments.status, 'UNUSED'),
        ),
      );
  }

  async getUnusedPaymentsStats(clientId: string, userId: string): Promise<{ totalPaid: number; unusedPaymentsCount: number }> {
    const result = await this.db
      .select({
        total: sql<number>`SUM(${this.schema.clientPayments.amount})`,
        count: count()
      })
      .from(this.schema.clientPayments)
      .where(
        and(
          eq(this.schema.clientPayments.clientId, clientId),
          eq(this.schema.clientPayments.userId, userId),
          eq(this.schema.clientPayments.status, 'UNUSED')
        )
      );

    return {
      totalPaid: Number(result[0]?.total || 0),
      unusedPaymentsCount: result[0]?.count || 0,
    };
  }
}

