# Etapa 0: Baseline e inventario de uso da area administrativa

Data de fechamento do baseline: 20 de abril de 2026

## Objetivo

Congelar o entendimento da superficie atual do admin antes das etapas estruturais, com foco em:

- rotas e fluxos efetivamente ativos;
- dependencias entre layout, paginas, hooks, services, controllers e repositories;
- pontos de alto acoplamento e risco de regressao;
- candidatos com suspeita de obsolescencia;
- baseline de validacao para as proximas etapas.

## Task board da Etapa 0

### Concluido

- mapear a superficie atual do frontend admin e do backend admin;
- registrar os contratos ativos e os consumidores locais conhecidos;
- congelar normalizadores atuais de planos e cupons em testes utilitarios;
- definir a baseline minima de testes impactados para o admin.

### Fora da Etapa 0

- mover rotas;
- remover endpoints;
- trocar shell visual;
- dividir `AdminService`;
- introduzir novas fachadas por dominio.

## Inventario atual do frontend

### Shell e navegacao

| Superficie | Arquivo | Observacao |
| --- | --- | --- |
| `/admin` layout | `apps/web/app/admin/layout.tsx` | Faz gate de acesso, loading, erro, logout e nav superior entre dashboard e settings |
| `/admin/settings` layout | `apps/web/app/admin/settings/layout.tsx` | Cria uma segunda navegacao lateral so dentro de settings |

### Rotas ativas

| Rota | Arquivo | Dependencias principais | Fluxo afetado |
| --- | --- | --- | --- |
| `/admin` | `apps/web/app/admin/page.tsx` | `useAdminAccess`, `useAdminDashboard`, `useAdminDashboardState` | overview atual, listagem recente, criar usuario, excluir usuario, trocar plano |
| `/admin/settings` | `apps/web/app/admin/settings/page.tsx` | `redirect('/admin/settings/finance/plans')` | entrada padrao das configuracoes |
| `/admin/settings/finance/plans` | `apps/web/app/admin/settings/finance/plans/page.tsx` | `useAdminPlans`, `adminService` | leitura e atualizacao de planos |
| `/admin/settings/finance/coupons` | `apps/web/app/admin/settings/finance/coupons/page.tsx` | `useAdminCoupons`, `paymentsService` | leitura e criacao de cupons |
| `/admin/settings/system/global` | `apps/web/app/admin/settings/system/global/page.tsx` | `useAdminConfigs`, `adminService` | configs globais com auto-save em `onBlur` |
| `/admin/settings/system/security` | `apps/web/app/admin/settings/system/security/page.tsx` | `useAdminPasswordChange`, `adminService` | alteracao de senha administrativa |
| `/admin/settings/system/backups` | `apps/web/app/admin/settings/system/backups/page.tsx` | `useAdminBackups`, `backupsService` | historico tecnico, download, scheduler e retencao |

### Dependencias criticas do frontend

| Ponto | Evidencia atual | Risco |
| --- | --- | --- |
| Gate de acesso duplicado | `apps/web/app/admin/layout.tsx` e `apps/web/app/admin/page.tsx` chamam `useAdminAccess` e repetem loading/error/redirect | divergencia visual e funcional quando o shell mudar |
| Service admin centralizado | `apps/web/services/admin-service.ts` atende dashboard, usuarios, planos, configs e seguranca | fronteira fraca entre dominios da etapa futura |
| Cupons acoplados ao dominio de pagamentos | `apps/web/app/admin/settings/finance/coupons/_hooks/*` usa `paymentsService` | admin precisa conhecer uma fronteira externa ao dominio admin |
| Backups administrativos acoplados a service compartilhado | `apps/web/app/admin/settings/system/backups/_hooks/use-admin-backups.ts` usa `backupsService` tambem usado em `app/dashboard/settings/_hooks/*` | ajustes no contrato de backups afetam usuario final e admin |
| Tema escuro hardcoded | paginas e layouts usam `bg-slate-950`, `text-white`, `bg-slate-900` e variantes inline | troca para shell claro tende a gerar regressao visual ampla |
| Query keys de admin ainda sao agregadas | `apps/web/lib/query-keys.ts` mantem `adminKeys.settings()` para planos, configs, cupons e backups | invalidacao por dominio ainda nao esta isolada |

## Inventario atual do backend

### Endpoints ativos relacionados ao admin

