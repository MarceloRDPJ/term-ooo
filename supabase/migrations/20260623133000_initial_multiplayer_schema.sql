create extension if not exists pgcrypto;

do $$ begin
  create type public.game_mode as enum ('termo', 'dueto', 'quarteto');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.room_mode as enum ('daily_team', 'theme_team', 'multi_brain', 'multi_task', 'mega_brain');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.theme_id as enum ('classic', 'frutas', 'objetos', 'filmes', 'series', 'animes');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.room_status as enum ('lobby', 'playing', 'finished', 'abandoned');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.player_role as enum ('owner', 'moderator', 'player');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.player_status as enum ('online', 'offline');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.message_scope as enum ('global', 'room');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.message_type as enum ('message', 'system', 'join', 'leave', 'guess', 'vote', 'error');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.suggestion_status as enum ('active', 'submitted', 'rejected', 'expired');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  avatar_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_length check (char_length(trim(nickname)) between 2 and 20)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.player_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode public.game_mode not null,
  theme public.theme_id not null default 'classic',
  games_played integer not null default 0,
  games_won integer not null default 0,
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  guess_distribution jsonb not null default '[]'::jsonb,
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mode, theme),
  constraint player_progress_non_negative check (
    games_played >= 0 and games_won >= 0 and current_streak >= 0 and max_streak >= 0
  ),
  constraint player_progress_wins_lte_played check (games_won <= games_played)
);

create trigger player_progress_set_updated_at
before update on public.player_progress
for each row execute function public.set_updated_at();

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status public.room_status not null default 'lobby',
  room_mode public.room_mode not null default 'multi_brain',
  game_mode public.game_mode not null default 'termo',
  theme public.theme_id not null default 'classic',
  max_players integer not null default 8,
  settings jsonb not null default '{}'::jsonb,
  current_round integer not null default 1,
  total_rounds integer not null default 1,
  invite_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint rooms_code_format check (code ~ '^[A-Z2-9]{5,8}$'),
  constraint rooms_max_players_range check (max_players between 1 and 20),
  constraint rooms_rounds_range check (total_rounds between 1 and 20),
  constraint rooms_current_round_range check (current_round between 1 and total_rounds)
);

create index if not exists rooms_owner_id_idx on public.rooms(owner_id);
create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists rooms_status_idx on public.rooms(status);

create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.player_role not null default 'player',
  status public.player_status not null default 'online',
  is_ready boolean not null default false,
  is_muted boolean not null default false,
  score integer not null default 0,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_id, user_id),
  constraint room_players_score_non_negative check (score >= 0)
);

create index if not exists room_players_room_id_idx on public.room_players(room_id);
create index if not exists room_players_user_id_idx on public.room_players(user_id);

create table if not exists public.room_game_states (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.rooms(id) on delete cascade,
  state_version integer not null default 1,
  game_state jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_game_states_version_positive check (state_version > 0)
);

create trigger room_game_states_set_updated_at
before update on public.room_game_states
for each row execute function public.set_updated_at();

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  scope public.message_scope not null,
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  nickname text,
  type public.message_type not null default 'message',
  text text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_room_scope check (
    (scope = 'global' and room_id is null) or (scope = 'room' and room_id is not null)
  ),
  constraint chat_messages_text_length check (char_length(trim(text)) between 1 and 1000)
);

create index if not exists chat_messages_global_idx on public.chat_messages(created_at desc) where scope = 'global';
create index if not exists chat_messages_room_idx on public.chat_messages(room_id, created_at desc) where scope = 'room';

create table if not exists public.guess_suggestions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  word text not null,
  normalized_word text not null,
  status public.suggestion_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guess_suggestions_word_length check (normalized_word ~ '^[a-z]{5}$')
);

create index if not exists guess_suggestions_room_id_idx on public.guess_suggestions(room_id, created_at desc);
create unique index if not exists guess_suggestions_active_word_idx
on public.guess_suggestions(room_id, normalized_word)
where status = 'active';

create trigger guess_suggestions_set_updated_at
before update on public.guess_suggestions
for each row execute function public.set_updated_at();

create table if not exists public.guess_votes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.guess_suggestions(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (suggestion_id, user_id),
  unique (room_id, user_id)
);

create index if not exists guess_votes_suggestion_id_idx on public.guess_votes(suggestion_id);
create index if not exists guess_votes_room_id_idx on public.guess_votes(room_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nickname'), ''), 'Jogador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_room_member(target_room_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_players rp
    where rp.room_id = target_room_id
      and rp.user_id = target_user_id
  );
$$;

create or replace function public.is_room_owner(target_room_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.rooms r
    where r.id = target_room_id
      and r.owner_id = target_user_id
  );
$$;

alter table public.profiles enable row level security;
alter table public.player_progress enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_game_states enable row level security;
alter table public.chat_messages enable row level security;
alter table public.guess_suggestions enable row level security;
alter table public.guess_votes enable row level security;

create policy "Profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "Users can read their progress"
on public.player_progress for select
to authenticated
using (user_id = auth.uid());

create policy "Users can write their progress"
on public.player_progress for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Authenticated users can create rooms"
on public.rooms for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Room members can read rooms"
on public.rooms for select
to authenticated
using (owner_id = auth.uid() or public.is_room_member(id));

create policy "Room owners can update rooms"
on public.rooms for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Room members can read players"
on public.room_players for select
to authenticated
using (public.is_room_member(room_id) or public.is_room_owner(room_id));

create policy "Users can join as themselves"
on public.room_players for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their room player row"
on public.room_players for update
to authenticated
using (user_id = auth.uid() or public.is_room_owner(room_id))
with check (user_id = auth.uid() or public.is_room_owner(room_id));

create policy "Room members can read game state"
on public.room_game_states for select
to authenticated
using (public.is_room_member(room_id) or public.is_room_owner(room_id));

create policy "Room owners can create game state"
on public.room_game_states for insert
to authenticated
with check (public.is_room_owner(room_id));

create policy "Room owners can update game state"
on public.room_game_states for update
to authenticated
using (public.is_room_owner(room_id))
with check (public.is_room_owner(room_id));

create policy "Authenticated users can read global chat"
on public.chat_messages for select
to authenticated
using (scope = 'global' or (scope = 'room' and room_id is not null and public.is_room_member(room_id)));

create policy "Authenticated users can send global chat"
on public.chat_messages for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    scope = 'global'
    or (scope = 'room' and room_id is not null and public.is_room_member(room_id))
  )
);

create policy "Room members can read suggestions"
on public.guess_suggestions for select
to authenticated
using (public.is_room_member(room_id));

create policy "Room members can create suggestions"
on public.guess_suggestions for insert
to authenticated
with check (user_id = auth.uid() and public.is_room_member(room_id));

create policy "Suggestion owner or room owner can update suggestions"
on public.guess_suggestions for update
to authenticated
using (user_id = auth.uid() or public.is_room_owner(room_id))
with check (user_id = auth.uid() or public.is_room_owner(room_id));

create policy "Room members can read votes"
on public.guess_votes for select
to authenticated
using (public.is_room_member(room_id));

create policy "Room members can vote"
on public.guess_votes for insert
to authenticated
with check (user_id = auth.uid() and public.is_room_member(room_id));

create policy "Users can change their own vote"
on public.guess_votes for delete
to authenticated
using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Avatar images are public"
on storage.objects for select
to public
using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own avatar"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
alter publication supabase_realtime add table public.room_game_states;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.guess_suggestions;
alter publication supabase_realtime add table public.guess_votes;
