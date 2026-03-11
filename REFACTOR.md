# PRD — Refatoração Arquitetural

**Mohamed Delivery Control - Controle de Corridas. Ou MDC - Controle de Corridas**

Version: 1.0
Date: 07 Mar 2026
Owner: Product / Engineering

---

# Table of Contents

1. Executive One-Pager
2. Overview & Context
3. Customer Insights
4. Goals & Non-Goals
5. Alternatives Considered
6. Personas & Use Cases
7. Requirements
8. UX & UI Refactor Strategy
9. Technical Architecture
10. Data Layer
11. Authentication & Security
12. Payment System
13. Metrics
14. Risks
15. Rollout Plan
16. Decision Log
17. Open Questions
18. Glossary

---

# 1. Executive One-Pager

## Problema

A aplicação atual:

* concentra muita lógica em páginas grandes
* não possui backend estruturado
* não suporta monetização
* não está preparada para escalar usuários
* mistura UI, lógica e dados no mesmo local

Isso viola princípios importantes como **SRP (Single Responsibility Principle)**.

---

## Objetivo

Refatorar o sistema para uma arquitetura:

* **modular**
* **testável**
* **escalável**
* **segura**
* **pronta para monetização**

---

## Escopo da Refatoração

Implementar:

* Backend **NestJS**
* Autenticação JWT segura
* Sistema de pagamento
* Dashboard admin
* Landing page de vendas
* Separação clara frontend/backend
* Arquitetura modular

---

## Métricas de sucesso

| Métrica            | Target |
| ------------------ | ------ |
| tempo build        | <10s   |
| tempo resposta API | <200ms |
| test coverage      | >80%   |
| SRP violations     | 0      |

---

# 2. Overview & Context

O MDC começou como um sistema simples para registrar corridas de entrega.

Agora o produto precisa evoluir para:

* **SaaS pago**
* **multi-usuário**
* **com sistema de assinaturas**

Isso exige uma **refatoração estrutural profunda**.

---

# 3. Customer Insights

Usuários potenciais:

* entregadores autônomos
* pequenos negócios de entrega
* freelancers

Problemas atuais:

* controle financeiro manual
* falta de histórico organizado
* dificuldade em gerar relatórios

---

# 4. Goals & Non-Goals

## Goals

Refatorar arquitetura para:

1. backend robusto
2. autenticação segura
3. monetização
4. escalabilidade
5. manutenção fácil
6. código modular

---

## Non Goals

Não inclui:

* app mobile nativo
* integração GPS
* marketplace de entregadores

---

# 5. Alternatives Considered

## Apenas Next.js API routes

Problema:

* limita escalabilidade
* mistura backend e frontend
* difícil aplicar arquitetura limpa

---

## Supabase

Problema:

* dependência externa
* menos controle de lógica de negócio

---

## Escolha final

Next.js + NestJS

Motivo:

* arquitetura limpa
* separação de responsabilidades
* excelente para SaaS

---

# 6. Personas

## Entregador

Objetivo:

Registrar corridas e acompanhar ganhos.

---

## Admin / Criador

Objetivo:

Controlar usuários da plataforma.

---

# 7. Requirements

---

# Functional Requirements

## FR1 — Refatoração seguindo SRP

Todas as páginas devem ser divididas em:

* components
* hooks
* services
* validation
* types

Nenhum arquivo deve conter múltiplas responsabilidades.

---

## FR2 — Estrutura modular

Sistema deve permitir migração fácil para cloud.

Exemplo:

```
apps/
   web
   api

packages/
   ui
   db
   config
```

---

## FR3 — Landing Page

Criar landing page usando conteúdo de:

```
landing.md
```

Elementos obrigatórios:

* hero
* benefícios
* pricing
* CTA
* FAQ

---

## FR4 — Autenticação

Implementar:

* cadastro
* login
* refresh token
* logout

---

## FR5 — Dashboard Admin

Admin pode visualizar:

* usuários cadastrados
* usuários ativos
* plano atual
* pagamentos

---

## FR6 — Sistema de Pagamento

