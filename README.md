# Mohamed Delivery Control (MDC)

Sistema de gerenciamento de corridas para motoristas.

## Estrutura do Projeto

Este é um monorepo gerenciado com [Turbo](https://turbo.build/).

- `apps/api`: Backend NestJS (Porta 3000)
- `apps/web`: Frontend Next.js (Porta 3001)
- `packages/database`: Esquema e migrações do banco de dados (Drizzle + Turso)

## Desenvolvimento Local

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Configure as variáveis de ambiente:
   - Copie o `.env.example` para `.env` em `apps/api` e `apps/web`.

3. Inicie o ambiente:
   ```bash
   pnpm dev
   ```

## Deploy (Railway)

O projeto está configurado para deploy automático no Railway através do `railway.json` na raiz.
- A API e o Web App são detectados como serviços distintos se configurados no Dashboard do Railway apontando para suas respectivas pastas.
