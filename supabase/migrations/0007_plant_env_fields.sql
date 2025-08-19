-- Add environment and care plan fields to plants
alter table public.plants add column if not exists light_level text;
alter table public.plants add column if not exists indoor boolean;
alter table public.plants add column if not exists drainage text;
alter table public.plants add column if not exists latitude double precision;
alter table public.plants add column if not exists longitude double precision;
alter table public.plants add column if not exists care_plan jsonb;
