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

-- Remove the reset_streak_trigger since it's now handled in the cron job
-- DROP TRIGGER IF EXISTS reset_streak_trigger ON public.daily_quotas;
-- DROP FUNCTION IF EXISTS public.reset_streak_on_missed_day(); 