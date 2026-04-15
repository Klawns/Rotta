import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { buildPostgresPoolConfigFromEnv } from '../database/strategies/postgres-strategy';

async function runMigrations() {
  const pool = new Pool(buildPostgresPoolConfigFromEnv(process.env));
  const db = drizzle(pool);
  const migrationsFolder = path.resolve(
    __dirname,
    '../../../../packages/database/drizzle/postgres',
  );

  try {
    console.log(`[Migrate] Using migrations from ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log('[Migrate] Migrations completed successfully');
  } finally {
    await pool.end();
  }
}

void runMigrations().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : error;
  console.error('[Migrate] Failed to run migrations', message);
  process.exit(1);
});
