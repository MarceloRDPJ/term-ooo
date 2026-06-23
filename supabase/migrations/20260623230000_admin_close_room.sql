-- =====================================================================
-- Add admin_close_room RPC for soft-closing open rooms.
--
-- "fechar" no vocabulario PITACO = mudar status para 'abandoned'
-- (vide ARCHITECTURE_MULTIPLAYER.md linha 135). O RPC admin_delete_room
-- continua existindo para exclusao hard.
--
-- Gate: is_admin() deve ser true. Apenas salas em 'lobby' ou 'playing'
-- podem ser fechadas (salas finished/abandoned ja estao no estado final).
-- =====================================================================

create or replace function public.admin_close_room(p_room_id uuid)
returns public.rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.rooms;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;

  select * into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_room.status not in ('lobby', 'playing') then
    raise exception 'ROOM_NOT_OPEN: status=%', v_room.status
      using errcode = 'P0001';
  end if;

  update public.rooms
  set status = 'abandoned',
      updated_at = now()
  where id = p_room_id
  returning * into v_room;

  return v_room;
end;
$$;

revoke all on function public.admin_close_room(uuid) from public;
grant execute on function public.admin_close_room(uuid) to authenticated;
