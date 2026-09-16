-- Create or replace the trigger that keeps profiles.battles_won / battles_completed
-- in sync when a battle is recorded.
-- NOTE: The client also increments these values directly as a fallback.
-- If you apply this migration, the trigger will run INSTEAD of (not in addition to)
-- the client update, so disable the client-side update in battleStore.ts if you want
-- to rely purely on the trigger.

CREATE OR REPLACE FUNCTION update_battle_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Always increment battles_completed for the submitting user
  UPDATE profiles
  SET battles_completed = COALESCE(battles_completed, 0) + 1,
      battles_won = CASE
        WHEN NEW.winner_id = NEW.user_id
          THEN COALESCE(battles_won, 0) + 1
        ELSE COALESCE(battles_won, 0)
      END
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS update_battle_stats_trigger ON team_battles;

CREATE TRIGGER update_battle_stats_trigger
  AFTER INSERT ON team_battles
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_stats();
