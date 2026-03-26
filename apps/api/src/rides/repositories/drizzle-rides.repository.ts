import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { eq, and, gte, lte, sql, desc, or, like, ne, lt } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleClient } from '../../database/database.provider';
import {
  IRidesRepository,
  FindAllFilters,
  Ride,
  RideWithClient,
  CreateRideDto,
  UpdateRideDto,
} from '../interfaces/rides-repository.interface';

@Injectable()
export class DrizzleRidesRepository implements IRidesRepository {
  private readonly logger = new Logger(DrizzleRidesRepository.name);

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

  async findAll(
    userId: string,
    limit: number = 20,
    cursor?: string,
    filters?: FindAllFilters,
  ): Promise<{ rides: RideWithClient[]; total: number; nextCursor?: string; hasMore: boolean }> {
    const conditions = [eq(this.schema.rides.userId, userId)];

    if (filters?.status)
      conditions.push(eq(this.schema.rides.status, filters.status));
    if (filters?.paymentStatus)
      conditions.push(eq(this.schema.rides.paymentStatus, filters.paymentStatus));
    if (filters?.clientId && filters.clientId !== 'all')
      conditions.push(eq(this.schema.rides.clientId, filters.clientId));
    if (filters?.startDate)
      conditions.push(gte(this.schema.rides.rideDate, filters.startDate));
    if (filters?.endDate)
      conditions.push(lte(this.schema.rides.rideDate, filters.endDate));

    if (filters?.search) {
      const searchCondition = or(
        like(this.schema.clients.name, `%${filters.search}%`),
        like(this.schema.rides.notes, `%${filters.search}%`),
        like(this.schema.rides.location, `%${filters.search}%`),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (cursor) {
      try {
        const decodedString = Buffer.from(cursor, 'base64').toString('utf-8');
        const parsedCursor = JSON.parse(decodedString);

        if (!parsedCursor.rideDate || !parsedCursor.createdAt || !parsedCursor.id) {
          throw new Error('Invalid cursor payload structure');
        }

        const cursorRideDate = new Date(parsedCursor.rideDate);
        const cursorCreatedAt = new Date(parsedCursor.createdAt);

        this.logger.debug(`Cursor recebido descodificado: rideDate=${parsedCursor.rideDate}, createdAt=${parsedCursor.createdAt}, id=${parsedCursor.id}`);

        const cursorCondition = or(
          lt(this.schema.rides.rideDate, cursorRideDate),
          and(
            eq(this.schema.rides.rideDate, cursorRideDate),
            lt(this.schema.rides.createdAt, cursorCreatedAt)
          ),
          and(
            eq(this.schema.rides.rideDate, cursorRideDate),
            eq(this.schema.rides.createdAt, cursorCreatedAt),
            lt(this.schema.rides.id, parsedCursor.id)
          )
        );

        if (cursorCondition) {
          conditions.push(cursorCondition);
        }
      } catch (err: any) {
        this.logger.error(`Falha ao decodificar cursor: ${cursor}`, err.stack);
        throw new BadRequestException('Parâmetro cursor inválido ou malformado.');
      }
    }

    const query = this.db
      .select({
        id: this.schema.rides.id,
        value: this.schema.rides.value,
        notes: this.schema.rides.notes,
        status: this.schema.rides.status,
        paymentStatus: this.schema.rides.paymentStatus,
        paidWithBalance: this.schema.rides.paidWithBalance,
        debtValue: this.schema.rides.debtValue,
        rideDate: this.schema.rides.rideDate,
        createdAt: this.schema.rides.createdAt,
        location: this.schema.rides.location,
        photo: this.schema.rides.photo,
        client: {
          id: this.schema.clients.id,
          name: this.schema.clients.name,
        },
      })
      .from(this.schema.rides)
      .leftJoin(this.schema.clients, eq(this.schema.rides.clientId, this.schema.clients.id))
      .where(and(...conditions))
      .orderBy(
        desc(this.schema.rides.rideDate),
        desc(this.schema.rides.createdAt),
        desc(this.schema.rides.id),
      )
      .limit(limit + 1); // Buscamos um a mais para saber se tem próxima página

    const countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.schema.rides)
      .where(and(...conditions));

    const [results, countResult] = await Promise.all([query, countQuery]);

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    
    let nextCursorHash: string | undefined;
    if (hasMore) {
      const lastItem = items[items.length - 1]; // Baseado exclusivamente no último item real retornado
      const nextCursorData = {
        rideDate: lastItem.rideDate?.toISOString() ?? new Date().toISOString(),
        createdAt: lastItem.createdAt?.toISOString() ?? new Date().toISOString(),
        id: lastItem.id,
      };
      nextCursorHash = Buffer.from(JSON.stringify(nextCursorData)).toString('base64');
      this.logger.debug(`Gerou próximo cursor (Base64): ${nextCursorHash} originado do ID: ${lastItem.id}`);
    }

    return {
      rides: items as RideWithClient[],
      total: Number(countResult[0]?.count || 0),
      nextCursor: nextCursorHash,
      hasMore
    };
  }

  async create(data: CreateRideDto): Promise<Ride> {
    const results = await this.db
      .insert(this.schema.rides)
      .values(data as any)
      .returning();

    return results[0];
  }

  async updateStatus(
    userId: string,
    id: string,
    data: {
      status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
      paymentStatus?: 'PENDING' | 'PAID';
    },
  ): Promise<Ride> {
    const results = await this.db
      .update(this.schema.rides)
      .set(data)
      .where(and(eq(this.schema.rides.id, id), eq(this.schema.rides.userId, userId)))
      .returning();

    return results[0];
  }

  async getFrequentClients(userId: string) {
    const results = await this.db
      .select({
        id: this.schema.clients.id,
        name: this.schema.clients.name,
        isPinned: this.schema.clients.isPinned,
      })
      .from(this.schema.clients)
      .where(
        and(
          eq(this.schema.clients.userId, userId),
          eq(this.schema.clients.isPinned, true),
        ),
      )
      .orderBy(desc(this.schema.clients.createdAt))
      .limit(10);

    return results;
  }

  async update(userId: string, id: string, data: UpdateRideDto): Promise<Ride> {
    const results = await this.db
      .update(this.schema.rides)
      .set(data as any)
      .where(and(eq(this.schema.rides.id, id), eq(this.schema.rides.userId, userId)))
      .returning();

    return results[0];
  }

  async countAll(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.schema.rides)
      .where(eq(this.schema.rides.userId, userId));

    return result[0].count;
  }

