-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."level_up_digimon"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    xp_threshold INTEGER;
BEGIN
    -- Loop in case multiple level-ups are earned at once
    LOOP
        xp_threshold := 100 + (NEW.current_level * 50);

        EXIT WHEN NEW.experience_points < xp_threshold OR NEW.current_level >= 99;

        NEW.current_level := NEW.current_level + 1;
        NEW.experience_points := NEW.experience_points - xp_threshold;

        -- Safety: don't go negative
        IF NEW.experience_points < 0 THEN
            NEW.experience_points := 0;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."level_up_digimon"() OWNER TO "postgres";
