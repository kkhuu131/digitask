-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id UUID;
  v_digimon_name TEXT;
  v_current_abi INTEGER;
BEGIN
  -- Get the user ID and current name of the digimon
  SELECT user_id, name, abi INTO v_user_id, v_digimon_name, v_current_abi
  FROM user_digimon
  WHERE id = p_digimon_id;
  
  -- Verify both digimon belong to the same user
  IF NOT EXISTS (
    SELECT 1 FROM user_digimon 
    WHERE id = p_dna_partner_digimon_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'DNA partner digimon does not belong to the same user';
  END IF;
  
  -- Update the evolving digimon
  UPDATE user_digimon
  SET 
    digimon_id = p_to_digimon_id,
    current_level = 1,
    experience_points = 0,
    abi = v_current_abi + p_abi_gain
  WHERE id = p_digimon_id;
  
  -- Delete the DNA partner digimon
  DELETE FROM user_digimon
  WHERE id = p_dna_partner_digimon_id;
  
  RETURN TRUE;
END;
$$;

ALTER FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) OWNER TO "postgres";
