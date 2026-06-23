create policy "Authenticated users can discover active rooms"
on public.rooms for select
to authenticated
using (status <> 'abandoned' and expires_at > now());

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

  if not exists (select 1 from public.profiles where id = v_user_id) then
    insert into public.profiles (id, nickname)
    values (v_user_id, 'Jogador')
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
  values ('room', v_room.id, v_user_id, 'system', 'Sala criada. Compartilhe o codigo com seus amigos.');

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
    values (v_user_id, 'Jogador')
    on conflict (id) do nothing;
  end if;

  insert into public.room_players (room_id, user_id, role, status, is_ready)
  values (v_room.id, v_user_id, 'player', 'online', false)
  on conflict (room_id, user_id) do update set
    status = 'online',
    last_seen_at = now();

  select nickname into v_nickname from public.profiles where id = v_user_id;

  insert into public.chat_messages (scope, room_id, user_id, nickname, type, text)
  values ('room', v_room.id, v_user_id, v_nickname, 'join', coalesce(v_nickname, 'Jogador') || ' entrou na sala.');

  return v_room;
end;
$$;

grant execute on function public.create_room(text, public.room_mode, public.game_mode, public.theme_id, integer, integer, jsonb) to authenticated;
grant execute on function public.join_room(text) to authenticated;