  async delete(userId: string, id: string): Promise<Ride | undefined> {
    const result = await this.db
      .delete(this.schema.rides)
      .where(and(eq(this.schema.rides.id, id), eq(this.schema.rides.userId, userId)))
      .returning();

    return result[0];
  }

  async findByClient(
    userId: string,
    clientId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ rides: Ride[]; total: number; nextCursor?: string; hasMore: boolean }> {
    const conditions = [
      eq(this.schema.rides.userId, userId),
      eq(this.schema.rides.clientId, clientId),
    ];

    if (cursor) {
      try {
        const decodedString = Buffer.from(cursor, 'base64').toString('utf-8');
        const parsedCursor = JSON.parse(decodedString);

        if (!parsedCursor.rideDate || !parsedCursor.createdAt || !parsedCursor.id) {
          throw new Error('Invalid cursor payload structure');
        }

        const cursorRideDate = new Date(parsedCursor.rideDate);
        const cursorCreatedAt = new Date(parsedCursor.createdAt);

        const cursorCondition = or(
          lt(this.schema.rides.rideDate, cursorRideDate),
          and(
            eq(this.schema.rides.rideDate, cursorRideDate),
            lt(this.schema.rides.createdAt, cursorCreatedAt)
          ),
          and(
            eq(this.schema.rides.rideDate, cursorRideDate),
            eq(this.schema.rides.createdAt, cursorCreatedAt),
            lt(this.schema.rides.id, parsedCursor.id)
          )
        );

        if (cursorCondition) {
          conditions.push(cursorCondition);
        }
      } catch (err) {
        // Fallback for old simple-date cursors if they exist, or just throw
        this.logger.warn(`Failed to decode cursor for findByClient: ${cursor}. Using fallback.`);
        conditions.push(lt(this.schema.rides.createdAt, new Date(cursor)));
      }
    }

    const query = this.db
      .select()
      .from(this.schema.rides)
      .where(and(...conditions))
      .orderBy(
        desc(this.schema.rides.rideDate),
        desc(this.schema.rides.createdAt),
        desc(this.schema.rides.id),
      )
      .limit(limit + 1);

    const countQuery = this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.schema.rides)
      .where(and(...conditions));

