import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../apps/api/.env' });

const isPostgres = process.env.DB_PROVIDER === 'postgres';

export default defineConfig({
    schema: './schema.ts',
    out: isPostgres ? './drizzle/postgres' : './drizzle/sqlite',
    dialect: isPostgres ? 'postgresql' : 'turso',
    dbCredentials: isPostgres ? {
        url: process.env.DATABASE_URL!,
    } : {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_AUTH_TOKEN,
    },
});
