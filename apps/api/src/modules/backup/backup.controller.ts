import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BackupService } from './backup.service';

@Controller('admin/backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * POST /admin/backup
   *
   * Triggers a pg_dump backup, streams the output to R2, and enforces
   * the configured retention policy. Requires admin role.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async triggerBackup() {
    const result = await this.backupService.runBackup();

    if (!result.success) {
      throw new InternalServerErrorException({
        message: 'Backup failed',
        error: result.error ?? 'Unknown error',
        filename: result.filename,
        timestamp: result.timestamp,
      });
    }

    return {
      message: 'Backup completed successfully',
      filename: result.filename,
      timestamp: result.timestamp,
      sizeBytes: result.sizeBytes,
    };
  }
}
