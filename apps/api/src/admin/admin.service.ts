import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '@mdc/database';
import { count, eq, desc, ne } from 'drizzle-orm';
import { AbacatePayProvider } from '../payments/providers/abacatepay.provider';
import { PAYMENT_PROVIDER } from '../payments/providers/payment-provider.interface';

@Injectable()
export class AdminService {
    private readonly adminEmail = 'admin@mdc.com';

    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
        @Inject(PAYMENT_PROVIDER)
        private abacatePay: AbacatePayProvider,
    ) { }

    async getStats() {
        // Exclui o próprio admin das estatísticas
        const [usersCount] = await this.db.select({ value: count() }).from(schema.users).where(ne(schema.users.email, this.adminEmail));
        const [activeSubscriptions] = await this.db
            .select({ value: count() })
            .from(schema.subscriptions)
            .innerJoin(schema.users, eq(schema.users.id, schema.subscriptions.userId))
            .where(eq(schema.subscriptions.status, 'active'));
        // Note: admin@mdc.com won't have a record in subscriptions table if we fix Auth login

        // Pegar receita dos últimos 30 dias do AbacatePay
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const revenueData = await this.abacatePay.getRevenue(startDate, endDate);

        return {
            totalUsers: usersCount.value,
            activeSubscriptions: activeSubscriptions.value,
            revenue30d: revenueData?.total || 0,
        };
    }

    async getRecentUsers(page: number = 1, limit: number = 10) {
        const offset = (page - 1) * limit;

        const [totalCount] = await this.db.select({ value: count() }).from(schema.users).where(ne(schema.users.email, this.adminEmail));
        const totalPages = Math.ceil(totalCount.value / limit);

        const users = await this.db
            .select({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
                role: schema.users.role,
                createdAt: schema.users.createdAt,
                plan: schema.subscriptions.plan,
            })
            .from(schema.users)
            .leftJoin(schema.subscriptions, eq(schema.users.id, schema.subscriptions.userId))
            .where(ne(schema.users.email, this.adminEmail))
            .orderBy(desc(schema.users.createdAt))
            .limit(limit)
            .offset(offset);

        return {
            data: users,
            meta: {
                total: totalCount.value,
                page,
                limit,
                totalPages,
            },
        };
    }

    async deleteUser(id: string) {
        return this.db.delete(schema.users).where(eq(schema.users.id, id));
    }
}
