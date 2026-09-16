-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."assign_personality_to_digimon"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only assign if no personality was manually given
  IF NEW.personality IS NULL THEN
    CASE (NEW.digimon_id % 6)
      WHEN 0 THEN NEW.personality := 'Durable';
      WHEN 1 THEN NEW.personality := 'Lively';
      WHEN 2 THEN NEW.personality := 'Fighter';
      WHEN 3 THEN NEW.personality := 'Defender';
      WHEN 4 THEN NEW.personality := 'Brainy';
      WHEN 5 THEN NEW.personality := 'Nimble';
    END CASE;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."assign_personality_to_digimon"() OWNER TO "postgres";
