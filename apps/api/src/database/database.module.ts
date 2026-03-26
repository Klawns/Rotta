import { Module, Global } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { BackupService } from './backup.service';

@Global()
@Module({
  providers: [databaseProvider, BackupService],
  exports: [databaseProvider, BackupService],
})
export class DatabaseModule {}
