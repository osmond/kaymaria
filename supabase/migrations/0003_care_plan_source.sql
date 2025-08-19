-- Supabase migration to add care plan source fields to plants
alter table public.plants
  add column care_plan_source text,
  add column preset_id text,
  add column ai_model text,
  add column ai_version text;
