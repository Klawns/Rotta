import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '@mdc/database';
import { eq, and, gte, lte, sql, desc, or, like } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class RidesService {
    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
        private subscriptionsService: SubscriptionsService,
    ) { }

    async findAll(
        userId: string,
        limit?: number,
        offset?: number,
        filters?: {
            status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
            paymentStatus?: 'PENDING' | 'PAID';
            clientId?: string;
            startDate?: Date;
            endDate?: Date;
            search?: string;
        }
    ) {
        const conditions = [eq(schema.rides.userId, userId)];

        if (filters?.status) conditions.push(eq(schema.rides.status, filters.status));
        if (filters?.paymentStatus) conditions.push(eq(schema.rides.paymentStatus, filters.paymentStatus));
        if (filters?.clientId && filters.clientId !== 'all') conditions.push(eq(schema.rides.clientId, filters.clientId));
        if (filters?.startDate) conditions.push(gte(schema.rides.rideDate, filters.startDate));
        if (filters?.endDate) conditions.push(lte(schema.rides.rideDate, filters.endDate));

        if (filters?.search) {
            const searchCondition = or(
                like(schema.clients.name, `%${filters.search}%`),
                like(schema.rides.notes, `%${filters.search}%`),
                like(schema.rides.location, `%${filters.search}%`)
            );
            if (searchCondition) conditions.push(searchCondition);
        }

        const query = this.db
            .select({
                id: schema.rides.id,
                value: schema.rides.value,
                notes: schema.rides.notes,
                status: schema.rides.status,
                paymentStatus: schema.rides.paymentStatus,
                rideDate: schema.rides.rideDate,
                createdAt: schema.rides.createdAt,
                location: schema.rides.location,
                client: {
                    id: schema.clients.id,
                    name: schema.clients.name
                }
            })
            .from(schema.rides)
            .leftJoin(schema.clients, eq(schema.rides.clientId, schema.clients.id))
            .where(and(...conditions))
            .orderBy(desc(schema.rides.rideDate), desc(schema.rides.createdAt));

        if (limit !== undefined) query.limit(limit);
        if (offset !== undefined) query.offset(offset);

        // Count query for total filtered results
        const countQuery = this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.rides)
            .where(and(...conditions));

        const [results, countResult] = await Promise.all([
            query,
            countQuery
        ]);

        return {
            rides: results,
            total: Number(countResult[0]?.count || 0)
        };
    }

    async create(userId: string, data: {
        clientId: string;
        value: number;
        location: string;
        notes?: string;
        status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
        paymentStatus?: 'PENDING' | 'PAID';
        rideDate?: Date;
    }) {
        const sub = await this.subscriptionsService.findByUserId(userId);

        if (!sub) {
            throw new ForbiddenException('Plano não encontrado.');
        }

        if (sub.plan === 'starter') {
            const currentRides = await this.countAll(userId);
            if (currentRides >= 20) {
                throw new ForbiddenException('Limite de 20 corridas do plano gratuito atingido. Faça o upgrade para continuar.');
            }
        }

        const results = await this.db
            .insert(schema.rides)
            .values({
                id: randomUUID(),
                clientId: data.clientId,
                value: data.value,
                location: data.location,
                notes: data.notes,
                status: data.status || 'COMPLETED',
                paymentStatus: data.paymentStatus || 'PAID',
                rideDate: data.rideDate || new Date(),
                userId,
            })
            .returning();

        if (results[0]) {
            await this.subscriptionsService.incrementRideCount(userId);
        }

        return results[0];
    }

    async updateStatus(userId: string, id: string, data: {
        status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
        paymentStatus?: 'PENDING' | 'PAID';
    }) {
        const results = await this.db
            .update(schema.rides)
            .set({
                ...data,
            })
            .where(and(eq(schema.rides.id, id), eq(schema.rides.userId, userId)))
            .returning();

        return results[0];
    }

    async getFrequentClients(userId: string) {
        const results = await this.db
            .select({
                id: schema.clients.id,
                name: schema.clients.name,
                rideCount: sql<number>`count(${schema.rides.id})`,
            })
            .from(schema.clients)
            .innerJoin(schema.rides, eq(schema.clients.id, schema.rides.clientId))
            .where(eq(schema.clients.userId, userId))
            .groupBy(schema.clients.id)
            .orderBy(desc(sql`count(${schema.rides.id})`))
            .limit(5);

        return results;
    }

    async update(userId: string, id: string, data: {
        value?: number;
        location?: string;
        notes?: string;
        status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
        paymentStatus?: 'PENDING' | 'PAID';
        rideDate?: Date;
    }) {
        const results = await this.db
            .update(schema.rides)
            .set({
                ...data,
            })
            .where(and(eq(schema.rides.id, id), eq(schema.rides.userId, userId)))
            .returning();

        return results[0];
    }

    async countAll(userId: string) {
        const result = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.rides)
            .where(eq(schema.rides.userId, userId));

        return result[0].count;
    }

    async delete(userId: string, id: string) {
        return this.db
            .delete(schema.rides)
            .where(and(eq(schema.rides.id, id), eq(schema.rides.userId, userId)));
    }

    async findByClient(userId: string, clientId: string, limit?: number, offset?: number) {
        const query = this.db
            .select()
            .from(schema.rides)
            .where(and(eq(schema.rides.userId, userId), eq(schema.rides.clientId, clientId)))
            .orderBy(desc(schema.rides.rideDate), desc(schema.rides.createdAt));

        if (limit !== undefined) query.limit(limit);
        if (offset !== undefined) query.offset(offset);

        // Count for client specific ride history
        const countQuery = this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.rides)
            .where(and(eq(schema.rides.userId, userId), eq(schema.rides.clientId, clientId)));

        const [results, countResult] = await Promise.all([
            query,
            countQuery
        ]);

        return {
            rides: results,
            total: Number(countResult[0]?.count || 0)
        };
    }

    async getStats(userId: string, start: Date, end: Date, clientId?: string) {
        const conditions = [
            eq(schema.rides.userId, userId),
            gte(schema.rides.createdAt, start),
            lte(schema.rides.createdAt, end)
        ];

        if (clientId && clientId !== 'all') {
            conditions.push(eq(schema.rides.clientId, clientId));
        }

        const results = await this.db
            .select({
                id: schema.rides.id,
                value: schema.rides.value,
                notes: schema.rides.notes,
                status: schema.rides.status,
                paymentStatus: schema.rides.paymentStatus,
                rideDate: schema.rides.rideDate,
                createdAt: schema.rides.createdAt,
                location: schema.rides.location,
                client: {
                    id: schema.clients.id,
                    name: schema.clients.name
                }
            })
            .from(schema.rides)
            .leftJoin(schema.clients, eq(schema.rides.clientId, schema.clients.id))
            .where(and(...conditions));

        const totalValue = results.reduce((acc, ride) => acc + (ride.value || 0), 0);
        const count = results.length;

        return {
            count,
            totalValue,
            rides: results
        };
    }
}
