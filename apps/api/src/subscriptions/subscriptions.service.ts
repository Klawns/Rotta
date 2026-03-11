import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '@mdc/database';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class SubscriptionsService {
    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
    ) { }

    async findByUserId(userId: string) {
        const results = await this.db
            .select()
            .from(schema.subscriptions)
            .where(eq(schema.subscriptions.userId, userId))
            .limit(1);
        return results[0];
    }

    async incrementRideCount(userId: string) {
        return this.db
            .update(schema.subscriptions)
            .set({
                rideCount: sql`${schema.subscriptions.rideCount} + 1`,
                updatedAt: new Date(),
            } as any)
            .where(eq(schema.subscriptions.userId, userId))
            .returning();
    }

    async updateOrCreate(userId: string, plan: 'starter' | 'premium' | 'lifetime') {
        console.log(`[Subscription] Iniciando atualização de plano. User: ${userId}, Plan: ${plan}`);
        const existing = await this.db
            .select()
            .from(schema.subscriptions)
            .where(eq(schema.subscriptions.userId, userId))
            .limit(1);

        let validUntil: Date | null = null;

        if (plan === 'premium') {
            const now = new Date();
            const currentValidUntil = existing[0]?.validUntil;

            // Se já tiver uma data de validade futura, soma +30 dias nela.
            // Senha, soma +30 dias a partir de agora.
            const baseDate = (currentValidUntil && currentValidUntil > now) ? currentValidUntil : now;
            validUntil = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else if (plan === 'lifetime') {
            validUntil = null;
        }

        if (existing.length > 0) {
            return this.db
                .update(schema.subscriptions)
                .set({
                    plan,
                    status: 'active',
                    validUntil,
                    updatedAt: new Date(),
                } as any)
                .where(eq(schema.subscriptions.userId, userId))
                .returning();
        }

        return this.db
            .insert(schema.subscriptions)
            .values({
                id: randomUUID(),
                userId,
                plan,
                status: 'active',
                validUntil,
            } as any)
            .returning();
    }
}
