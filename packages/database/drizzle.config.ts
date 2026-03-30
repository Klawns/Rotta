import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../apps/api/.env', quiet: true });

const provider = process.env.DRIZZLE_DB_PROVIDER ?? process.env.DB_PROVIDER ?? 'sqlite';
const databaseUrl = process.env.DRIZZLE_DATABASE_URL ?? process.env.DATABASE_URL;
const databaseAuthToken =
  process.env.DRIZZLE_DATABASE_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run Drizzle commands.');
}

const isPostgres = provider === 'postgres';

export default defineConfig({
  schema: './schema.ts',
  out: isPostgres ? './drizzle/postgres' : './drizzle/sqlite',
  dialect: isPostgres ? 'postgresql' : 'turso',
  dbCredentials: isPostgres
    ? {
        url: databaseUrl,
      }
    : {
        url: databaseUrl,
        authToken: databaseAuthToken,
      },
});
