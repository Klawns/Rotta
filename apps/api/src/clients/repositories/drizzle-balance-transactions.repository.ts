import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleClient } from '../../database/database.provider';
import {
  IBalanceTransactionsRepository,
  BalanceTransaction,
  CreateBalanceTransactionDto,
} from '../interfaces/balance-transactions-repository.interface';

@Injectable()
export class DrizzleBalanceTransactionsRepository implements IBalanceTransactionsRepository {
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

  async create(data: CreateBalanceTransactionDto): Promise<BalanceTransaction> {
    const results = await this.db
      .insert(this.schema.balanceTransactions)
      .values(data as any)
      .returning();

    return results[0];
  }

  async findByClient(clientId: string, userId: string): Promise<BalanceTransaction[]> {
    return this.db
      .select()
      .from(this.schema.balanceTransactions)
      .where(
        and(
          eq(this.schema.balanceTransactions.clientId, clientId),
          eq(this.schema.balanceTransactions.userId, userId),
        ),
      )
      .orderBy(desc(this.schema.balanceTransactions.createdAt));
  }
}

