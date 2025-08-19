-- Add last_done_at column to tasks
alter table public.tasks add column if not exists last_done_at timestamptz;
