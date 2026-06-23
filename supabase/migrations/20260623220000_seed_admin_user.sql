-- =====================================================================
-- Seed admin user
-- =====================================================================
-- Marks marcelorodriguesd017@gmail.com as admin.
-- Idempotent: if the user does not exist in auth.users, emits a NOTICE
-- (not an ERROR) and returns 0 rows updated. The user must sign in at
-- least once before this migration can mark them as admin.
-- =====================================================================

do $$
declare
  v_user_id uuid;
  v_rows_updated integer;
begin
  select id into v_user_id
  from auth.users
  where email = 'marcelorodriguesd017@gmail.com';

  if v_user_id is null then
    raise notice 'admin seed: no auth.users row found for marcelorodriguesd017@gmail.com - user must sign in at least once before being promoted';
    return;
  end if;

  update public.profiles
  set role = 'admin',
      updated_at = now()
  where id = v_user_id;

  get diagnostics v_rows_updated = row_count;

  if v_rows_updated = 0 then
    insert into public.profiles (id, nickname, role)
    values (v_user_id, 'Marcelo', 'admin')
    on conflict (id) do update
      set role = excluded.role,
          updated_at = now();

    raise notice 'admin seed: profile row was missing, created/updated for %', v_user_id;
  else
    raise notice 'admin seed: marked marcelorodriguesd017@gmail.com (% ) as admin', v_user_id;
  end if;
end $$;
