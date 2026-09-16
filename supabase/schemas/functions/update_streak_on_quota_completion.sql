-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."update_streak_on_quota_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- If we've reached or exceeded the quota requirement (3 tasks)
  IF NEW.completed_today >= 3 AND OLD.completed_today < 3 THEN
    -- Increment the streak
    NEW.current_streak := OLD.current_streak + 1;
    
    -- Also update longest_streak if the new current_streak is greater
    IF NEW.current_streak > COALESCE(NEW.longest_streak, 0) THEN
      NEW.longest_streak := NEW.current_streak;
    END IF;
  END IF;
  
  RETURN NEW;
END;$$;

ALTER FUNCTION "public"."update_streak_on_quota_completion"() OWNER TO "postgres";
