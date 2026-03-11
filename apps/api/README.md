# API - Mohamed Delivery Control (MDC)

Este é o serviço backend do sistema MDC, construído com NestJS e Drizzle ORM.

## Configuração Modular

O sistema foi arquitetado para ser estritamente modular, permitindo a troca de componentes críticos via configuração.

### Gateways de Pagamento

Para alternar entre provedores de pagamento ou configurar as credenciais, utilize as seguintes variáveis de ambiente no arquivo `.env`:

#### Stripe (Atual)
- `STRIPE_SECRET_KEY`: Chave secreta da API do Stripe.
- `STRIPE_WEBHOOK_SECRET`: Segredo para validação de webhooks.
- `STRIPE_PRICE_BASIC_ID`: ID do preço para o plano BASIC.
- `STRIPE_PRICE_PRO_ID`: ID do preço para o plano PRO.

#### AbacatePay (Pronto para Extensão)
Para ativar o AbacatePay, altere a fábrica no `PaymentsModule` para utilizar o `AbacatePayProvider`.

### Banco de Dados
O sistema utiliza Drizzle ORM com LibSQL (Turso) por padrão.
- `DATABASE_URL`: URL de conexão (local ou Turso).
- `DATABASE_AUTH_TOKEN`: Token de autenticação (necessário para Turso).

## Endpoints de Infraestrutura
- `GET /health`: Verifica a integridade e uptime do serviço.

## Comandos Úteis
- `pnpm build`: Gera o build de produção.
- `pnpm test:cov`: Executa testes com cobertura.
- `pnpm lint`: Verifica padrões de código.
