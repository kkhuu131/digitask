SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_completed_today()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'pg_catalog', 'public'
  AS $function$
BEGIN
  IF NEW.is_completed AND NOT COALESCE(OLD.is_completed, false) THEN
    INSERT INTO public.daily_quotas (user_id, completed_today, consecutive_days_missed)
    VALUES (NEW.user_id, 1, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET completed_today = COALESCE(daily_quotas.completed_today, 0) + 1,
        updated_at = now();

    -- One lifetime increment per completion, including later recurring-task cycles.
    -- Keep this in the task transaction, independent of the three-task daily quota.
    INSERT INTO public.user_milestones (user_id, tasks_completed_count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET tasks_completed_count = user_milestones.tasks_completed_count + 1,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- BEGIN TASK PROGRESS BACKFILL
-- Block completions while recovering a conservative lower bound. Recurring resets
-- and deleted tasks make a complete historical total unavailable. Never add these
-- overlapping sources together, reduce an existing counter, or change claims.
DO $backfill$ BEGIN
LOCK TABLE public.tasks IN SHARE ROW EXCLUSIVE MODE;
WITH evidence AS (
  SELECT user_id, count(*)::integer AS completed
  FROM public.tasks
  WHERE is_completed OR completed_at IS NOT NULL
  GROUP BY user_id
  UNION ALL
  SELECT user_id, completed_today FROM public.daily_quotas WHERE completed_today > 0
  UNION ALL
  SELECT ut.user_id, t.requirement_value::integer
  FROM public.user_titles ut JOIN public.titles t ON t.id = ut.title_id
  WHERE t.category = 'tasks' AND t.requirement_type = 'tasks_completed'
    AND t.requirement_value ~ '^[0-9]+$'
)
INSERT INTO public.user_milestones (user_id, tasks_completed_count)
SELECT user_id, max(completed) FROM evidence GROUP BY user_id HAVING max(completed) > 0
ON CONFLICT (user_id) DO UPDATE
SET tasks_completed_count = GREATEST(user_milestones.tasks_completed_count, EXCLUDED.tasks_completed_count),
    updated_at = now()
WHERE user_milestones.tasks_completed_count < EXCLUDED.tasks_completed_count;
END; $backfill$;
-- END TASK PROGRESS BACKFILL
