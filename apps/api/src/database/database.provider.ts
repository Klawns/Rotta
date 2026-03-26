import { FactoryProvider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqliteStrategy } from './strategies/sqlite-strategy';
import { PostgresStrategy } from './strategies/postgres-strategy';
import { DatabaseStrategy } from './interfaces/database-strategy.interface';

export const DRIZZLE = 'DRIZZLE';

const logger = new Logger('DatabaseProvider');

export const databaseProvider: FactoryProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const provider = configService.get<string>('DB_PROVIDER', 'sqlite').toLowerCase();
    let strategy: DatabaseStrategy;

    logger.log(`Using Database Provider: ${provider.toUpperCase()}`);

    if (provider === 'postgres') {
      strategy = new PostgresStrategy(configService);
    } else {
      strategy = new SqliteStrategy(configService);
    }

    try {
      return await strategy.connect();
    } catch (error) {
      logger.error(`Failed to connect to ${provider} database: ${error.message}`);
      
      // Fallback logic if Postgres fails and SQLite is configured as backup
      if (provider === 'postgres' && configService.get<boolean>('DB_FALLBACK_TO_SQLITE', false)) {
        logger.warn('Attempting fallback to SQLite...');
        strategy = new SqliteStrategy(configService);
        return await strategy.connect();
      }
      
      throw error;
    }
  },
};
