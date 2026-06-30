# 🏗️ PITACO — Arquitetura da Plataforma

> Documento técnico. Complementa `PLATFORM_VISION.md`.

## 1. Visão geral

```
┌─────────────────────────────────────────────────────────────┐
│                        HALL (/)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ PITACO   │ │ Cruzado  │ │ Nerdle   │ │ Geografia│  ...   │
│  │ 🐤      │ │ 🧩      │ │ 🧮      │ │ 🗺️      │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (clique no card)
┌─────────────────────────────────────────────────────────────┐
│                /play/:slug (jogo ativo)                       │
│  ┌──────────┐ ┌────────────────────────┐ ┌──────────────┐    │
│  │Header    │ │ Board / Game state     │ │  Side panel  │    │
│  │          │ │                        │ │  - dicas      │    │
│  └──────────┘ └────────────────────────┘ │  - stats      │    │
│                                          │  - sair       │    │
│                                          └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 2. Rotas

| Rota | Componente | Auth | Descrição |
|---|---|---|---|
| `/` | `HallOfGames` | opcional | Hall com cards |
| `/play/pitaco` | `Game` (existente) | opcional | Jogo solo |
| `/play/:slug` | `<Slug>Game` | opcional | Jogos futuros (a implementar) |
| `/salas` | `RoomsHome` (existente) | sim | Hall de multiplayer |
| `/sala/:code` | `RoomPage` (existente) | sim | Sala de multiplayer |
| `/perfil` | `ProfilePage` | sim | XP, achievements, stats |
| `/ranking` | `RankingPage` | sim | Leaderboard |
| `/docs` | `DocsPage` | público | Documentação |
| `/avaliar` | `ReviewsPage` | sim | Reviews agregadas |
| `/admin` | `AdminPage` (existente) | admin | Painel admin |
| `/redefinir-senha` | `ResetPasswordPage` (existente) | link | Reset de senha |

## 3. Estado

### 3.1 Camadas

| Camada | O que vive | Ferramenta | Persiste onde |
|---|---|---|---|
| **Sessão do usuário** | `user`, `session`, `profile`, `error`, `loading` | `useSupabaseAuth` (React context) | Supabase Auth + Postgres (`profiles`) |
| **UI efêmera** | modais, dropdowns, hovers | `useState` local | — |
| **Estado de jogo** | `board`, `guesses`, `score_session` | `useReducer` ou store por jogo | `localStorage` (resiliência) + `game_runs` (perpétuo) |
| **Stats cross-game** | XP total, achievements, streak | `useState` + Supabase | `user_stats` (Postgres) |
| **Cache de catálogo** | `games[]`, `reviews[]` | `useState` + Supabase Realtime | `games` (Postgres) |

### 3.2 Princípios

- **Server is the source of truth.** `localStorage` é cache para resiliência (jogo fica salvo offline; sincroniza ao reconectar).
- **RLS em toda tabela.** Mesmo padrão dos migrations existentes (`chat_messages`, `guess_suggestions`, etc).
- **Game registry é code-first.** O catálogo de jogos vive em `src/lib/games.ts`. A tabela `games` no banco espelha apenas jogos publicados (não wip). Para o MVP, o registry client-side é suficiente.

## 4. Schema de banco (migrations futuras)

```sql
-- Catálogo de jogos
create table public.games (
  slug text primary key,
  title text not null,
  description text not null,
  category text not null check (category in ('palavras','logica','geografia','atributos','som','video','auditivo')),
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  thumbnail text not null,                -- emoji ou URL
  enabled boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

-- Sessão de jogo de um user
create table public.game_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_slug text not null references public.games(slug) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  score int,
  won boolean,
  attempts int
);
create index on public.game_runs(user_id, game_slug);
create index on public.game_runs(game_slug, score desc);
create index on public.game_runs(started_at desc);

-- XP acumulado (cross-game)
create table public.user_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_xp int not null default 0,
  total_games int not null default 0,
  current_streak int not null default 0,    -- dias seguidos jogando
  max_streak int not null default 0,
  last_played_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Achievements
create table public.achievements (
  slug text primary key,
  name text not null,
  description text not null,
  icon text not null,                        -- emoji
  xp_reward int not null default 0
);
create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_slug text not null references public.achievements(slug) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_slug)
);

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_slug text not null references public.games(slug) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_slug)
);
```

## 5. Bibliotecas escolhidas (validadas)

| Categoria | Lib | Status | Justificativa |
|---|---|---|---|
| Frontend | React 19 + Vite 6 + TS 5.6 | já no PITACO | stack validado |
| Animação | Framer Motion | já no PITACO | motion docs validados |
| State global | Zustand + persist | NÃO adicionado ainda | PuzzleForge valida; ideal para cache local + Supabase como source of truth |
| UI | shadcn/ui sobre Radix | Radix já no package.json | padrões acessíveis |
| Avatar | Dicebear | já no PITACO | confirmado |
| Ícones | Lucide React | já no PITACO | — |
| Realtime | Supabase Realtime | já no PITACO | product docs validados |
| Cron | pg_cron (extensão Supabase) | NÃO adicionado | reset diário de leaderboard |
| SFX | Howler.js | NÃO adicionado | convenção, sem validação direta |

**Decisão: NÃO adicionar dependências novas nesta task.** Stack atual cobre o Hall MVP. Zustand fica para task de stats cross-game. Howler.js fica para task de SFX.

## 6. Segurança

- **RLS** em toda tabela nova (perfil só vê próprias runs, reviews são públicas para SELECT, INSERT/UPDATE/DELETE só pelo autor).
- **Validação client-side** do slug (whitelist de jogos habilitados) antes de chamar RPC.
- **XP server-side.** XP é creditado por RPC `record_game_run` que valida score e atualiza `user_stats` em transação. Client não escreve XP direto.
- **Rate limit** em reviews e reports (futuro: Supabase Edge Function com Upstash Ratelimit).

## 7. Convenções de código

- **Cada jogo é um módulo isolado** em `src/pages/games/<slug>/`. Sem dependência cruzada.
- **Engine é puro** (sem React). UI é fina. Testes unitários da engine são triviais.
- **Stats são funções puras** `(gameState, user) => UserStats`. Sem side effects.
- **i18n** pendente. Copy em PT-BR hardcoded por enquanto (consistente com o app atual).

## 8. Próximos passos (ordem sugerida)

1. ✅ Migration para `games` (catálogo) — esta task
2. ✅ Hall mínimo com `GameCard` — esta task
3. ⏭ Perfil global com XP e stats — próxima task
4. ⏭ Leaderboard com Realtime — próxima task
5. ⏭ Reviews (UI + RPCs) — próxima task
6. ⏭ PITACO Nerdle (matemática) — próxima task
7. ⏭ PITACO Cruzado (multi-grid) — próxima task
8. ⏭ PITACO Temático (múltiplos dicionários) — próxima task
9. ⏭ Onboarding modal — próxima task
10. ⏭ SFX (Howler.js) — próxima task
