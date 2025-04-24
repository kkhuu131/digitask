-- Update the reset_daily_tasks function to handle recurring task penalties
CREATE OR REPLACE FUNCTION public.reset_daily_tasks
()
RETURNS void AS $$
DECLARE
  current_day text;
  user_id uuid;
  task_id uuid;
  task_category text;
  penalty_value integer;
BEGIN
  -- Get the current day of the week (Sunday, Monday, etc.)
  current_day := to_char
(now
(), 'Day');
  current_day := trim
(current_day);
  
  -- First, handle penalties for uncompleted recurring tasks scheduled for today
  FOR user_id, task_id, task_category IN
SELECT t.user_id, t.id, t.category
FROM public.tasks t
WHERE 
      t.is_completed = false AND
    t.recurring_days IS NOT NULL AND
    t.recurring_days
@> ARRAY[current_day]::text[]
  LOOP
    -- Calculate penalty (similar to the check_overdue_tasks function)
    penalty_value := 1;
-- Default penalty

-- Apply penalty to the user's digimon happiness instead of health
UPDATE public.user_digimon
    SET happiness = GREATEST(0, happiness - penalty_value)
    WHERE user_id = user_id AND is_active = true;

-- Add task to penalized_tasks in daily_quotas
UPDATE public.daily_quotas
    SET penalized_tasks = array_append(penalized_tasks, task_id::text)
    WHERE user_id = user_id;

-- Log the penalty
RAISE NOTICE 'Applied penalty for uncompleted recurring task % for user %', task_id, user_id;
END LOOP;

-- Reset daily tasks
UPDATE public.tasks
  SET is_completed = false, completed_at = NULL
  WHERE is_daily = true;

-- Reset recurring tasks for the current day
UPDATE public.tasks
  SET is_completed = false, completed_at = NULL
  WHERE recurring_days IS NOT NULL
    AND recurring_days
@> ARRAY[current_day]::text[];
    
  -- Log the reset
  RAISE NOTICE 'Daily and recurring tasks reset for %', current_day;
END;
$$ LANGUAGE plpgsql; 