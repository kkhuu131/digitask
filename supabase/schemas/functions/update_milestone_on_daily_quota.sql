-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."update_milestone_on_daily_quota"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$

BEGIN

  -- If the daily quota has been completed (reached 3 tasks)

  IF NEW.completed_today >= 3 AND (OLD.completed_today < 3 OR OLD.completed_today IS NULL) THEN

    -- Check if user has a milestone record

    DECLARE

      milestone_id UUID;

    BEGIN

      SELECT id INTO milestone_id FROM user_milestones 

      WHERE user_id = NEW.user_id;

      

      IF milestone_id IS NULL THEN

        -- Create milestone record if it doesn't exist

        INSERT INTO user_milestones (

          user_id, 

          daily_quota_streak,

          tasks_completed_count

        ) VALUES (

          NEW.user_id, 

          1,

          0

        );

      ELSE

        -- Increment the daily quota streak

        UPDATE user_milestones 

        SET daily_quota_streak = daily_quota_streak + 1,

            updated_at = NOW()

        WHERE id = milestone_id;

      END IF;

    END;

  END IF;

  

  RETURN NEW;

END;

$$;

ALTER FUNCTION "public"."update_milestone_on_daily_quota"() OWNER TO "postgres";
