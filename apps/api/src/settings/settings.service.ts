import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '@mdc/database';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class SettingsService {
    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
    ) { }

    async getRidePresets(userId: string) {
        const presets = await this.db
            .select()
            .from(schema.ridePresets)
            .where(eq(schema.ridePresets.userId, userId));

        // Se não tiver nenhum preset, cria os padrões
        if (presets.length === 0) {
            return this.seedDefaultPresets(userId);
        }

        return presets;
    }

    async seedDefaultPresets(userId: string) {
        const defaults = [
            { label: 'Centro', value: 5.00, location: 'Centro' },
            { label: 'Bairro A', value: 7.00, location: 'Bairro A' },
            { label: 'Bairro B', value: 10.00, location: 'Bairro B' },
            { label: 'Shopping', value: 12.00, location: 'Shopping' },
        ];

        const created = [];
        for (const item of defaults) {
            const res = await this.db
                .insert(schema.ridePresets)
                .values({
                    id: randomUUID(),
                    userId,
                    ...item,
                })
                .returning();
            created.push(res[0]);
        }

        return created;
    }

    async createRidePreset(userId: string, data: { label: string, value: number, location: string }) {
        return this.db
            .insert(schema.ridePresets)
            .values({
                id: randomUUID(),
                userId,
                ...data,
            })
            .returning();
    }

    async deleteRidePreset(userId: string, id: string) {
        return this.db
            .delete(schema.ridePresets)
            .where(and(eq(schema.ridePresets.id, id), eq(schema.ridePresets.userId, userId)));
    }

    async updateRidePreset(userId: string, id: string, data: Partial<{ label: string, value: number, location: string }>) {
        return this.db
            .update(schema.ridePresets)
            .set(data)
            .where(and(eq(schema.ridePresets.id, id), eq(schema.ridePresets.userId, userId)))
            .returning();
    }
}
