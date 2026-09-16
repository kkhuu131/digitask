-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Verify both Digimon belong to the user
  IF NOT EXISTS (
    SELECT 1 FROM user_digimon 
    WHERE id IN (team_digimon_id, reserve_digimon_id) 
    AND user_id = user_id_param
    HAVING COUNT(*) = 2
  ) THEN
    RAISE EXCEPTION 'One or both Digimon do not belong to this user';
  END IF;
  
  -- Verify one is on team and one is not
  IF NOT EXISTS (
    SELECT 1 FROM user_digimon WHERE id = team_digimon_id AND is_on_team = true
  ) THEN
    RAISE EXCEPTION 'First Digimon is not on team';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM user_digimon WHERE id = reserve_digimon_id AND is_on_team = true
  ) THEN
    RAISE EXCEPTION 'Second Digimon is already on team';
  END IF;
  
  -- Perform the swap
  UPDATE user_digimon SET is_on_team = false WHERE id = team_digimon_id;
  UPDATE user_digimon SET is_on_team = true WHERE id = reserve_digimon_id;
END;
$$;

ALTER FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") OWNER TO "postgres";
