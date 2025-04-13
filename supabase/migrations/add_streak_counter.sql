-- Add current_streak column to daily_quotas table
ALTER TABLE public.daily_quotas 
ADD COLUMN current_streak integer NOT NULL DEFAULT 0;

-- Create a function to update the streak when quota is completed
CREATE OR REPLACE FUNCTION public.update_streak_on_quota_completion
()
RETURNS TRIGGER AS $$
BEGIN
    -- If we've reached or exceeded the quota requirement (3 tasks)
    IF NEW.completed_today >= 3 AND OLD.completed_today < 3 THEN
    -- Increment the streak
    NEW.current_streak := OLD.current_streak + 1;
END
IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function when daily_quotas is updated
CREATE TRIGGER update_streak_trigger
BEFORE
UPDATE ON public.daily_quotas
FOR EACH ROW
EXECUTE
FUNCTION public.update_streak_on_quota_completion
();

-- Create a function to reset streaks on daily reset
CREATE OR REPLACE FUNCTION public.reset_streak_on_missed_day
()
RETURNS TRIGGER AS $$
BEGIN
    -- If the daily quota wasn't met the previous day (less than 3 tasks)
    IF OLD.completed_today < 3 THEN
    -- Reset the streak to 0
    NEW.current_streak := 0;
END
IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for the daily reset
CREATE TRIGGER reset_streak_trigger
BEFORE
UPDATE ON public.daily_quotas
FOR EACH ROW
WHEN
(NEW.completed_today = 0 AND OLD.completed_today != 0)
EXECUTE
FUNCTION public.reset_streak_on_missed_day
(); 