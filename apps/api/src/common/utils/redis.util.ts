import { ConfigService } from '@nestjs/config';

export function getRedisConfig(config: ConfigService) {
    const redisUrl = config.get<string>('REDIS_URL') || config.get<string>('REDISURL');
    const host = config.get<string>('REDISHOST') || 'localhost';
    const port = config.get<number>('REDISPORT') || 6379;
    const password = config.get<string>('REDISPASSWORD');
    const username = config.get<string>('REDISUSER');

    if (redisUrl) {
        return redisUrl;
    }

    return {
        host,
        port,
        password,
        username,
        tls: port === 6380 ? {} : undefined,
    };
}
