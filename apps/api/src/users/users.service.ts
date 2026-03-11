import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '@mdc/database';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
    ) { }

    async findByEmail(email: string) {
        const results = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);

        return results[0];
    }

    async findById(id: string) {
        const results = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .limit(1);

        return results[0];
    }

    async create(data: any) {
        const role = data.role || 'user';

        const results = await this.db
            .insert(schema.users)
            .values({
                id: randomUUID(),
                name: data.name,
                email: data.email,
                password: data.password,
                taxId: data.taxId,
                cellphone: data.cellphone,
                role: role as any,
            } as any)
            .returning();

        return results[0];
    }

    async findAll() {
        return this.db.select().from(schema.users);
    }

    async remove(id: string) {
        return this.db.delete(schema.users).where(eq(schema.users.id, id));
    }

    async update(id: string, data: Partial<typeof schema.users.$inferInsert>) {
        return this.db.update(schema.users).set(data).where(eq(schema.users.id, id));
    }
}
