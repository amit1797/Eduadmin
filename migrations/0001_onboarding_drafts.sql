-- Add onboarding draft fields to schools
ALTER TABLE "schools"
  ADD COLUMN IF NOT EXISTS "onboarding_data" text,
  ADD COLUMN IF NOT EXISTS "onboarding_step" integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "onboarding_updated_at" timestamp DEFAULT CURRENT_TIMESTAMP;

-- Optional helpful index for recent drafts
CREATE INDEX IF NOT EXISTS idx_schools_onboarding_updated_at ON "schools" ("onboarding_updated_at");
