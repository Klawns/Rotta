import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';

export interface WebhookJobData {
    userId: string;
    plan: 'starter' | 'premium' | 'lifetime';
    eventId: string; // Para idempotência futura se necessário
}

@Processor('webhooks')
export class WebhookWorker extends WorkerHost {
    private readonly logger = new Logger(WebhookWorker.name);

    constructor(
        private subscriptionsService: SubscriptionsService,
    ) {
        super();
    }

    async process(job: Job<WebhookJobData>): Promise<void> {
        const { userId, plan, eventId } = job.data;

        this.logger.log(`Processando Webhook - Job ID: ${job.id} | Usuário: ${userId} | Plano: ${plan}`);

        try {
            await this.subscriptionsService.updateOrCreate(userId, plan);
            this.logger.log(`Webhook Processado com Sucesso - Job ID: ${job.id}`);
        } catch (error) {
            this.logger.error(`Falha ao processar job ${job.id}: ${error.message}`);
            // Lançar o erro faz com que o BullMQ tente novamente (retry)
            throw error;
        }
    }
}
