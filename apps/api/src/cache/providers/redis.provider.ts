import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { ICacheProvider } from '../interfaces/cache-provider.interface';

@Injectable()
export class RedisCacheProvider implements ICacheProvider, OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;
    private readonly logger = new Logger(RedisCacheProvider.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL');

        if (!redisUrl) {
            this.logger.warn('REDIS_URL não está definido no .env. Inicializando em fallback memory (se necessário). Mas para uso real, defina o REDIS_URL.');
        }

        // Caso dê erro de conexão, o ioredis tem reconexão automática
        this.redisClient = new Redis(redisUrl || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3, // Falha rápido se não conseguir, não trava o servidor
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.redisClient.on('error', (err) => {
            this.logger.error(`Erro de conexão com Redis: ${err.message}`);
        });

        this.redisClient.on('ready', () => {
            this.logger.log('Conectado ao Redis com sucesso!');
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
                const [newCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
                cursor = newCursor;
                keysToDelete.push(...keys);
            } while (cursor !== '0');

            if (keysToDelete.length > 0) {
                await this.redisClient.del(...keysToDelete);
            }
        } catch (error) {
            this.logger.error(`Erro ao invalidar prefixo [${prefix}]: ${error.message}`);
        }
    }
}
