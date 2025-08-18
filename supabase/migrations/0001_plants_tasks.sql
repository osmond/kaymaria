-- Supabase migration to create plants and tasks tables
create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  room_id text,
  species text,
  pot_size text,
  pot_material text,
  soil_type text,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  type text not null,
  due_at timestamptz not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.plants enable row level security;
alter table public.tasks enable row level security;

-- Policies to ensure users can only access their own data
create policy "Plants are user specific" on public.plants
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Tasks are user specific" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
