-- =====================================================================
-- Refine RLS policies on the platform catalog tables.
--
-- Two problems from agent 3 review:
--   (a) "Anyone can read enabled games" hides disabled games from EVERYONE,
--       including admins. The /admin page needs to see the full catalog
--       so it can re-enable a broken game without a deploy.
--   (b) The service_role policy was redundant (service_role bypasses RLS
--       by default) and we never had an explicit "no client insert" rule.
--       Defensive posture: future code that tries to insert game_runs
--       from the client (bypassing the planned RPCs) is denied at the
--       database level.
-- =====================================================================

drop policy if exists "Anyone can read enabled games" on public.games;
drop policy if exists "Service role can manage game_runs" on public.game_runs;

-- Public: anyone can read ENABLED games.
-- Admins: can also see DISABLED games (needed for the admin panel).
drop policy if exists "Public reads enabled games, admins read all" on public.games;
create policy "Public reads enabled games, admins read all"
  on public.games
  for select
  using (enabled = true or public.is_admin());

-- Defensive: clients cannot insert/update/delete game_runs directly.
-- Writes go through RPCs (record_game_run) in a follow-up migration
-- so XP is computed server-side.
drop policy if exists "Clients cannot insert game_runs" on public.game_runs;
create policy "Clients cannot insert game_runs"
  on public.game_runs
  for insert
  to authenticated
  with check (false);

drop policy if exists "Clients cannot update game_runs" on public.game_runs;
create policy "Clients cannot update game_runs"
  on public.game_runs
  for update
  to authenticated
  using (false)
  with check (false);

drop policy if exists "Clients cannot delete game_runs" on public.game_runs;
create policy "Clients cannot delete game_runs"
  on public.game_runs
  for delete
  to authenticated
  using (false);

-- Public read of game_runs stays as-is (for leaderboards).
-- Service role no longer needs the redundant policy.
