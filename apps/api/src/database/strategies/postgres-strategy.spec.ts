import { buildPostgresSslConfigFromEnv } from './postgres-strategy';

describe('buildPostgresSslConfigFromEnv', () => {
  it('enables TLS by default in production', () => {
    const ssl = buildPostgresSslConfigFromEnv({
      NODE_ENV: 'production',
    });

    expect(ssl).toEqual({ rejectUnauthorized: true });
  });

  it('disables TLS by default for Railway private networking', () => {
    const ssl = buildPostgresSslConfigFromEnv({
      NODE_ENV: 'production',
      POSTGRES_DATABASE_URL:
        'postgresql://postgres:secret@postgres.railway.internal:5432/railway',
    });

    expect(ssl).toBe(false);
  });

  it('supports CA provided inline', () => {
    const ssl = buildPostgresSslConfigFromEnv({
      NODE_ENV: 'production',
      POSTGRES_SSL_CA: 'line-1\\nline-2',
    });

    expect(ssl).toEqual({
      rejectUnauthorized: true,
      ca: 'line-1\nline-2',
    });
  });

  it('allows disabling TLS outside production', () => {
    const ssl = buildPostgresSslConfigFromEnv({
      NODE_ENV: 'development',
      POSTGRES_SSL_ENABLED: 'false',
    });

    expect(ssl).toBe(false);
  });
});
