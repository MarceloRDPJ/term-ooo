-- =====================================================================
-- Admin role + RPCs + RLS
-- =====================================================================
-- Adds a `role` column to public.profiles, helper functions, four
-- SECURITY DEFINER admin RPCs, and RLS policies for admin access +
-- ban enforcement.
--
-- Decision: store the role as a single `text` column with a CHECK
-- constraint of ('user', 'admin', 'banned'). This is simpler than a
-- separate `is_banned` boolean and keeps the role visible in queries.
--
-- Ban enforcement happens in two places:
--   1. Inside the SECURITY DEFINER RPCs create_room / join_room via
--      a helper function is_user_banned().
--   2. In RLS write policies on the affected tables so that any
--      future SECURITY INVOKER writes are also blocked.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Add `role` column to public.profiles
-- ---------------------------------------------------------------------

alter table public.profiles
  add column if not exists role text not null default 'user';

do $$ begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('user', 'admin', 'banned'));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2) Helper functions (SECURITY DEFINER to bypass RLS on profiles)
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_user_banned(target_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = target_id
      and role = 'banned'
  );
$$;

-- ---------------------------------------------------------------------
-- 3) Recreate create_room / join_room with ban check
--    (latest body lives in 20260623163000_pitaco_vocabulary_messages.sql)
-- ---------------------------------------------------------------------

create or replace function public.create_room(
  p_code text,
  p_room_mode public.room_mode default 'multi_brain',
  p_game_mode public.game_mode default 'termo',
  p_theme public.theme_id default 'classic',
  p_max_players integer default 8,
  p_total_rounds integer default 1,
  p_settings jsonb default '{}'::jsonb
)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  if public.is_user_banned(v_user_id) then
    raise exception 'USER_BANNED' using errcode = '28000';
  end if;

  if not exists (select 1 from public.profiles where id = v_user_id) then
    insert into public.profiles (id, nickname)
    values (v_user_id, 'Estagiario')
    on conflict (id) do nothing;
  end if;

  insert into public.rooms (
    code,
    owner_id,
    room_mode,
    game_mode,
    theme,
    max_players,
    total_rounds,
    settings
  ) values (
    upper(trim(p_code)),
    v_user_id,
    p_room_mode,
    p_game_mode,
    p_theme,
    p_max_players,
    p_total_rounds,
    coalesce(p_settings, '{}'::jsonb)
  )
  returning * into v_room;

  insert into public.room_players (room_id, user_id, role, status, is_ready)
  values (v_room.id, v_user_id, 'owner', 'online', true);

  insert into public.room_game_states (room_id, game_state)
  values (v_room.id, jsonb_build_object(
    'status', 'lobby',
    'mode', p_game_mode,
    'theme', p_theme,
    'roomMode', p_room_mode,
    'createdAt', extract(epoch from now()) * 1000
  ));

  insert into public.chat_messages (scope, room_id, user_id, type, text)
  values ('room', v_room.id, v_user_id, 'system', 'Pauta aberta. Compartilhe o codigo com o time.');

  return v_room;
end;
$$;

create or replace function public.join_room(p_code text)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.rooms;
  v_player_count integer;
  v_nickname text;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  if public.is_user_banned(v_user_id) then
    raise exception 'USER_BANNED' using errcode = '28000';
  end if;

  select * into v_room
  from public.rooms
  where code = upper(trim(p_code))
  for update;

  if v_room.id is null then
    raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_room.status = 'abandoned' or v_room.expires_at <= now() then
    raise exception 'ROOM_EXPIRED' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.room_players
    where room_id = v_room.id and user_id = v_user_id
  ) then
    select count(*) into v_player_count
    from public.room_players
    where room_id = v_room.id;

    if v_player_count >= v_room.max_players then
      raise exception 'ROOM_FULL' using errcode = '22023';
    end if;
  end if;

  if not exists (select 1 from public.profiles where id = v_user_id) then
    insert into public.profiles (id, nickname)
    values (v_user_id, 'Estagiario')
    on conflict (id) do nothing;
  end if;

  insert into public.room_players (room_id, user_id, role, status, is_ready)
  values (v_room.id, v_user_id, 'player', 'online', false)
  on conflict (room_id, user_id) do update set
    status = 'online',
    last_seen_at = now();

  select nickname into v_nickname from public.profiles where id = v_user_id;

  insert into public.chat_messages (scope, room_id, user_id, nickname, type, text)
  values ('room', v_room.id, v_user_id, v_nickname, 'join', coalesce(v_nickname, 'Estagiario') || ' bateu o ponto.');

  return v_room;
end;
$$;

-- ---------------------------------------------------------------------
-- 4) Admin RPCs (all SECURITY DEFINER, restricted via is_admin check)
-- ---------------------------------------------------------------------

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  nickname text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    p.id,
    coalesce(u.email::text, ''),
    p.nickname,
    p.role,
    p.created_at,
    u.last_sign_in_at
  from public.profiles p
  left join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc
  limit 100;
$$;

