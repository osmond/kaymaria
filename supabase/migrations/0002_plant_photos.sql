-- Supabase migration to create plant_photos table
create table if not exists public.plant_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

alter table public.plant_photos enable row level security;

create policy "Plant photos are user specific" on public.plant_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