Suporte modular para gateways:

* AbacatePay
* Stripe

---

## FR7 — Planos

### Plano mensal

R$7,90 / mês

---

### Plano vitalício

R$19,90

---

Sistema deve permitir alteração futura de preços.

---

## FR8 — Proteção de acesso

Usuário deve ter acesso ao sistema apenas se:

* tiver plano ativo

---

# 8. UX Refactor Strategy

Problema atual:

Muitas funcionalidades na mesma página.

---

## Nova estrutura

Dashboard
Corridas
Clientes
Financeiro
Configurações

---

## Princípio

Uma página = uma responsabilidade.

---

# 9. Technical Architecture

## Monorepo

Recomendado:

```
pnpm workspaces
```

ou

```
Turborepo
```

---

## Estrutura

```
apps/
   web (Next.js)
   api (NestJS)

packages/
   ui
   database
   config
```

---

# Frontend Stack

Atual (mantido):

Next.js
Tailwind
Radix UI
React Hook Form
Zod

---

# Backend Stack

NestJS

Arquitetura:

```
modules/
   auth
   users
   payments
   subscriptions
   deliveries
```

---

# Data Layer

ORM recomendado:

```
Drizzle ORM
```

---

# Database

Primário:

```
Turso
```

Motivo:

* rápido
* serverless
* SQLite compatível

---

## Abstração

Criar camada:

```
database adapter
```

permitindo trocar para:

* Postgres
* MySQL

---

# 10. Authentication & Security

Autenticação deve usar:

JWT + refresh token

---

## Regras

Access Token

* curta duração
* 15 min

Refresh Token

* 7 dias
* httpOnly cookie

---

## Segurança

Implementar:

* httpOnly cookies
* CSRF protection
* rate limit
* hashing bcrypt

---

# 11. Payment System

Criar camada de abstração:

```
payment provider
```

---

Implementações:

```
providers/
   stripe
   abacatepay
```

---

Cada provider deve implementar interface:

```
createCheckout()
verifyPayment()
cancelSubscription()
```

---

# 12. Test Strategy (TDD)

Backend deve seguir:

Test Driven Development.

Fluxo obrigatório:

1. escrever teste
2. rodar teste (falhar)
3. implementar código
4. rodar teste (passar)

---

Framework:

```
Jest
```

ou

```
Vitest
```

---

Cobertura mínima:

80%

---

# 13. Metrics

| Métrica        | Meta   |
| -------------- | ------ |
| tempo login    | <300ms |
| API latency    | <200ms |
| test coverage  | >80%   |
| erro pagamento | <1%    |

---

# 14. Risks

| Risco                    | Impacto |
| ------------------------ | ------- |
| complexidade refatoração | alto    |
| migração dados           | médio   |
| integração pagamento     | médio   |

---

# 15. Rollout Plan

## Fase 1

Refatoração frontend.

---

## Fase 2

Implementar backend.

---

## Fase 3

Sistema de pagamento.

---

## Fase 4

Dashboard admin.

---

## Fase 5

Landing page.

---

# 16. Decision Log

| Data   | Decisão             |
| ------ | ------------------- |
| 07 Mar | NestJS backend      |
| 07 Mar | Turso DB            |
| 07 Mar | Next.js frontend    |
| 07 Mar | Stripe + AbacatePay |

---

# 17. Open Questions

1. estratégia de deploy
2. gateway principal
3. domínio do SaaS

---

# 18. Glossary

SRP
Single Responsibility Principle.

---

# Quality Check

| Item          | Status |
| ------------- | ------ |
| Completeness  | ✅      |
| Clarity       | ✅      |
| Feasibility   | ✅      |
| Actionability | ✅      |

---

# AI Gap Report

Risk Level: **Medium**

Possíveis gaps:

* schema do banco não definido
* estrutura completa do monorepo
* fluxo detalhado de pagamento

---

# Recomendações

Adicionar:

1️⃣ schema database
2️⃣ arquitetura completa do monorepo
3️⃣ fluxo auth completo
4️⃣ arquitetura de deploy
