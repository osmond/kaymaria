-- Supabase migration to create plant_notes table
create table if not exists public.plant_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  note text not null,
  created_at timestamptz default now()
);

alter table public.plant_notes enable row level security;

create policy "Plant notes are user specific" on public.plant_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
