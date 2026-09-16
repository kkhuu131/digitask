-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."ensure_single_active_digimon"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If the new/updated row is being set to active
  IF NEW.is_active = true THEN
    -- Set all other Digimon for this user to inactive
    UPDATE user_digimon
    SET is_active = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."ensure_single_active_digimon"() OWNER TO "postgres";