| Endpoint | Controller | Service atual | Consumidor local conhecido |
| --- | --- | --- | --- |
| `GET /admin/health` | `AdminController` | inline no controller | nenhum consumidor local encontrado |
| `GET /admin/stats` | `AdminController` | `AdminService.getStats` | `adminService.getStats()` |
| `GET /admin/users/recent` | `AdminController` | `AdminService.getRecentUsers` | `adminService.getRecentUsers()` |
| `POST /admin/users` | `AdminController` | `AdminService.createUser` | `adminService.createUser()` |
| `DELETE /admin/users/:id` | `AdminController` | `AdminService.deleteUser` | `adminService.deleteUser()` |
| `PUT /admin/users/:id/plan` | `AdminController` | `AdminService.updateUserPlan` | `adminService.updateUserPlan()` |
| `GET /admin/settings/plans` | `AdminController` | `AdminService.getPlans` | duplicado; frontend local usa a outra implementacao da mesma rota |
| `PUT /admin/settings/plans/:id` | `AdminController` | `AdminService.updatePlan` | nenhum consumidor local encontrado |
| `PATCH /admin/settings/plans/:id` | `AdminController` | `AdminService.updatePlan` | duplicado; frontend local usa rota equivalente do `AdminSettingsController` |
| `GET /admin/settings/plans` | `AdminSettingsController` | `AdminSettingsService.getPlans` | `adminService.getPlans()` |
| `PATCH /admin/settings/plans/:id` | `AdminSettingsController` | `AdminSettingsService.updatePlan` | `adminService.updatePlan()` |
| `GET /admin/settings/configs` | `AdminSettingsController` | `AdminSettingsService.getConfigs` | `adminService.getConfigs()` |
| `POST /admin/settings/configs` | `AdminSettingsController` | `AdminSettingsService.updateConfig` | `adminService.updateConfig()` |
| `GET /admin/settings/promo-codes` | `AdminSettingsController` | `AdminSettingsService.listCoupons` | `paymentsService.getPromoCodes()` |
| `POST /admin/settings/promo-codes` | `AdminSettingsController` | `AdminSettingsService.createCoupon` | `paymentsService.createPromoCode()` |
| `POST /admin/settings/seed` | `AdminSettingsController` | `AdminSettingsService.seedInitialData` | nenhum consumidor local encontrado |
| `GET /admin/backups/technical` | `AdminBackupsController` | `BackupsService.listTechnicalBackups` | `backupsService.listTechnicalBackups()` |
| `POST /admin/backups/technical/manual` | `AdminBackupsController` | `BackupsService.createManualTechnicalBackup` | `backupsService.createManualTechnicalBackup()` |
| `GET /admin/backups/technical/:id/download` | `AdminBackupsController` | `BackupsService.getTechnicalDownloadUrl` | `backupsService.getTechnicalDownloadUrl()` |
| `GET /admin/backups/technical/:id/file` | `AdminBackupsController` | `BackupsService.getTechnicalDownloadFile` | usado pela URL retornada pelo backend |
| `GET /admin/backups/system/settings` | `AdminBackupsController` | `SystemBackupAdminService.getSettings` | `backupsService.getSystemBackupSettings()` |
| `PUT /admin/backups/system/settings` | `AdminBackupsController` | `SystemBackupAdminService.updateSettings` | `backupsService.updateSystemBackupSettings()` |
| `PATCH /auth/change-password` | modulo `auth` | fora do dominio admin | `adminService.changePassword()` |
| `GET /payments/plans` | `PaymentsController` | `PaymentsService.getPlans` | `paymentsService.getPlans()` e hooks publicos de planos |

### Dependencias criticas do backend

| Ponto | Evidencia atual | Risco |
| --- | --- | --- |
| `AdminService` com multiplos dominios | injeta `IAdminRepository`, provider de pagamento, `IPaymentsRepository`, `SubscriptionsService`, `ProfileCacheService`, `UsersService`, `ConfigService` e cache | alto fan-in e custo de mudanca elevado em dashboard, usuarios e billing |
| Contrato duplicado de planos | `AdminController` e `AdminSettingsController` registram `GET /admin/settings/plans` e `PATCH /admin/settings/plans/:id` | ambiguidade de rota e divergencia de implementacao |
| Escrita paralela em `systemConfigs` | `DrizzleAdminSettingsRepository` e `SystemBackupSettingsService` atualizam a mesma tabela | risco de inconsistencia e falta de fronteira unica para configuracoes |
| Cache publico de precos compartilhado | `AdminService`, `AdminSettingsService`, `AdminBootstrapService` e `PaymentsService` usam `pricing:all_plans` | alteracao em billing afeta admin e consumo publico ao mesmo tempo |
| Cupons seguem contrato frouxo | `AdminSettingsService` retorna `unknown` e o frontend normaliza payload | contrato dificil de versionar com seguranca |

