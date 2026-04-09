import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProfileCacheService } from '../../cache/profile-cache.service';
import { SubscriptionsService } from '../subscriptions.service';

export interface WebhookJobData {
  userId: string;
  plan: 'starter' | 'premium' | 'lifetime';
  eventId: string; // Para idempotência futura se necessário
}

@Processor('webhooks')
export class SubscriptionWebhookWorker extends WorkerHost {
  private readonly logger = new Logger(SubscriptionWebhookWorker.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly profileCacheService: ProfileCacheService,
  ) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<void> {
    const { userId, plan } = job.data;

    this.logger.log(
      `Processando Worker de Assinatura - Job ID: ${job.id} | Usuário: ${userId} | Plano: ${plan}`,
    );

    // Guard against previously enqueued bad data
    if (!userId || userId.startsWith('plan_')) {
      this.logger.warn(
        `Job ${job.id} descartado: Identificador de usuário inválido (${userId})`,
      );
      return;
    }

    try {
      await this.subscriptionsService.updateOrCreate(userId, plan);
      // Invalidate the cache so the frontend /auth/me polling gets the new plan immediately
      await this.profileCacheService.invalidate(userId);
      this.logger.log(`Assinatura Processada com Sucesso - Job ID: ${job.id}`);
    } catch (error: unknown) {
      this.logger.error(
        `Falha ao processar job de assinatura ${job.id}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
      throw error;
    }
  }
}
