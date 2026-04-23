/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument -- Drizzle is consumed through a dialect-agnostic runtime boundary in this repository. */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, sql, desc, count, asc, ne } from 'drizzle-orm';
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

  private getExecutor(executor?: any) {
    return executor ?? this.db;
  }

  findByClient(
    clientId: string,
    userId: string,
    status?: 'UNUSED' | 'PARTIALLY_USED' | 'USED',
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

  async findOne(
    paymentId: string,
    userId: string,
    executor?: any,
  ): Promise<ClientPayment | undefined> {
    const results = await this.getExecutor(executor)
      .select()
      .from(this.schema.clientPayments)
      .where(
        and(
          eq(this.schema.clientPayments.id, paymentId),
          eq(this.schema.clientPayments.userId, userId),
        ),
      )
      .limit(1);

    return results[0];
  }

  async findByIdempotencyKey(
    clientId: string,
    userId: string,
    idempotencyKey: string,
    executor?: any,
  ): Promise<ClientPayment | undefined> {
    const results = await this.getExecutor(executor)
      .select()
      .from(this.schema.clientPayments)
      .where(
        and(
          eq(this.schema.clientPayments.clientId, clientId),
          eq(this.schema.clientPayments.userId, userId),
          eq(this.schema.clientPayments.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    return results[0];
  }

  async create(
    data: CreateClientPaymentDto,
    executor?: any,
  ): Promise<ClientPayment> {
    const results = await this.getExecutor(executor)
      .insert(this.schema.clientPayments)
      .values({
        ...data,
        id: data.id || randomUUID(),
      } as any)
      .returning();

    return results[0];
  }

  async markAsUsed(
    clientId: string,
    userId: string,
    executor?: any,
  ): Promise<void> {
    await this.getExecutor(executor)
      .update(this.schema.clientPayments)
      .set({ status: 'USED', remainingAmount: 0 })
      .where(
        and(
          eq(this.schema.clientPayments.clientId, clientId),
          eq(this.schema.clientPayments.userId, userId),
          ne(this.schema.clientPayments.status, 'USED'),
        ),
      );
  }

  findSettlementPaymentsByClient(
    clientId: string,
    userId: string,
    executor?: any,
  ): Promise<ClientPayment[]> {
    return this.getExecutor(executor)
      .select()
      .from(this.schema.clientPayments)
      .where(
        and(
          eq(this.schema.clientPayments.clientId, clientId),
          eq(this.schema.clientPayments.userId, userId),
        ),
      )
      .orderBy(
        asc(this.schema.clientPayments.paymentDate),
        asc(this.schema.clientPayments.createdAt),
        asc(this.schema.clientPayments.id),
      );
  }

  async updateFinancialState(
    paymentId: string,
    userId: string,
    data: Pick<ClientPayment, 'remainingAmount' | 'status'>,
    executor?: any,
  ): Promise<ClientPayment> {
    const results = await this.getExecutor(executor)
      .update(this.schema.clientPayments)
      .set(data as any)
      .where(
        and(
          eq(this.schema.clientPayments.id, paymentId),
          eq(this.schema.clientPayments.userId, userId),
        ),
      )
      .returning();

    return results[0];
  }

  async getUnusedPaymentsStats(
    clientId: string,
    userId: string,
    executor?: any,
  ): Promise<{ totalPaid: number; unusedPaymentsCount: number }> {
    const result = await this.getExecutor(executor)
      .select({
        total: sql<number>`SUM(${this.schema.clientPayments.remainingAmount})`,
        count: count(),
      })
      .from(this.schema.clientPayments)
      .where(
        and(
          eq(this.schema.clientPayments.clientId, clientId),
          eq(this.schema.clientPayments.userId, userId),
          ne(this.schema.clientPayments.status, 'USED'),
        ),
      );

    return {
      totalPaid: Number(result[0]?.total || 0),
      unusedPaymentsCount: result[0]?.count || 0,
    };
  }
}
