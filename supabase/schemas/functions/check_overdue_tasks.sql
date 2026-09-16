-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."check_overdue_tasks"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  user_digimon_record RECORD;
BEGIN
  -- Only process non-daily tasks that have just become overdue
  IF NEW.is_daily = FALSE AND NEW.is_completed = FALSE AND 
     NEW.due_date < NOW() AND 
     (OLD.due_date IS NULL OR OLD.due_date >= NOW()) THEN
    
    -- Find the user's active Digimon
    SELECT * INTO user_digimon_record 
    FROM user_digimon 
    WHERE user_id = NEW.user_id AND is_active = TRUE;
    
    -- Apply penalties if Digimon exists
    IF FOUND THEN
      -- Apply health and happiness penalties
      UPDATE user_digimon
      SET 
        happiness = GREATEST(0, happiness - 20)
      WHERE id = user_digimon_record.id;
      
      -- Add to penalized tasks in daily_quotas
      -- Cast the UUID to text before appending
      UPDATE daily_quotas
      SET penalized_tasks = array_append(penalized_tasks, NEW.id::text)
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;$$;

ALTER FUNCTION "public"."check_overdue_tasks"() OWNER TO "postgres";
