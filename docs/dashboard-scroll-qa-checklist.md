# Dashboard Scroll QA Checklist

## Objetivo

Validar que as listagens do dashboard usam:

- `body` sem scroll global
- container interno com altura controlada
- `overflow-y-auto` no container da lista
- infinite scroll progressivo, sem carregar tudo de uma vez
- comportamento estável com modal, drawer e resize

## Ambientes obrigatorios

- Desktop: Chrome com viewport larga e viewport reduzida
- Mobile: Safari iPhone e Chrome Android

## Seletores de apoio

- Container de clientes: `[data-qa="clients-list"]`
- Container de corridas: `[data-qa="rides-list"]`
- Historico no drawer: `[data-qa="client-drawer-rides"]`
- Lista de backups: `[data-qa="backups-list"]`
- Sentinel de infinite scroll: `[data-infinite-scroll-trigger="true"]`

## Regras gerais de aceite

- O `body` nao deve ganhar barra de scroll da pagina durante navegacao normal do dashboard.
- O container da lista deve manter altura fixa pela area disponivel e nao crescer junto com todos os cards.
- O sentinel nao pode ficar visivel imediatamente ao abrir a tela quando ainda ha muitos itens.
- O carregamento deve acontecer em lotes ao encostar no fim do container.
- Ao subir de volta, o scroll deve responder normalmente sem travar.
- Abrir modal ou drawer nao pode deslocar a lista errada nem prender a rolagem.

## 1. /dashboard/clients

- Abrir `/dashboard/clients` em desktop.
- Confirmar que apenas `[data-qa="clients-list"]` rola.
- Descer ate o fim e verificar carregamento progressivo.
- Confirmar que novos itens entram sem resetar o scroll para o topo.
- Voltar ao topo manualmente e verificar que o scroll continua fluido.
- Redimensionar para largura tablet e depois desktop novamente.
- Confirmar que o container continua limitado e sem scroll global no `body`.

## 2. /dashboard/clients mobile

- Abrir `/dashboard/clients` em viewport mobile.
- Confirmar que a lista rola dentro de `[data-qa="clients-list"]`.
- Descer ate o fim do container e verificar novo lote.
- Abrir detalhe de um cliente.
- Confirmar que o drawer abre sem quebrar o scroll da pagina base.
- Fechar o drawer e verificar que a lista continua na mesma pagina/contexto.

## 3. Drawer de cliente

- Com drawer aberto, confirmar que apenas `[data-qa="client-drawer-rides"]` rola no historico.
- Descer ate o fim do historico e validar infinite scroll dentro do drawer.
- Subir novamente ate o topo.
- Abrir modal de pagamento ou corrida a partir do drawer.
- Confirmar que o scroll do drawer nao vaza para o fundo.

## 4. /dashboard/rides

- Abrir `/dashboard/rides` em desktop.
- Confirmar layout em coluna unica.
- Confirmar que apenas `[data-qa="rides-list"]` rola.
- Descer ate o fim e validar carregamento progressivo.
- Observar se o sentinel aparece apenas perto do fim do container.
- Aplicar filtros, limpar filtros e repetir o teste.

## 5. /dashboard/rides mobile

- Abrir `/dashboard/rides` em viewport mobile.
- Confirmar scroll interno em `[data-qa="rides-list"]`.
- Descer ate o fim e validar novo lote.
- Abrir modal de edicao/exclusao de corrida e fechar.
- Confirmar que o scroll retorna ao container correto sem travar.

## 6. /dashboard/settings backups

- Abrir a aba de backups.
- Confirmar scroll interno em `[data-qa="backups-list"]`.
- Descer ate o fim da lista e validar carregamento por lotes.
- Iniciar download de um backup e verificar se o estado visual nao interfere no scroll.

## 7. Sinais de regressao

- O container cresce junto com os cards e nao cria area rolavel.
- O sentinel fica visivel logo ao abrir a tela e todas as paginas carregam de uma vez.
- O `body` volta a rolar no dashboard.
- Depois de abrir um modal/drawer, o scroll prende no fundo ou deixa de responder.
- Resize muda o owner do scroll ou faz a lista “explodir” em altura.
