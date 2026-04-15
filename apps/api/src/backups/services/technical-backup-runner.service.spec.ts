/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Jest mocks are intentionally partial. */
import { ConfigService } from '@nestjs/config';
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { gunzipSync } from 'node:zlib';
import { TechnicalBackupRunnerService } from './technical-backup-runner.service';

jest.mock('node:child_process', () => ({
  spawn: jest.fn(),
}));

class MockChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
}

describe('TechnicalBackupRunnerService', () => {
  const spawnMock = jest.mocked(spawn);
  let service: TechnicalBackupRunnerService;
  let configValues: Record<string, string | undefined>;
  let configService: ConfigService;

  beforeEach(() => {
    spawnMock.mockReset();
    configValues = {
      POSTGRES_DATABASE_URL: 'postgresql://postgres:secret@postgres:5432/railway',
      DATABASE_URL: undefined,
      PG_DUMP_BINARY: undefined,
    };
    configService = {
      get: jest.fn((key: string) => configValues[key]),
    } as unknown as ConfigService;
    service = new TechnicalBackupRunnerService(configService);
  });

  it('should gzip the pg_dump output', async () => {
    const child = new MockChildProcess();
    const dump = Buffer.from('CREATE TABLE public.test(id integer);');
    spawnMock.mockReturnValue(child as never);

    const resultPromise = service.createDumpBuffer();

    expect(spawnMock).toHaveBeenCalledWith(
      'pg_dump',
      [
        '--format=plain',
        '--no-owner',
        '--no-privileges',
        '--dbname=postgresql://postgres:secret@postgres:5432/railway',
      ],
      expect.objectContaining({
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
      }),
    );

    child.stdout.emit('data', dump);
    child.emit('close', 0);

    const result = await resultPromise;

    expect(result.contentType).toBe('application/gzip');
    expect(result.fileExtension).toBe('sql.gz');
    expect(result.rawSizeBytes).toBe(dump.length);
    expect(gunzipSync(result.dumpBuffer).toString('utf8')).toBe(
      dump.toString('utf8'),
    );
  });

  it('should fail when no database connection string is configured', async () => {
    configValues.POSTGRES_DATABASE_URL = undefined;
    configValues.DATABASE_URL = undefined;

    await expect(service.createDumpBuffer()).rejects.toThrow(
      'DATABASE_URL/POSTGRES_DATABASE_URL nao configurada para backup tecnico.',
    );
  });

  it('should wrap pg_dump startup errors', async () => {
    const child = new MockChildProcess();
    spawnMock.mockReturnValue(child as never);

    const resultPromise = service.createDumpBuffer();

    child.emit('error', new Error('spawn ENOENT'));

    await expect(resultPromise).rejects.toThrow(
      'Falha ao iniciar pg_dump: spawn ENOENT',
    );
  });

  it('should surface stderr when pg_dump exits with an error', async () => {
    const child = new MockChildProcess();
    configValues.POSTGRES_DATABASE_URL = undefined;
    configValues.DATABASE_URL =
      'postgresql://postgres:secret@postgres:5432/railway';
    configValues.PG_DUMP_BINARY = '/usr/lib/postgresql/18/bin/pg_dump';
    spawnMock.mockReturnValue(child as never);

    const resultPromise = service.createDumpBuffer();

    expect(spawnMock).toHaveBeenCalledWith(
      '/usr/lib/postgresql/18/bin/pg_dump',
      [
        '--format=plain',
        '--no-owner',
        '--no-privileges',
        '--dbname=postgresql://postgres:secret@postgres:5432/railway',
      ],
      expect.any(Object),
    );

    child.stderr.emit(
      'data',
      Buffer.from('pg_dump: error: connection to server failed'),
    );
    child.emit('close', 1);

    await expect(resultPromise).rejects.toThrow(
      'pg_dump falhou: pg_dump: error: connection to server failed',
    );
  });
});
