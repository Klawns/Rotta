import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '@mdc/database';
import { eq } from 'drizzle-orm';
import { PAYMENT_PROVIDER } from '../payments/providers/payment-provider.interface';
import type { IPaymentProvider } from '../payments/providers/payment-provider.interface';

@Injectable()
export class AdminSettingsService {
    constructor(
        @Inject(DRIZZLE)
        private db: LibSQLDatabase<typeof schema>,
        @Inject(PAYMENT_PROVIDER)
        private provider: IPaymentProvider,
    ) { }

    async listCoupons() {
        if (!this.provider.listCoupons) {
            throw new Error('Provedor de pagamento não suporta listagem de cupons');
        }
        return this.provider.listCoupons();
    }

    async createCoupon(data: any) {
        if (!this.provider.createCoupon) {
            throw new Error('Provedor de pagamento não suporta criação de cupons');
        }
        return this.provider.createCoupon(data);
    }

    async getPlans() {
        return this.db.select().from(schema.pricingPlans);
    }

    async updatePlan(id: string, data: any) {
        if (data.features && Array.isArray(data.features)) {
            data.features = JSON.stringify(data.features);
        }
        return this.db.update(schema.pricingPlans).set({
            ...data,
            updatedAt: new Date(),
        }).where(eq(schema.pricingPlans.id, id));
    }

    async getConfigs() {
        const configs = await this.db.select().from(schema.systemConfigs);
        return configs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    }

    async updateConfig(key: string, value: string, description?: string) {
        const [existing] = await this.db.select().from(schema.systemConfigs).where(eq(schema.systemConfigs.key, key));
        if (existing) {
            return this.db.update(schema.systemConfigs).set({
                value,
                description: description || existing.description,
                updatedAt: new Date(),
            }).where(eq(schema.systemConfigs.key, key));
        } else {
            return this.db.insert(schema.systemConfigs).values({
                key,
                value,
                description,
            });
        }
    }

    async seedInitialData() {
        // Seed Plans if empty
        const plans = await this.db.select().from(schema.pricingPlans);
        if (plans.length === 0) {
            await this.db.insert(schema.pricingPlans).values([
                {
                    id: 'starter',
                    name: 'Starter',
                    price: 0,
                    description: 'Ideal para começar e testar a plataforma.',
                    features: JSON.stringify([
                        'Até 50 corridas incluídas',
                        'Controle de clientes básico',
                        'Relatórios mensais',
                        'Suporte via comunidade',
                    ]),
                    cta: 'Começar Grátis',
                    highlight: false,
                },
                {
                    id: 'premium',
                    name: 'Premium',
                    price: 4990,
                    interval: '/mês',
                    description: '30 dias de acesso total com renovação via Pix.',
                    features: JSON.stringify([
                        'Corridas ilimitadas',
                        'Dashboard advanced',
                        'Relatórios PDF customizados',
                        'Suporte prioritário',
                        'Integração com pagamentos',
                    ]),
                    cta: 'Assinar Premium',
                    highlight: true,
                },
                {
                    id: 'lifetime',
                    name: 'Lifetime',
                    price: 49700,
                    description: 'Acesso vitalício para quem não quer mensalidade.',
                    features: JSON.stringify([
                        'Tudo do Premium',
                        'Novas atualizações para sempre',
                        'Acesso antecipado a recursos',
                        'Badges exclusivos',
                    ]),
                    cta: 'Comprar Vitalício',
                    highlight: false,
                },
            ]);
        }

        // Seed default configs
        const configs = await this.getConfigs();
        if (!configs['SUPPORT_WHATSAPP']) {
            await this.updateConfig('SUPPORT_WHATSAPP', '', 'Link ou número para suporte via WhatsApp');
        }
        if (!configs['SUPPORT_EMAIL']) {
            await this.updateConfig('SUPPORT_EMAIL', 'suporte@mohameddelivery.com', 'E-mail oficial de suporte');
        }
    }
}
