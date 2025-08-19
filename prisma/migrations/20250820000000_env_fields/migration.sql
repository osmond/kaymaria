-- Add environment and care plan fields
ALTER TABLE "public"."Plant" ADD COLUMN "light_level" TEXT;
ALTER TABLE "public"."Plant" ADD COLUMN "indoor" BOOLEAN;
ALTER TABLE "public"."Plant" ADD COLUMN "drainage" TEXT;
ALTER TABLE "public"."Plant" ADD COLUMN "care_plan" JSONB;
