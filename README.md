# MNU Web

Frontend do MNU, separado do backend `mnu-server` e executado inicialmente em `http://localhost:3001`.

## Executar localmente

1. Inicie o backend em `http://localhost:3000`.
2. Copie `.env.example` para `.env.local` e ajuste as URLs se necessário.
3. Instale as dependências com `pnpm install`.
4. Inicie o frontend com `pnpm dev`.

## Estrutura

- `src/app`: composição das rotas e providers.
- `src/features/<domínio>`: regras de cada domínio, separadas em `api`, `schemas`, `hooks`, `view-models`, `views` e `store` quando necessário.
- `src/components/ui`: componentes base do Shadcn.
- `src/lib`: configuração e infraestrutura compartilhada.

Componentes visuais não fazem chamadas HTTP nem concentram regras de negócio. As telas consomem view-models; estes coordenam formulários, mutations e navegação.

## Fluxo inicial de onboarding

`/onboarding` envia o cadastro ao backend. Em vez de levar o JWT na URL, a API devolve um código de uso único e curto; `/onboarding/complete` o troca pelo token da sessão e abre o painel. Isso evita expor o token de autenticação no histórico do navegador ou em logs.

As próximas telas são login do administrador, estrutura do painel e o cardápio público.
