-- Add last_done_at column to tasks table
ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "last_done_at" TIMESTAMP(3);
