import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import {
  BACKUPS_QUEUE,
  RUN_TECHNICAL_BACKUP_SCHEDULE_JOB,
  TECHNICAL_BACKUP_SCHEDULER_ID,
} from '../backups.constants';
import type { SystemBackupSettings } from './system-backup-settings.service';
import { SystemBackupSettingsService } from './system-backup-settings.service';

type SystemBackupSchedulerHealth = 'disabled' | 'registered' | 'failed';

@Injectable()
export class SystemBackupSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SystemBackupSchedulerService.name);
  private status: {
    health: SystemBackupSchedulerHealth;
    lastSyncedAt: string | null;
  } = {
    health: 'disabled',
    lastSyncedAt: null,
  };

  constructor(
    private readonly settingsService: SystemBackupSettingsService,
    private readonly configService: ConfigService,
    @InjectQueue(BACKUPS_QUEUE)
    private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    try {
      await this.syncSchedule();
    } catch (error) {
      this.logger.error(
        {
          context: 'systemBackupScheduler.onModuleInit:error',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  getStatus() {
    return { ...this.status };
  }

  async syncSchedule(settings?: SystemBackupSettings) {
    const enabled =
      this.configService.get<string>('PG_DUMP_BACKUP_ENABLED') !== 'false';

    this.logger.log({
      context: 'systemBackupScheduler.syncSchedule:start',
      enabled,
      settingsProvided: Boolean(settings),
    });

    if (!enabled) {
      await this.queue.removeJobScheduler(TECHNICAL_BACKUP_SCHEDULER_ID);
      this.status = {
        health: 'disabled',
        lastSyncedAt: new Date().toISOString(),
      };
      this.logger.log({
        context: 'systemBackupScheduler.syncSchedule:disabledByEnv',
        schedulerHealth: this.status.health,
      });
      return;
    }

    const resolvedSettings = settings ?? (await this.settingsService.getSettings());

    if (resolvedSettings.schedule.mode === 'disabled') {
      await this.queue.removeJobScheduler(TECHNICAL_BACKUP_SCHEDULER_ID);
      this.status = {
        health: 'disabled',
        lastSyncedAt: new Date().toISOString(),
      };
      this.logger.log({
        context: 'systemBackupScheduler.syncSchedule:disabledBySettings',
        schedulerHealth: this.status.health,
      });
      return;
    }

    try {
      if (resolvedSettings.schedule.mode === 'interval') {
        await this.queue.upsertJobScheduler(
          TECHNICAL_BACKUP_SCHEDULER_ID,
          {
            every: (resolvedSettings.schedule.intervalMinutes ?? 0) * 60 * 1000,
          },
          this.buildTemplate(),
        );
      } else {
        await this.queue.upsertJobScheduler(
          TECHNICAL_BACKUP_SCHEDULER_ID,
          {
            pattern: this.buildFixedTimePattern(resolvedSettings.schedule.fixedTime),
          },
          this.buildTemplate(),
        );
      }

      this.status = {
        health: 'registered',
        lastSyncedAt: new Date().toISOString(),
      };
      this.logger.log({
        context: 'systemBackupScheduler.syncSchedule:success',
        mode: resolvedSettings.schedule.mode,
        schedulerHealth: this.status.health,
      });
    } catch (error) {
      this.status = {
        health: 'failed',
        lastSyncedAt: new Date().toISOString(),
      };
      this.logger.error(
        {
          context: 'systemBackupScheduler.syncSchedule:error',
          mode: resolvedSettings.schedule.mode,
          schedulerHealth: this.status.health,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private buildTemplate() {
    return {
      name: RUN_TECHNICAL_BACKUP_SCHEDULE_JOB,
      data: {},
      opts: {
        removeOnComplete: true,
      },
    };
  }

  private buildFixedTimePattern(fixedTime: string | null) {
    if (!fixedTime || !/^\d{2}:\d{2}$/.test(fixedTime)) {
      throw new Error(
        'Horario fixo invalido para o scheduler do backup sistemico.',
      );
    }

    const [hour, minute] = fixedTime
      .split(':')
      .map((part) => Number.parseInt(part, 10));

    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      throw new Error(
        'Horario fixo invalido para o scheduler do backup sistemico.',
      );
    }

    return `${minute} ${hour} * * *`;
  }
}
