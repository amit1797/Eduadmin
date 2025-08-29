-- Drop legacy onboarding columns from schools table
ALTER TABLE schools
  DROP COLUMN IF EXISTS onboarding_data,
  DROP COLUMN IF EXISTS onboarding_step,
  DROP COLUMN IF EXISTS onboarding_updated_at;
