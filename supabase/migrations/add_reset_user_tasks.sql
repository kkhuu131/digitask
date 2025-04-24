-- Create a function to reset tasks for a specific user
CREATE OR REPLACE FUNCTION public.reset_user_tasks
(target_user_id uuid, override_day text DEFAULT NULL)
RETURNS void AS $$
DECLARE
  current_day text;
  task_id uuid;
  task_category text;
  penalty_value integer;
BEGIN
  -- Get the current day of the week (Sunday, Monday, etc.) or use the override
  IF override_day IS NULL THEN
    current_day := trim
  (to_char
  (now
  (), 'Day'));
ELSE
    current_day := override_day;
END
IF;
  
  -- First, handle penalties for uncompleted recurring tasks scheduled for today
  FOR task_id, task_category IN
SELECT t.id, t.category
FROM public.tasks t
WHERE 
      t.user_id = target_user_id AND
  t.is_completed = false AND
  t.recurring_days IS NOT NULL AND
  t.recurring_days
@> ARRAY[current_day]::text[]
  LOOP
    -- Calculate penalty
    penalty_value := 1;
-- Default penalty

-- Apply penalty to the user's digimon happiness
UPDATE public.user_digimon
    SET happiness = GREATEST(0, happiness - penalty_value)
    WHERE user_id = target_user_id AND is_active = true;

-- Add task to penalized_tasks in daily_quotas
UPDATE public.daily_quotas
    SET penalized_tasks = array_append(penalized_tasks, task_id::text)
    WHERE user_id = target_user_id;

-- Log the penalty
RAISE NOTICE 'Applied penalty for uncompleted recurring task % for user %', task_id, target_user_id;
END LOOP;

-- Reset daily tasks for the specific user
UPDATE public.tasks
  SET is_completed = false, completed_at = NULL
  WHERE user_id = target_user_id AND is_daily = true;

-- Reset recurring tasks for the current day for the specific user
UPDATE public.tasks
  SET is_completed = false, completed_at = NULL
  WHERE 
    user_id = target_user_id AND
  recurring_days IS NOT NULL AND
  recurring_days
@> ARRAY[current_day]::text[];
    
  -- Log the reset
  RAISE NOTICE 'Reset tasks for user % on day %', target_user_id, current_day;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT reset_user_tasks('your-user-id-here');
-- Or to test with a specific day:
-- SELECT reset_user_tasks('your-user-id-here', 'Monday'); 