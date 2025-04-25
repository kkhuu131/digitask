CREATE OR REPLACE FUNCTION public.reset_daily_tasks
()
RETURNS void AS $$
DECLARE
  current_day text;
  loop_user_id uuid;  -- Renamed to avoid ambiguity
  loop_task_id uuid;
  loop_task_category text;
  penalty_value integer;
BEGIN
  -- Get the current day of the week (Sunday, Monday, etc.)
  current_day := to_char
(now
(), 'Day');
  current_day := trim
(current_day);
  
  -- First, handle penalties for uncompleted recurring tasks scheduled for today
  FOR loop_user_id, loop_task_id, loop_task_category IN
SELECT t.user_id, t.id, t.category
FROM public.tasks t
WHERE 
      t.is_completed = false AND
    t.recurring_days IS NOT NULL AND
    t.recurring_days
@> ARRAY[current_day]::text[]
  LOOP
    -- Calculate penalty
    penalty_value := 5;
-- Default penalty

-- Apply penalty to the user's digimon happiness
UPDATE public.user_digimon
    SET happiness = GREATEST(0, happiness - penalty_value)
    WHERE user_id = loop_user_id AND is_active = true;

-- Add task to penalized_tasks in daily_quotas
UPDATE public.daily_quotas
    SET penalized_tasks = array_append(penalized_tasks, loop_task_id::text)
    WHERE user_id = loop_user_id;

-- Log the penalty
RAISE NOTICE 'Applied penalty for uncompleted recurring task % for user %', loop_task_id, loop_user_id;
END LOOP;
  
  -- Next, handle penalties for uncompleted daily tasks
  FOR loop_user_id, loop_task_id, loop_task_category IN
SELECT t.user_id, t.id, t.category
FROM public.tasks t
WHERE 
      t.is_completed = false AND
    t.is_daily = true
LOOP
    -- Calculate penalty
    penalty_value := 5;
-- Default penalty

-- Apply penalty to the user's digimon happiness
UPDATE public.user_digimon
    SET happiness = GREATEST(0, happiness - penalty_value)
    WHERE user_id = loop_user_id AND is_active = true;

-- Add task to penalized_tasks in daily_quotas
UPDATE public.daily_quotas
    SET penalized_tasks = array_append(penalized_tasks, loop_task_id::text)
    WHERE user_id = loop_user_id;

-- Log the penalty
RAISE NOTICE 'Applied penalty for uncompleted daily task % for user %', loop_task_id, loop_user_id;
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