import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../../database/database.provider';
import * as schema from '@mdc/database';
import { eq, and, gt, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class RefreshTokenService {
    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
    ) { }

    async create(userId: string) {
        const token = randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias de validade

        await this.db.insert(schema.refreshTokens).values({
            id: randomUUID(),
            token,
            userId,
            expiresAt,
        });

        return token;
    }

    async validate(token: string) {
        const results = await this.db
            .select()
            .from(schema.refreshTokens)
            .where(
                and(
                    eq(schema.refreshTokens.token, token),
                    gt(schema.refreshTokens.expiresAt, new Date())
                )
            )
            .limit(1);

        const refreshToken = results[0];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token inválido ou expirado');
        }

        return refreshToken;
    }

    async revoke(token: string) {
        await this.db
            .delete(schema.refreshTokens)
            .where(eq(schema.refreshTokens.token, token));
    }

    async cleanupExpiredTokens() {
        return this.db
            .delete(schema.refreshTokens)
            .where(lte(schema.refreshTokens.expiresAt, new Date()));
    }
}
