-- Add columns for last care dates
alter table public.plants add column if not exists last_watered_at timestamptz;
alter table public.plants add column if not exists last_fertilized_at timestamptz;