create or replace function public.admin_list_rooms()
returns table (
  id uuid,
  code text,
  owner_id uuid,
  owner_nickname text,
  status public.room_status,
  room_mode public.room_mode,
  game_mode public.game_mode,
  theme public.theme_id,
  max_players integer,
  current_round integer,
  total_rounds integer,
  created_at timestamptz,
  expires_at timestamptz,
  player_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.code,
    r.owner_id,
    op.nickname,
    r.status,
    r.room_mode,
    r.game_mode,
    r.theme,
    r.max_players,
    r.current_round,
    r.total_rounds,
    r.created_at,
    r.expires_at,
    coalesce(player_counts.cnt, 0)::bigint as player_count
  from public.rooms r
  left join public.profiles op on op.id = r.owner_id
  left join (
    select room_id, count(*)::bigint as cnt
    from public.room_players
    group by room_id
  ) player_counts on player_counts.room_id = r.id
  where public.is_admin()
  order by r.created_at desc
  limit 100;
$$;

create or replace function public.admin_delete_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  if p_room_id is null then
    raise exception 'INVALID_ROOM_ID' using errcode = '22023';
  end if;

  -- FKs are defined with ON DELETE CASCADE on room_id for
  -- chat_messages, room_game_states, room_players, guess_suggestions
  -- and guess_votes, so a single delete on rooms cascades cleanly.
  delete from public.rooms where id = p_room_id;
end;
$$;

create or replace function public.admin_ban_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  if p_user_id is null then
    raise exception 'INVALID_USER_ID' using errcode = '22023';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'CANNOT_BAN_SELF' using errcode = '22023';
  end if;

  update public.profiles
  set role = 'banned',
      updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 5) GRANTs
-- ---------------------------------------------------------------------

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_user_banned(uuid) to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_list_rooms() to authenticated;
grant execute on function public.admin_delete_room(uuid) to authenticated;
grant execute on function public.admin_ban_user(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 6) RLS policies
--    a) Admin can SELECT all rows in core tables.
--    b) Banned users cannot perform writes.
-- ---------------------------------------------------------------------

-- 6a) Admin SELECT policies
drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all rooms" on public.rooms;
create policy "Admins can read all rooms"
  on public.rooms for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all room_players" on public.room_players;
create policy "Admins can read all room_players"
  on public.room_players for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all chat_messages" on public.chat_messages;
create policy "Admins can read all chat_messages"
  on public.chat_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all guess_suggestions" on public.guess_suggestions;
create policy "Admins can read all guess_suggestions"
  on public.guess_suggestions for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all guess_votes" on public.guess_votes;
create policy "Admins can read all guess_votes"
  on public.guess_votes for select
  to authenticated
  using (public.is_admin());

-- 6b) Ban-blocking policies
-- Recreate existing write policies with a banned check.
-- The user-write policies on profiles remain unchanged because the
-- initial signup of a banned user is impossible (they cannot exist
-- in auth.users with role='banned' without an admin assigning it).
-- What we DO block: banned users writing to rooms, joining rooms,
-- creating/updating game states, sending messages, suggesting, voting.

drop policy if exists "Authenticated users can create rooms" on public.rooms;
create policy "Authenticated users can create rooms"
  on public.rooms for insert
  to authenticated
  with check (owner_id = auth.uid() and not public.is_user_banned());

drop policy if exists "Room owners can update rooms" on public.rooms;
create policy "Room owners can update rooms"
  on public.rooms for update
  to authenticated
  using (owner_id = auth.uid() and not public.is_user_banned())
  with check (owner_id = auth.uid() and not public.is_user_banned());

drop policy if exists "Users can join as themselves" on public.room_players;
create policy "Users can join as themselves"
  on public.room_players for insert
  to authenticated
  with check (user_id = auth.uid() and not public.is_user_banned());

drop policy if exists "Users can update their room player row" on public.room_players;
create policy "Users can update their room player row"
  on public.room_players for update
  to authenticated
  using ((user_id = auth.uid() or public.is_room_owner(room_id)) and not public.is_user_banned())
  with check ((user_id = auth.uid() or public.is_room_owner(room_id)) and not public.is_user_banned());

drop policy if exists "Room owners can create game state" on public.room_game_states;
create policy "Room owners can create game state"
  on public.room_game_states for insert
  to authenticated
  with check (public.is_room_owner(room_id) and not public.is_user_banned());

drop policy if exists "Room owners can update game state" on public.room_game_states;
create policy "Room owners can update game state"
  on public.room_game_states for update
  to authenticated
  using (public.is_room_owner(room_id) and not public.is_user_banned())
  with check (public.is_room_owner(room_id) and not public.is_user_banned());

drop policy if exists "Authenticated users can send global chat" on public.chat_messages;
create policy "Authenticated users can send global chat"
  on public.chat_messages for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not public.is_user_banned()
    and (
      scope = 'global'
      or (scope = 'room' and room_id is not null and public.is_room_member(room_id))
    )
  );

drop policy if exists "Room members can create suggestions" on public.guess_suggestions;
create policy "Room members can create suggestions"
  on public.guess_suggestions for insert
  to authenticated
  with check (user_id = auth.uid() and not public.is_user_banned() and public.is_room_member(room_id));

drop policy if exists "Suggestion owner or room owner can update suggestions" on public.guess_suggestions;
create policy "Suggestion owner or room owner can update suggestions"
  on public.guess_suggestions for update
  to authenticated
  using ((user_id = auth.uid() or public.is_room_owner(room_id)) and not public.is_user_banned())
  with check ((user_id = auth.uid() or public.is_room_owner(room_id)) and not public.is_user_banned());

drop policy if exists "Room members can vote" on public.guess_votes;
create policy "Room members can vote"
  on public.guess_votes for insert
  to authenticated
  with check (user_id = auth.uid() and not public.is_user_banned() and public.is_room_member(room_id));
