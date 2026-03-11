import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentProvider, PaymentPlan, CustomerData } from './payment-provider.interface';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AbacatePayProvider implements IPaymentProvider {
    private readonly apiKey: string;
    private readonly webhookSecret: string;
    private readonly baseUrl = 'https://api.abacatepay.com/v1';

    private readonly premiumPrice: number;
    private readonly lifetimePrice: number;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('ABACATEPAY_API_KEY') || '';
        this.webhookSecret = this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET') || '';
    }

    private logToFile(data: any) {
        try {
            const logPath = '/tmp/abacatepay-webhook.log';
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] ${JSON.stringify(data, null, 2)}\n---\n`;
            fs.appendFileSync(logPath, logEntry);
        } catch (err) {
            console.error('Falha ao logar no arquivo:', err.message);
        }
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Clientes
     */

    async createCustomer(data: {
        name: string;
        cellphone: string;
        email: string;
        taxId: string;
    }) {
        try {
            const response = await axios.post(`${this.baseUrl}/customer/create`, data, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao criar cliente', error);
        }
    }

    async listCustomers() {
        try {
            const response = await axios.get(`${this.baseUrl}/customer/list`, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao listar clientes', error);
        }
    }

    /**
     * Cobranças (Billing)
     */

    async createCheckoutSession(userId: string, plan: PaymentPlan, amount: number, customer?: CustomerData, coupons?: string[]): Promise<{ url: string }> {

        if (amount === 0) {
            throw new Error('Plano Starter não requer pagamento');
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const payload = {
            frequency: 'ONE_TIME',
            methods: ['PIX'],
            externalId: userId, // ID de referência principal (userId)
            products: [
                {
                    externalId: `plan_${plan}`,
                    name: `Plano MDC - ${plan.toUpperCase()}`,
                    quantity: 1,
                    price: amount,
                },
            ],
            returnUrl: `${frontendUrl}/pricing?payment=cancel`,
            completionUrl: `${frontendUrl}/payment-success`,
            customer: customer ? {
                name: customer.name || 'Cliente Mohamed',
                email: customer.email,
                cellphone: customer.cellphone || '', // Usar dado real do cadastro
                taxId: customer.taxId || '', // Usar CPF real do cadastro
            } : undefined,
            metadata: {
                userId,
                plan,
            },
            coupons: coupons || [],
        };

        try {
            const response = await axios.post(`${this.baseUrl}/billing/create`, payload, {
                headers: this.headers,
            });
            return { url: response.data.data.url as string };
        } catch (error) {
            this.handleError('Erro ao criar cobrança', error);
        }
    }

    async listBillings() {
        try {
            const response = await axios.get(`${this.baseUrl}/billing/list`, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao listar cobranças', error);
        }
    }

    /**
     * Pix QR Code
     */

    async createPixQrCode(data: {
        amount: number;
        expiresIn?: number;
        description?: string;
        customer?: {
            name: string;
            cellphone: string;
            email: string;
            taxId: string;
        };
        metadata?: Record<string, any>;
    }) {
        try {
            const response = await axios.post(`${this.baseUrl}/pixQrCode/create`, data, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao criar QR Code Pix', error);
        }
    }

    async checkPixStatus(pixId: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/pixQrCode/check?id=${pixId}`, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao checar status do Pix', error);
        }
    }

    /**
     * Cupons
     */

    async createCoupon(data: {
        code: string;
        notes: string;
        discountKind: 'PERCENTAGE' | 'FIXED';
        discount: number;
        maxRedeems?: number;
        metadata?: Record<string, any>;
    }) {
        try {
            const response = await axios.post(`${this.baseUrl}/coupon/create`, data, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao criar cupom', error);
        }
    }

    async listCoupons() {
        try {
            const response = await axios.get(`${this.baseUrl}/coupon/list`, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao listar cupons', error);
        }
    }

    /**
     * Saques (Withdraw)
     */

    async createWithdraw(data: {
        externalId: string;
        amount: number;
        pix: {
            type: string;
            key: string;
        };
        description?: string;
    }) {
        try {
            const response = await axios.post(`${this.baseUrl}/withdraw/create`, {
                ...data,
                method: 'PIX',
            }, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao criar saque', error);
        }
    }

    async getWithdraw(id: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/withdraw/get?id=${id}`, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao buscar saque', error);
        }
    }

    async listWithdraws() {
        try {
            const response = await axios.get(`${this.baseUrl}/withdraw/list`, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao listar saques', error);
        }
    }

    /**
     * Estatísticas
     */

    async getRevenue(startDate: string, endDate: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/public-mrr/revenue?startDate=${startDate}&endDate=${endDate}`, {
                headers: this.headers,
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Erro ao obter receita', error);
        }
    }

    /**
     * Webhook
     */

    async handleWebhook(signature: string, payload: Buffer) {
        let body: any;
        try {
            body = JSON.parse(payload.toString());
            this.logToFile(body);
        } catch (e: any) {
            console.error('[AbacatePay] Erro ao processar payload do webhook:', e.message);
            return { received: true };
        }

        if (this.webhookSecret) {
            const expectedSig = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload)
                .digest('base64');

            const A = Buffer.from(expectedSig);
            const B = Buffer.from(signature);

            console.log(`[AbacatePay] Signature check - Received: ${signature.substring(0, 10)}..., Expected: ${expectedSig.substring(0, 10)}...`);

            if (A.length !== B.length || !crypto.timingSafeEqual(A, B)) {
                console.error('[AbacatePay] Assinatura do Webhook inválida.');
                if (process.env.NODE_ENV === 'development') {
                    console.warn('[AbacatePay] [DEV] Prosseguindo apesar da assinatura inválida devido ao ambiente de desenvolvimento.');
                } else {
                    throw new InternalServerErrorException('Assinatura inválida');
                }
            }
        }

        const { event, data } = body;

        console.log(`[AbacatePay] Webhook recebido (v1): ${event}`);

        if (event === 'billing.paid') {
            const billing = data.billing;
            const customer = billing?.customer;

            // Tenta extrair o userId de várias fontes possíveis no payload
            let userId = billing?.externalId ||
                billing?.metadata?.userId ||
                data.metadata?.userId ||
                data.externalId;

            if (!userId) {
                const searchEmail = (obj: any): string | null => {
                    if (!obj || typeof obj !== 'object') return null;
                    if (typeof obj.email === 'string' && obj.email.includes('@')) return obj.email;
                    for (const key in obj) {
                        const res = searchEmail(obj[key]);
                        if (res) return res;
                    }
                    return null;
                };
                const emailFound = searchEmail(data);
                if (emailFound) {
                    console.log(`[AbacatePay] userId ausente. Usando e-mail: ${emailFound}`);
                    userId = emailFound;
                }
            }

            const plan = billing?.metadata?.plan ||
                billing?.products?.[0]?.externalId?.replace('plan_', '') ||
                data.metadata?.plan ||
                'premium';

            console.log(`[AbacatePay] Pagamento confirmado! Identificador: ${userId}, plan: ${plan}`);

            this.logToFile({
                msg: 'Extraction results',
                extractedUserId: userId,
                extractedPlan: plan,
                receivedEmail: customer?.email
            });

            return {
                received: true,
                userId,
                plan: plan as PaymentPlan,
                status: 'PAID',
            };
        }

        return { received: true };
    }

    private handleError(context: string, error: any): never {
        const errorData = error.response?.data;
        console.error(`[AbacatePay] ${context}:`, {
            message: error.message,
            status: error.response?.status,
            data: errorData
        });

        const message = errorData?.error || errorData?.message || error.message || context;
        throw new InternalServerErrorException(message);
    }
}
