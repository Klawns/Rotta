import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { ICacheProvider } from '../interfaces/cache-provider.interface';

@Injectable()
export class RedisCacheProvider
  implements ICacheProvider, OnModuleInit, OnModuleDestroy
{
  private redisClient: Redis;
  private readonly logger = new Logger(RedisCacheProvider.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn(
        '[RedisCacheProvider] ⚠️ REDIS_URL não detectado no .env. (Fallback para Redis local).',
      );
    } else {
      this.logger.debug(
        `[RedisCacheProvider] 🔍 Detectado REDIS_URL para conexão remota...`,
      );
    }

    try {
      // Se tiver Redis URL as strings (caso Railway), ele injetará.
      if (redisUrl) {
        const url = new URL(redisUrl);
        this.redisClient = new Redis({
          host: url.hostname,
          port: parseInt(url.port, 10),
          username: url.username || undefined,
          password: url.password || undefined,
          tls: url.protocol === 'rediss:' ? {} : undefined,
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            return Math.min(times * 100, 3000);
          },
        });
        this.logger.debug(
          `[RedisCacheProvider] 🔄 Tentando conectar em: ${url.hostname}:${url.port}`,
        );
      } else {
        this.redisClient = new Redis('redis://localhost:6379', {
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            return Math.min(times * 50, 2000);
          },
        });
      }
    } catch (e) {
      this.logger.error(
        `[RedisCacheProvider] ❌ Falha ao parsear credenciais. Usando localhost. Erro: ${e.message}`,
      );
      this.redisClient = new Redis('redis://localhost:6379');
    }

    this.redisClient.on('error', (err) => {
      this.logger.error(
        `[RedisCacheProvider] 🔌 Conexão recusada / Droppada. Detalhe: ${err.message}`,
      );
    });

    this.redisClient.on('ready', () => {
      this.logger.log(
        '[RedisCacheProvider] ✅ Conectado com SUCESSO ao servidor Redis!',
      );
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Erro ao buscar cache [${key}]: ${error.message}`);
      return null; // Fallback silencioso (Circuit Breaker)
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.set(key, data, 'EX', ttlSeconds);
      } else {
        await this.redisClient.set(key, data);
      }
    } catch (error) {
      this.logger.error(`Erro ao salvar cache [${key}]: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Erro ao deletar cache [${key}]: ${error.message}`);
    }
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    try {
      // Usa 'scan' para evitar travar a thread única do Redis com comandos KEYS *
      let cursor = '0';
      const keysToDelete: string[] = [];

      do {
        const [newCursor, keys] = await this.redisClient.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          100,
        );
        cursor = newCursor;
        keysToDelete.push(...keys);
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await this.redisClient.del(...keysToDelete);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao invalidar prefixo [${prefix}]: ${error.message}`,
      );
    }
  }
}
