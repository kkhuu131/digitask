-- Function to handle DNA evolution
CREATE OR REPLACE FUNCTION dna_evolve_digimon
(
  p_digimon_id UUID,
  p_to_digimon_id INTEGER,
  p_dna_partner_digimon_id UUID,
  p_boost_points INTEGER,
  p_abi_gain INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_digimon_name TEXT;
  v_current_abi INTEGER;
BEGIN
  -- Get the user ID and current name of the digimon
  SELECT user_id, name, abi
  INTO v_user_id
  , v_digimon_name, v_current_abi
  FROM user_digimon
  WHERE id = p_digimon_id;

  -- Verify both digimon belong to the same user
  IF NOT EXISTS (
    SELECT 1
  FROM user_digimon
  WHERE id = p_dna_partner_digimon_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'DNA partner digimon does not belong to the same user';
END
IF;
  
  -- Update the evolving digimon
  UPDATE user_digimon
  SET 
    digimon_id = p_to_digimon_id,
    current_level = 1,
    experience_points = 0,
    abi = v_current_abi + p_abi_gain,
    last_evolved_at = NOW()
  WHERE id = p_digimon_id;

-- Delete the DNA partner digimon
DELETE FROM user_digimon
  WHERE id = p_dna_partner_digimon_id;

RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 