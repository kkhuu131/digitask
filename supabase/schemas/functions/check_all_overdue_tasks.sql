-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."check_all_overdue_tasks"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  overdue_task RECORD;
  user_digimon_record RECORD;
BEGIN
  -- Find all overdue, non-completed, non-daily tasks that haven't been penalized yet
  FOR overdue_task IN 
    SELECT t.* 
    FROM tasks t
    LEFT JOIN daily_quotas q ON t.user_id = q.user_id
    WHERE 
      t.is_daily = FALSE AND 
      t.is_completed = FALSE AND 
      t.due_date < NOW() AND
      (q.penalized_tasks IS NULL OR NOT (t.id::text = ANY(q.penalized_tasks)))
  LOOP
    -- Find the user's active Digimon
    SELECT * INTO user_digimon_record 
    FROM user_digimon 
    WHERE user_id = overdue_task.user_id AND is_active = TRUE;
    
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
      SET penalized_tasks = array_append(penalized_tasks, overdue_task.id::text)
      WHERE user_id = overdue_task.user_id;

    END IF;
  END LOOP;
END;$$;

ALTER FUNCTION "public"."check_all_overdue_tasks"() OWNER TO "postgres";
