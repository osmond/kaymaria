-- Add care plan source fields
ALTER TABLE "public"."Plant" ADD COLUMN "care_plan_source" TEXT;
ALTER TABLE "public"."Plant" ADD COLUMN "preset_id" TEXT;
ALTER TABLE "public"."Plant" ADD COLUMN "ai_model" TEXT;
ALTER TABLE "public"."Plant" ADD COLUMN "ai_version" TEXT;