## Suspeita de obsolescencia

Itens que nao devem ser removidos na Etapa 0, apenas monitorados:

- `GET /admin/health`: nao ha consumidor local encontrado e existe `GET /health` publico em `apps/api/src/app.controller.ts`;
- `POST /admin/settings/seed`: nao ha consumidor local encontrado e o bootstrap atual ja chama `seedInitialData`;
- `GET|PATCH /admin/settings/plans` via `AdminController`: o frontend local consome a rota equivalente exposta por `AdminSettingsController`;
- `PUT /admin/settings/plans/:id` via `AdminController`: nao ha consumidor local encontrado; o frontend usa `PATCH`.

## Riscos de regressao e fluxos afetados

### Autenticacao e autorizacao

- qualquer mudanca em `useAdminAccess`, `apps/web/app/admin/layout.tsx` ou `apps/web/app/admin/page.tsx` impacta redirect para `/area-restrita` e `/dashboard`, loading e estado de erro;
- a duplicacao atual significa que uma mudanca parcial pode deixar o layout e a pagina com comportamentos diferentes.

### Billing e catalogo de planos

- atualizar planos invalida `pricing:all_plans`, que alimenta tambem `GET /payments/plans`;
- migrar billing sem inventario quebra tanto admin quanto pontos publicos que usam o catalogo.

### Configuracoes de sistema

- `SUPPORT_WHATSAPP` e `SUPPORT_EMAIL` ainda usam auto-save em `onBlur`, entao regressao de focus pode persistir valor incorreto ou incompleto;
- `systemConfigs` nao possui hoje um dominio unico de escrita.

### Backups

- ajustes em `backupsService` podem afetar simultaneamente a area de admin e a configuracao do usuario comum;
- alterar configuracao tecnica impacta scheduler, retencao e mensagens de failover.

## Baseline de validacao

### Testes verdes executados antes das alteracoes da Etapa 0

Frontend:

- `corepack pnpm --filter my-project exec tsx --test app/admin/_lib/admin-dashboard-query-cache.test.ts app/admin/_mappers/admin-user-form.mapper.test.ts app/admin/settings/system/backups/_mappers/system-backup-settings.presenter.test.ts app/admin/settings/system/backups/_mappers/technical-backup.presenter.test.ts app/admin/settings/system/backups/_hooks/use-technical-backups-panel.test.ts`

Resultado:

- 13 testes passando.

Backend:

- `corepack pnpm --filter api test -- --runInBand admin/admin-settings.service.spec.ts admin/admin-bootstrap.service.spec.ts backups/admin-backups.controller.spec.ts backups/services/system-backup-settings.service.spec.ts`

Resultado:

- 4 suites passando;
- 14 testes passando.

### Baseline minima recomendada para as proximas etapas

Frontend:

- `corepack pnpm --filter my-project test:unit`
- `corepack pnpm --filter my-project lint`
- `corepack pnpm --filter my-project build`

Backend:

- `corepack pnpm --filter api test -- --runInBand admin/admin-settings.service.spec.ts admin/admin-bootstrap.service.spec.ts backups/admin-backups.controller.spec.ts backups/services/system-backup-settings.service.spec.ts`
- `corepack pnpm --filter api build`

## Congelamento de contratos feito nesta etapa

Cobertura adicionada para comportamento atual, sem mudanca funcional:

- normalizacao de `features` em `adminService`;
- normalizacao de `features` em `paymentsService`;
- adaptacao atual de cupons snake_case/camelCase para o modelo do frontend admin.

## Checklist de saida da Etapa 0

- [x] superficies frontend/admin mapeadas;
- [x] endpoints backend/admin com consumidores locais identificados;
- [x] dependencias e acoplamentos criticos registrados;
- [x] suspeitas de obsolescencia listadas sem remocao;
- [x] baseline inicial executada e registrada;
- [x] comportamento utilitario atual congelado em testes.
