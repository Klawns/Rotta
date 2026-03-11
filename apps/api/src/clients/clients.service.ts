import { Injectable, Inject } from '@nestjs/common';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '@mdc/database';
import { eq, and, like, sql, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class ClientsService {
    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
    ) { }

    async findAll(userId: string, limit?: number, offset?: number, search?: string) {
        const conditions = [eq(schema.clients.userId, userId)];

        if (search) {
            conditions.push(like(schema.clients.name, `%${search}%`));
        }

        const query = this.db
            .select()
            .from(schema.clients)
            .where(and(...conditions))
            .orderBy(desc(schema.clients.createdAt));

        if (limit !== undefined) query.limit(limit);
        if (offset !== undefined) query.offset(offset);

        // Count for all/filtered clients
        const countQuery = this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.clients)
            .where(and(...conditions));

        const [results, countResult] = await Promise.all([
            query,
            countQuery
        ]);

        return {
            clients: results,
            total: Number(countResult[0]?.count || 0)
        };
    }

    async create(userId: string, data: { name: string }) {
        const results = await this.db
            .insert(schema.clients)
            .values({
                id: randomUUID(),
                name: data.name,
                userId,
            })
            .returning();

        return results[0];
    }

    async findOne(userId: string, id: string) {
        const results = await this.db
            .select()
            .from(schema.clients)
            .where(and(eq(schema.clients.id, id), eq(schema.clients.userId, userId)))
            .limit(1);

        return results[0];
    }

    async delete(userId: string, id: string) {
        return this.db
            .delete(schema.clients)
            .where(and(eq(schema.clients.id, id), eq(schema.clients.userId, userId)));
    }
}
