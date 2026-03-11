import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { UsersService } from '../users/users.service';
import type {
  IPaymentProvider,
  PaymentPlan,
} from './providers/payment-provider.interface';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';
import type { ICacheProvider } from '../cache/interfaces/cache-provider.interface';
import { IPaymentsRepository } from './interfaces/payments-repository.interface';

import { WebhookJobData } from './queue/webhook.worker';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENT_PROVIDER)
    private provider: IPaymentProvider,
    @Inject(CACHE_PROVIDER)
    private cache: ICacheProvider,
    private usersService: UsersService,
    private configService: ConfigService,
    @Inject(IPaymentsRepository)
    private readonly paymentsRepository: IPaymentsRepository,
    @InjectQueue('webhooks')
    private webhooksQueue: Queue<WebhookJobData>,
  ) {}

  async createCheckoutSession(
    userId: string,
    plan: PaymentPlan,
    couponCode?: string,
  ) {
    const user = await this.usersService.findById(userId);
    const dbPlan = await this.paymentsRepository.getPlanById(plan);

    console.log(
      `[PaymentsService] Iniciando checkout. ID: ${userId}, Nome DB: ${user?.name}, Email DB: ${user?.email}, Plano: ${plan}`,
    );

    if (!dbPlan) {
      throw new Error('Plano não encontrado');
    }

    return this.provider.createCheckoutSession(
      userId,
      plan,
      dbPlan.price,
      user
        ? {
            name: user.name,
            email: user.email,
            taxId: user.taxId ?? undefined,
            cellphone: user.cellphone ?? undefined,
          }
        : undefined,
      couponCode ? [couponCode] : undefined,
    );
  }

  async getPlans() {
    const cacheKey = 'pricing:all_plans';

    try {
      // 1. Tenta buscar do Cache Rápido (Redis)
      const cachedPlans = await this.cache.get<any[]>(cacheKey);
      if (cachedPlans) {
        console.log(
          '[PaymentsService] Retornando planos do Cache (Redis). Velocidade Máxima!',
        );
        return cachedPlans;
      }

      // 2. Fallback: Busca do Banco de Dados (Turso)
      const plans = await this.paymentsRepository.getAllPlans();
      const parsedPlans = plans.map((plan) => {
        let features = [];
        try {
          features =
            typeof plan.features === 'string'
              ? JSON.parse(plan.features)
              : plan.features || [];
        } catch (e) {
          console.error(
            `[PaymentsService] Erro ao parsear features do plano ${plan.id}:`,
            e.message,
          );
        }
        return {
          ...plan,
          features: Array.isArray(features) ? features : [],
        };
      });

      // 3. Salva no Cache para a próxima requisição (TTL = 1 hora)
      await this.cache.set(cacheKey, parsedPlans, 3600);

      return parsedPlans;
    } catch (error) {
      console.error('[PaymentsService] Erro ao buscar planos:', error.message);
      throw new Error('Falha ao carregar planos de pagamento');
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const result = await this.provider.handleWebhook(signature, payload);

    if (result.userId && result.plan) {
      let userId = result.userId;

      // Se o identificador for um e-mail (fallback do provider), resolve para o ID do usuário
      if (userId.includes('@')) {
        const user = await this.usersService.findByEmail(userId);
        if (user) {
          console.log(
            `[Webhook] Resolvendo e-mail ${userId} para o ID ${user.id}`,
          );
          userId = user.id;
        } else {
          console.error(
            `[Webhook ERROR] Pagamento recebido, mas NENHUM usuário encontrado com o e-mail: ${userId}.`,
          );
          return { received: true };
        }
      }

      const plan = result.plan.toLowerCase() as
        | 'starter'
        | 'premium'
        | 'lifetime';
      console.log(
        `[Webhook] Enfileirando Job de pagamento. Usuário: ${userId}, Novo Plano: ${plan}`,
      );

      // Adiciona na Fila em vez de processar sincronicamente
      await this.webhooksQueue.add(
        'process-payment', // nome da tarefa
        { userId, plan, eventId: crypto.randomUUID() }, // payload (WebhookJobData)
        {
          attempts: 5, // Tenta 5 vezes antes de desistir e ir pra rota de falhas (DLQ)
          backoff: {
            type: 'exponential',
            delay: 5000, // Começa esperando 5 segundos e vai dobrando se falhar
          },
          removeOnComplete: true,
        },
      );
    }

    return { received: true };
  }
}
