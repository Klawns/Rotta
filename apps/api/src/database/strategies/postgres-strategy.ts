import { DatabaseStrategy } from '../interfaces/database-strategy.interface';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { postgresSchema as schema } from '@mdc/database';
import { Pool } from 'pg';

export class PostgresStrategy implements DatabaseStrategy {
  constructor(private readonly configService: ConfigService) {}

  async connect(): Promise<any> {
    const connectionString = this.configService.get<string>('DATABASE_URL');
    
    // Alternatively, use detailed vars if URL is not provided
    const user = this.configService.get<string>('POSTGRES_USER') || this.configService.get<string>('PGUSER');
    const password = this.configService.get<string>('POSTGRES_PASSWORD') || this.configService.get<string>('PGPASSWORD');
    const host = this.configService.get<string>('PGHOST') || 'localhost';
    const port = this.configService.get<number>('PGPORT') || 5432;
    const database = this.configService.get<string>('POSTGRES_DB') || this.configService.get<string>('PGDATABASE');

    const pool = new Pool({
      connectionString,
      user,
      password,
      host,
      port,
      database,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    return drizzle(pool, { schema });
  }
}
