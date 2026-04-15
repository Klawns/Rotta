import { DatabaseStrategy } from '../interfaces/database-strategy.interface';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { postgresSchema as schema } from '@mdc/database';
import { Pool, type PoolConfig } from 'pg';
import type { ConnectionOptions } from 'tls';

function parseBooleanFlag(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
}

function decodeMultilineValue(
  inlineValue?: string,
  base64Value?: string,
): string | undefined {
  if (inlineValue) {
    return inlineValue.replace(/\\n/g, '\n');
  }

  if (!base64Value) {
    return undefined;
  }

  return Buffer.from(base64Value, 'base64').toString('utf8');
}

function resolvePostgresHostFromEnv(env: NodeJS.ProcessEnv): string | undefined {
  const explicitHost = env.PGHOST;

  if (explicitHost) {
    return explicitHost;
  }

  const connectionString = env.POSTGRES_DATABASE_URL ?? env.DATABASE_URL;

  if (!connectionString) {
    return undefined;
  }

  try {
    return new URL(connectionString).hostname;
  } catch {
    return undefined;
  }
}

export function buildPostgresSslConfigFromEnv(
  env: NodeJS.ProcessEnv,
): ConnectionOptions | false {
  const isProduction = env.NODE_ENV === 'production';
  const host = resolvePostgresHostFromEnv(env);
  const shouldDefaultToSsl =
    isProduction && !host?.endsWith('.railway.internal');
  const sslEnabled = parseBooleanFlag(env.POSTGRES_SSL_ENABLED, shouldDefaultToSsl);

  if (!sslEnabled) {
    return false;
  }

  const sslConfig: ConnectionOptions = {
    rejectUnauthorized: parseBooleanFlag(
      env.POSTGRES_SSL_REJECT_UNAUTHORIZED,
      true,
    ),
  };

  const ca = decodeMultilineValue(
    env.POSTGRES_SSL_CA,
    env.POSTGRES_SSL_CA_BASE64,
  );
  const cert = decodeMultilineValue(
    env.POSTGRES_SSL_CERT,
    env.POSTGRES_SSL_CERT_BASE64,
  );
  const key = decodeMultilineValue(
    env.POSTGRES_SSL_KEY,
    env.POSTGRES_SSL_KEY_BASE64,
  );

  if (ca) {
    sslConfig.ca = ca;
  }

  if (cert) {
    sslConfig.cert = cert;
  }

  if (key) {
    sslConfig.key = key;
  }

  return sslConfig;
}

export function buildPostgresPoolConfigFromEnv(
  env: NodeJS.ProcessEnv,
): PoolConfig {
  return {
    connectionString: env.POSTGRES_DATABASE_URL ?? env.DATABASE_URL,
    user: env.POSTGRES_USER ?? env.PGUSER,
    password: env.POSTGRES_PASSWORD ?? env.PGPASSWORD,
    host: env.PGHOST || 'localhost',
    port: env.PGPORT ? Number(env.PGPORT) : 5432,
    database: env.POSTGRES_DB ?? env.PGDATABASE,
    ssl: buildPostgresSslConfigFromEnv(env),
  };
}

export class PostgresStrategy implements DatabaseStrategy {
  constructor(private readonly configService: ConfigService) {}

  connect(): Promise<any> {
    const env: NodeJS.ProcessEnv = {};
    env.NODE_ENV = this.configService.get<string>('NODE_ENV');
    env.POSTGRES_DATABASE_URL =
      this.configService.get<string>('POSTGRES_DATABASE_URL');
    env.DATABASE_URL = this.configService.get<string>('DATABASE_URL');
    env.POSTGRES_USER = this.configService.get<string>('POSTGRES_USER');
    env.PGUSER = this.configService.get<string>('PGUSER');
    env.POSTGRES_PASSWORD = this.configService.get<string>('POSTGRES_PASSWORD');
    env.PGPASSWORD = this.configService.get<string>('PGPASSWORD');
    env.PGHOST = this.configService.get<string>('PGHOST');
    env.PGPORT = this.configService.get<string>('PGPORT');
    env.POSTGRES_DB = this.configService.get<string>('POSTGRES_DB');
    env.PGDATABASE = this.configService.get<string>('PGDATABASE');
    env.POSTGRES_SSL_ENABLED =
      this.configService.get<string>('POSTGRES_SSL_ENABLED');
    env.POSTGRES_SSL_REJECT_UNAUTHORIZED = this.configService.get<string>(
      'POSTGRES_SSL_REJECT_UNAUTHORIZED',
    );
    env.POSTGRES_SSL_CA = this.configService.get<string>('POSTGRES_SSL_CA');
    env.POSTGRES_SSL_CA_BASE64 = this.configService.get<string>(
      'POSTGRES_SSL_CA_BASE64',
    );
    env.POSTGRES_SSL_CERT = this.configService.get<string>('POSTGRES_SSL_CERT');
    env.POSTGRES_SSL_CERT_BASE64 = this.configService.get<string>(
      'POSTGRES_SSL_CERT_BASE64',
    );
    env.POSTGRES_SSL_KEY = this.configService.get<string>('POSTGRES_SSL_KEY');
    env.POSTGRES_SSL_KEY_BASE64 = this.configService.get<string>(
      'POSTGRES_SSL_KEY_BASE64',
    );

    const pool = new Pool(buildPostgresPoolConfigFromEnv(env));

    return Promise.resolve(drizzle(pool, { schema }));
  }
}
