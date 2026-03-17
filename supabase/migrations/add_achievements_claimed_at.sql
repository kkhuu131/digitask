-- Add claimed_at column to user_titles to support the new achievements claim flow.
-- NULL = earned but not yet claimed by the user (shows "Claim" button on Achievements page).
-- Non-null = claimed (rewards have been distributed).
ALTER TABLE user_titles ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ DEFAULT NULL;

-- Backfill: all titles earned before this migration are considered already claimed
-- (they were auto-awarded under the old system with no claim step).
UPDATE user_titles SET claimed_at = earned_at WHERE claimed_at IS NULL;
