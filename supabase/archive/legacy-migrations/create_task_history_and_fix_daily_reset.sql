-- Create task_history table
CREATE TABLE IF NOT EXISTS public.task_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  tasks_completed integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Add unique constraint to prevent duplicate entries
ALTER TABLE public.task_history 
ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_task_history_user_date ON public.task_history (user_id, date);

-- Create or replace the process_daily_quotas function that handles task history correctly
CREATE OR REPLACE FUNCTION public.process_daily_quotas()
RETURNS void AS $$
DECLARE
  yesterday_date date;
  today_date date;
  user_record RECORD;
  users_processed_count integer;
BEGIN
  -- Get dates in PST timezone (America/Los_Angeles)
  -- This ensures the "day cutoff" is based on PST, not UTC
  today_date := (NOW() AT TIME ZONE 'America/Los_Angeles')::date;
  yesterday_date := today_date - INTERVAL '1 day';
  
  -- Get count of users to process before resetting
  SELECT COUNT(*) INTO users_processed_count 
  FROM public.daily_quotas;
  
  -- Process each user's daily quota
  FOR user_record IN 
    SELECT user_id, completed_today 
    FROM public.daily_quotas
  LOOP
    -- Insert or update task history for YESTERDAY (when tasks were completed)
    -- Only save history if user completed at least 1 task
    IF user_record.completed_today > 0 THEN
      INSERT INTO public.task_history (user_id, date, tasks_completed)
      VALUES (user_record.user_id, yesterday_date, user_record.completed_today)
      ON CONFLICT (user_id, date) 
      DO UPDATE SET 
        tasks_completed = EXCLUDED.tasks_completed,
        created_at = now();
      
      RAISE NOTICE 'Saved task history for user % on date % with % tasks', 
        user_record.user_id, yesterday_date, user_record.completed_today;
    END IF;
  END LOOP;
  
  -- Reset daily quotas for the new day
  -- Reset streak to 0 if user completed less than 3 tasks (didn't meet quota)
  UPDATE public.daily_quotas 
  SET 
    completed_today = 0,
    penalized_tasks = ARRAY[]::text[],
    current_streak = CASE 
      WHEN completed_today < 3 THEN 0 
      ELSE current_streak 
    END;
    
  RAISE NOTICE 'Processed daily quotas for % users on %', 
    users_processed_count, today_date;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.task_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
