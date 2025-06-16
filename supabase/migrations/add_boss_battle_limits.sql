-- Add boss battle limit tracking to existing battle_limits table
-- This reuses the existing infrastructure for arena battles

-- Add column to track boss battles used per day
ALTER TABLE battle_limits 
ADD COLUMN boss_battles_used INTEGER DEFAULT 0;

-- Create function to check and increment boss battle limit
CREATE OR REPLACE FUNCTION check_and_increment_boss_battle_limit
()
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  today DATE;
  existing_record RECORD;
  boss_battle_limit INTEGER := 5;
-- 5 boss battles per day during Phase 2
BEGIN
  -- Get current user
  user_id := auth.uid
();
IF user_id IS NULL THEN
RETURN FALSE;
END
IF;

  -- Get today's date
  today := CURRENT_DATE;

-- Get or create battle limits record
SELECT *
INTO existing_record
FROM battle_limits
WHERE battle_limits.user_id = check_and_increment_boss_battle_limit.user_id;

IF existing_record IS NULL THEN
-- Create new record
INSERT INTO battle_limits
    (user_id, battles_used, boss_battles_used, last_reset_date)
VALUES
    (user_id, 0, 1, today);
RETURN TRUE;
END
IF;

  -- Check if we need to reset for a new day
  IF existing_record.last_reset_date < today THEN
-- Reset both arena and boss battles for new day
UPDATE battle_limits 
    SET 
      battles_used = 0,
      boss_battles_used = 1,
      last_reset_date = today,
      updated_at = NOW()
    WHERE battle_limits.user_id = check_and_increment_boss_battle_limit.user_id;
RETURN TRUE;
END
IF;

  -- Check if user has reached boss battle limit
  IF existing_record.boss_battles_used >= boss_battle_limit THEN
RETURN FALSE;
END
IF;

  -- Increment boss battle count
  UPDATE battle_limits 
  SET 
    boss_battles_used = boss_battles_used + 1,
    updated_at = NOW()
  WHERE battle_limits.user_id = check_and_increment_boss_battle_limit.user_id;

RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check remaining boss battles (for UI display)
CREATE OR REPLACE FUNCTION get_remaining_boss_battles
()
RETURNS INTEGER AS $$
DECLARE
  user_id UUID;
  today DATE;
  existing_record RECORD;
  boss_battle_limit INTEGER := 5;
BEGIN
  -- Get current user
  user_id := auth.uid
();
IF user_id IS NULL THEN
RETURN 0;
END
IF;

  -- Get today's date
  today := CURRENT_DATE;

-- Get battle limits record
SELECT *
INTO existing_record
FROM battle_limits
WHERE battle_limits.user_id = get_remaining_boss_battles.user_id;

IF existing_record IS NULL THEN
-- No record exists, user has full limit
RETURN boss_battle_limit;
END
IF;

  -- Check if we need to reset for a new day
  IF existing_record.last_reset_date < today THEN
-- New day, user has full limit
RETURN boss_battle_limit;
END
IF;

  -- Return remaining battles
  RETURN GREATEST(0, boss_battle_limit - existing_record.boss_battles_used);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_increment_boss_battle_limit
() TO authenticated;
GRANT EXECUTE ON FUNCTION get_remaining_boss_battles
() TO authenticated;

-- Add comment to document the new column
COMMENT ON COLUMN battle_limits.boss_battles_used IS 'Number of weekly boss battles used today (max 5 per day during Phase 2)'; 