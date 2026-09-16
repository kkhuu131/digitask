-- Add recurring_days column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN recurring_days text[] DEFAULT NULL;

-- Update the reset_daily_tasks function to handle recurring tasks
CREATE OR REPLACE FUNCTION public.reset_daily_tasks
()
RETURNS void AS $$
DECLARE
  current_day text;
BEGIN
  -- Get the current day of the week (Sunday, Monday, etc.)
  current_day := to_char
(now
(), 'Day');
  current_day := trim
(current_day);

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