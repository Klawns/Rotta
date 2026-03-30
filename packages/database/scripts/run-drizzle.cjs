const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');

const packageRoot = path.resolve(__dirname, '..');
const appEnvPath = path.resolve(packageRoot, '../../apps/api/.env');

dotenv.config({ path: appEnvPath, quiet: true });

const [command, profile, ...restArgs] = process.argv.slice(2);
const supportedCommands = new Set(['generate', 'migrate', 'push', 'studio']);

if (!supportedCommands.has(command)) {
  console.error(`Unsupported Drizzle command: ${command ?? 'undefined'}`);
  process.exit(1);
}

const env = { ...process.env };

if (profile === 'postgres') {
  const postgresUrl =
    process.env.POSTGRES_DATABASE_URL ||
    (process.env.DB_PROVIDER === 'postgres' ? process.env.DATABASE_URL : undefined);

  if (!postgresUrl) {
    console.error(
      'POSTGRES_DATABASE_URL is required to run Drizzle commands for Postgres without changing apps/api/.env.',
    );
    process.exit(1);
  }

  env.DRIZZLE_DB_PROVIDER = 'postgres';
  env.DRIZZLE_DATABASE_URL = postgresUrl;
  delete env.DRIZZLE_DATABASE_AUTH_TOKEN;
}

const drizzleBin = path.join(path.dirname(require.resolve('drizzle-kit')), 'bin.cjs');
const result = spawnSync(
  process.execPath,
  [drizzleBin, command, '--config', 'drizzle.config.ts', ...restArgs],
  {
    cwd: packageRoot,
    env,
    stdio: 'inherit',
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
