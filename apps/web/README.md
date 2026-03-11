# Web App - Mohamed Delivery Control (MDC)

Frontend do sistema MDC construído com Next.js (App Router), Tailwind CSS e Framer Motion.

## Experiência Personalizada por Papel

O dashboard adapta-se automaticamente ao papel do usuário autenticado:

### Admin (Orquestrador)
- **Visão Geral**: KPIs globais do sistema.
- **Administração**: Gestão de usuários, assinaturas e segurança do painel.
- *Nota: Administradores não visualizam telas de corridas pessoais.*

### Usuário (Entregador)
- **Visão Geral**: Resumo pessoal.
- **Clientes**: Gestão de base de clientes.
- **Corridas**: Fluxo operacional de entregas.
- **Financeiro**: Extrato de ganhos.

## Configuração
O frontend comunica-se com a API através da URL definida em:
- `NEXT_PUBLIC_API_URL`: Endpoint base da API.

## Comandos Úteis
- `pnpm build`: Gera o build otimizado para produção.
- `pnpm dev`: Inicia o servidor de desenvolvimento.
