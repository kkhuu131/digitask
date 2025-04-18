CREATE OR REPLACE FUNCTION allocate_stat
(
  p_digimon_id UUID,
  p_stat_type TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stat_field TEXT;
  v_current_bonus INTEGER;
  v_saved_stats JSONB;
BEGIN
  -- Convert to lowercase for column name
  v_stat_field := lower
(p_stat_type) || '_bonus';

-- Get current bonus value
EXECUTE format
('SELECT %I FROM user_digimon WHERE id = $1', v_stat_field)
  INTO v_current_bonus
  USING p_digimon_id;

-- Get saved stats from profile
SELECT saved_stats
INTO v_saved_stats
FROM profiles
WHERE id = p_user_id;

-- Check if there are any saved stats for this type
IF (v_saved_stats->>p_stat_type)::INTEGER <= 0 THEN
RETURN FALSE;
END
IF;
  
  -- Update the digimon stat - use lowercase for column name
  EXECUTE format
('UPDATE user_digimon SET %I = $1 WHERE id = $2', v_stat_field)
  USING v_current_bonus + 1, p_digimon_id;
  
  -- Decrement saved stat - use original case for JSONB keys
  v_saved_stats := jsonb_set
(
    v_saved_stats,
    ARRAY[p_stat_type],
    to_jsonb
((v_saved_stats->>p_stat_type)::INTEGER - 1)
  );

-- Update saved stats
UPDATE profiles
  SET saved_stats = v_saved_stats
  WHERE id = p_user_id;

RETURN TRUE;
END;
$$; 