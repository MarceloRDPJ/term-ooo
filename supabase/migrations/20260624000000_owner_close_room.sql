-- =====================================================================
-- Add owner_close_room RPC for room owners to soft-close their own rooms.
--
-- "fechar" no vocabulario PITACO = mudar status para 'abandoned'
-- (vide ARCHITECTURE_MULTIPLAYER.md linha 135). Esta funcao e destinada
-- aos donos das salas (owner) e admins. E separada de admin_close_room
-- (que e restrita a admins).
--
-- Gate: auth.uid() deve estar autenticado E (v_room.owner_id = auth.uid()
-- OR public.is_admin()). Apenas salas em 'lobby' ou 'playing' podem ser
-- fechadas (salas finished/abandoned ja estao no estado final).
-- =====================================================================

create or replace function public.owner_close_room(p_room_id uuid)
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
    raise exception 'NOT_AUTH' using errcode = '42501';
  end if;

  select * into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if v_room.id is null then
    raise exception 'ROOM_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_room.owner_id <> v_user_id and not public.is_admin() then
    raise exception 'NOT_OWNER_OR_ADMIN' using errcode = '42501';
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

revoke all on function public.owner_close_room(uuid) from public;
grant execute on function public.owner_close_room(uuid) to authenticated;