    const [results, countResult] = await Promise.all([query, countQuery]);

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    
    let nextCursorHash: string | undefined;
    if (hasMore) {
      const lastItem = items[items.length - 1];
      const nextCursorData = {
        rideDate: lastItem.rideDate?.toISOString() ?? new Date().toISOString(),
        createdAt: lastItem.createdAt?.toISOString() ?? new Date().toISOString(),
        id: lastItem.id,
      };
      nextCursorHash = Buffer.from(JSON.stringify(nextCursorData)).toString('base64');
    }

    return {
      rides: items as Ride[],
      total: Number(countResult[0]?.count || 0),
      nextCursor: nextCursorHash,
      hasMore
    };
  }

  async getStats(
    userId: string,
    start: Date,
    end: Date,
    clientId?: string,
  ): Promise<{ count: number; totalValue: number; rides: RideWithClient[] }> {
    const conditions = [
      eq(this.schema.rides.userId, userId),
      gte(this.schema.rides.rideDate, start),
      lte(this.schema.rides.rideDate, end),
    ];

    if (clientId && clientId !== 'all') {
      conditions.push(eq(this.schema.rides.clientId, clientId));
    }

    // Busca agregados no SQL (muito mais rápido)
    const statsResult = await this.db
      .select({
        count: sql<number>`count(*)`,
        total: sql<number>`sum(${this.schema.rides.value})`,
      })
      .from(this.schema.rides)
      .where(and(...conditions));

    // Busca as corridas (limitamos a 50 para evitar sobrecarga no dashboard, 
    // já que o dashboard financeiro costuma exibir apenas o resumo ou as últimas)
    const results = await this.db
      .select({
        id: this.schema.rides.id,
        value: this.schema.rides.value,
        notes: this.schema.rides.notes,
        status: this.schema.rides.status,
        paymentStatus: this.schema.rides.paymentStatus,
        paidWithBalance: this.schema.rides.paidWithBalance,
        debtValue: this.schema.rides.debtValue,
        rideDate: this.schema.rides.rideDate,
        createdAt: this.schema.rides.createdAt,
        location: this.schema.rides.location,
        photo: this.schema.rides.photo,
        client: {
          id: this.schema.clients.id,
          name: this.schema.clients.name,
        },
      })
      .from(this.schema.rides)
      .leftJoin(this.schema.clients, eq(this.schema.rides.clientId, this.schema.clients.id))
      .where(and(...conditions))
      .orderBy(
        desc(this.schema.rides.rideDate),
        desc(this.schema.rides.createdAt),
      )
      .limit(50);

    return {
      count: Number(statsResult[0]?.count || 0),
      totalValue: Number(statsResult[0]?.total || 0),
      rides: results as RideWithClient[],
    };
  }

  async getPendingDebtStats(clientId: string, userId: string): Promise<{ totalDebt: number; pendingRidesCount: number }> {
    const result = await this.db
      .select({
        total: sql<number>`SUM(${this.schema.rides.value})`,
        count: sql<number>`COUNT(*)`
      })
      .from(this.schema.rides)
      .where(
        and(
          eq(this.schema.rides.clientId, clientId),
          eq(this.schema.rides.userId, userId),
          eq(this.schema.rides.paymentStatus, 'PENDING'),
          ne(this.schema.rides.status, 'CANCELLED')
        )
      );

    return {
      totalDebt: Number(result[0]?.total || 0),
      pendingRidesCount: Number(result[0]?.count || 0),
    };
  }

  async markAllAsPaidForClient(clientId: string, userId: string): Promise<number> {
    const result = await this.db
      .update(this.schema.rides)
      .set({ paymentStatus: 'PAID' })
      .where(
        and(
          eq(this.schema.rides.clientId, clientId),
          eq(this.schema.rides.userId, userId),
          eq(this.schema.rides.paymentStatus, 'PENDING'),
          ne(this.schema.rides.status, 'CANCELLED')
        )
      )
      .returning({ updatedId: this.schema.rides.id });
      
    return result.length;
  }

  async deleteAll(userId: string): Promise<void> {
    await this.db
      .delete(this.schema.rides)
      .where(eq(this.schema.rides.userId, userId));
  }
}
