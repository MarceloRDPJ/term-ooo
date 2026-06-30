-- =====================================================================
-- PITACO Platform: games catalog and game_runs schema.
--
-- This migration lays the foundation for the multi-game platform.
-- See PLATFORM_VISION.md and PLATFORM_ARCHITECTURE.md for context.
--
-- For the MVP, the games catalog is code-first in src/lib/games.ts.
-- This table mirrors only enabled, public-facing games so admins
-- can disable a broken game without a deploy.
--
-- game_runs is the per-session log used for:
--   - leaderboard (daily/weekly/all-time)
--   - stats per user per game
--   - achievements (cross-game XP)
--   - audit
--
-- XP is computed server-side in a follow-up RPC (record_game_run)
-- so clients cannot inflate their own XP.
-- =====================================================================

create table if not exists public.games (
  slug text primary key,
  title text not null,
  description text not null,
  category text not null check (category in (
    'palavras', 'logica', 'geografia', 'atributos', 'som', 'video', 'auditivo'
  )),
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  thumbnail text not null,
  enabled boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

-- Seed the catalog with the games PITACO ships today.
insert into public.games (slug, title, description, category, difficulty, thumbnail, sort_order) values
  ('pitaco', 'PITACO', 'Adivinhe a palavra de 5 letras em 6 tentativas. Classico do escritorio.', 'palavras', 1, '🐤', 10),
  ('pitaco-cruzado', 'PITACO Cruzado', 'Resolva 4 palavras em paralelo, no mesmo turno. Inspirado em Quordle.', 'palavras', 3, '🧩', 20),
  ('pitaco-nerdle', 'PITACO Nerdle', 'Adivinhe a equacao matematica de 8 caracteres em 6 tentativas.', 'logica', 3, '🧮', 30),
  ('pitaco-tematico', 'PITACO Tematico', 'Mesmo jogo, mas o dicionario muda: frutas, filmes, series, objetos.', 'palavras', 2, '🍇', 40),
  ('pitaco-geografia', 'PITACO Geografia', 'Adivinhe o estado brasileiro pela silhueta. Feedback por distancia.', 'geografia', 2, '🗺️', 50),
  ('pitaco-atributos', 'PITACO Atributos', 'Adivinhe o auditor pelo cargo, equipe e senioridade. Inspirado em Poeltl.', 'atributos', 3, '🏷️', 60),
  ('pitaco-emoji', 'PITACO Emoji', 'Decifre o auditor pela combinacao de emojis. Inspirado em Loldle Emoji.', 'atributos', 2, '😀', 70),
  ('pitaco-citacao', 'PITACO Citacao', 'Adivinhe o auditor pela citacao que ele mandou no chat. Inspirado em Loldle Quote.', 'auditivo', 3, '💬', 80)
on conflict (slug) do nothing;

create table if not exists public.game_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_slug text not null references public.games(slug) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  score int,
  won boolean,
  attempts int,
  check (ended_at is null or ended_at >= started_at)
);

create index if not exists game_runs_user_game_idx
  on public.game_runs (user_id, game_slug, score desc);

create index if not exists game_runs_leaderboard_idx
  on public.game_runs (game_slug, score desc nulls last, ended_at desc);

create index if not exists game_runs_recent_idx
  on public.game_runs (user_id, started_at desc);

-- RLS: users can read all game_runs (leaderboard is public), but only
-- their own writes. Inserts go through RPCs in a follow-up migration
-- so XP is computed server-side.
alter table public.games enable row level security;
alter table public.game_runs enable row level security;

-- Everyone can read enabled games (the catalog is public).
drop policy if exists "Anyone can read enabled games" on public.games;
create policy "Anyone can read enabled games"
  on public.games
  for select
  using (enabled = true);

-- game_runs: SELECT is public (needed for leaderboards and reviews),
-- but writes go through RPCs (record_game_run, future migration).
drop policy if exists "Anyone can read game_runs" on public.game_runs;
create policy "Anyone can read game_runs"
  on public.game_runs
  for select
  using (true);

drop policy if exists "Service role can manage game_runs" on public.game_runs;
create policy "Service role can manage game_runs"
  on public.game_runs
  for all
  to service_role
  using (true)
  with check (true);
