-- Supabase migration to create rooms table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null
);

alter table public.rooms enable row level security;

create policy "Rooms are user specific" on public.rooms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.rooms to postgres, anon, authenticated, service_role;
