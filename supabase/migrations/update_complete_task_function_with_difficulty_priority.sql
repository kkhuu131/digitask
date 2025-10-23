-- Update complete_task_all_triggers to use difficulty and priority for reward scaling
-- This migration updates the existing function to scale rewards based on task difficulty and priority

CREATE OR REPLACE FUNCTION complete_task_all_triggers(
  p_task_id UUID,
  p_user_id UUID,
  p_auto_allocate BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_record RECORD;
  v_exp_points INTEGER;
  v_exp_multiplier FLOAT;
  v_reserve_exp INTEGER;
  v_stat_cap INTEGER;
  v_daily_gains INTEGER;
  v_remaining INTEGER;
  v_boost_value INTEGER;
  v_adjusted_boost_value INTEGER := 0;
  v_saved_stats JSONB;
  v_under_stat_cap BOOLEAN;
  v_quota_completed BOOLEAN := FALSE;
  v_result JSONB;
  v_daily_quota RECORD;
  v_non_active_multiplier FLOAT := 0.5;
  v_active_digimon_id UUID;
  v_old_completed_today INTEGER;
  v_quota_threshold INTEGER := 3;
  v_current_time TIMESTAMP WITH TIME ZONE := NOW();
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_task_category TEXT;
  v_happiness_boost INTEGER := 10;
  -- New variables for difficulty/priority scaling
  v_difficulty_multiplier FLOAT := 1.0;
  v_priority_multiplier FLOAT := 1.0;
  v_stat_multiplier FLOAT := 1.0;
BEGIN
  -- STEP 1: Mark task as completed (in its own transaction)
  BEGIN
    -- Fetch task information
    SELECT * INTO v_task_record 
    FROM tasks 
    WHERE id = p_task_id AND user_id = p_user_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Task not found or does not belong to user';
    END IF;
    
    -- Save category for later
    v_task_category := v_task_record.category;
    
    -- Mark task as completed
    UPDATE tasks
    SET is_completed = TRUE, completed_at = v_current_time
    WHERE id = p_task_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating task: %', SQLERRM;
  END;
  
  -- STEP 2: Handle daily quota (in its own transaction)
  BEGIN
    -- Get current daily quota 
    SELECT * INTO v_daily_quota
    FROM daily_quotas
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Create daily quota if it doesn't exist
    IF NOT FOUND THEN
      INSERT INTO daily_quotas 
        (user_id, completed_today, consecutive_days_missed, penalized_tasks, current_streak, longest_streak)
      VALUES 
        (p_user_id, 1, 0, '{}', 0, 0)
      RETURNING * INTO v_daily_quota;
    ELSE
      -- Store old value to check for quota completion
      v_old_completed_today := v_daily_quota.completed_today;
      
      -- Check if we're completing the quota with this task
      IF v_daily_quota.completed_today + 1 >= v_quota_threshold AND v_daily_quota.completed_today < v_quota_threshold THEN
        v_quota_completed := TRUE;
        
        -- Calculate new streak values
        v_current_streak := v_daily_quota.current_streak + 1;
        v_longest_streak := GREATEST(v_daily_quota.longest_streak, v_current_streak);
        
        -- Create a new daily quota record to avoid trigger conflicts
        INSERT INTO daily_quotas (
          user_id, 
          completed_today, 
          consecutive_days_missed, 
          penalized_tasks, 
          current_streak, 
          longest_streak,
          updated_at
        ) VALUES (
          p_user_id, 
          v_quota_threshold, 
          v_daily_quota.consecutive_days_missed,
          v_daily_quota.penalized_tasks,
          v_current_streak,
          v_longest_streak,
          v_current_time
        )
        RETURNING * INTO v_daily_quota;
      ELSE
        -- Create a new record with incremented completed_today
        INSERT INTO daily_quotas (
          user_id, 
          completed_today, 
          consecutive_days_missed, 
          penalized_tasks, 
          current_streak, 
          longest_streak,
          updated_at
        ) VALUES (
          p_user_id, 
          v_daily_quota.completed_today + 1, 
          v_daily_quota.consecutive_days_missed,
          v_daily_quota.penalized_tasks,
          v_daily_quota.current_streak,
          v_daily_quota.longest_streak,
          v_current_time
        )
        RETURNING * INTO v_daily_quota;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If there's an error updating quota, we'll still try to continue
    RAISE WARNING 'Error updating daily quota: %', SQLERRM;
  END;
  
  -- STEP 3: Calculate difficulty and priority multipliers
  BEGIN
    -- Apply difficulty multiplier to both EXP and stat points
    CASE COALESCE(v_task_record.difficulty, 'medium')
      WHEN 'easy' THEN 
        v_difficulty_multiplier := 0.7;
        v_stat_multiplier := 1.0;  -- Easy tasks still give 1 stat point
      WHEN 'medium' THEN 
        v_difficulty_multiplier := 1.0;
        v_stat_multiplier := 1.0;  -- Medium tasks give 1 stat point
      WHEN 'hard' THEN 
        v_difficulty_multiplier := 1.5;
        v_stat_multiplier := 2.0;  -- Hard tasks give 2 stat points
      ELSE
        v_difficulty_multiplier := 1.0;
        v_stat_multiplier := 1.0;
    END CASE;
    
    -- Apply priority multiplier to EXP only
    CASE COALESCE(v_task_record.priority, 'medium')
      WHEN 'low' THEN 
        v_priority_multiplier := 0.8;  -- Low priority gives 20% less EXP
      WHEN 'medium' THEN 
        v_priority_multiplier := 1.0;  -- Medium priority gives normal EXP
      WHEN 'high' THEN 
        v_priority_multiplier := 1.3;  -- High priority gives 30% more EXP
      ELSE
        v_priority_multiplier := 1.0;
    END CASE;
  EXCEPTION WHEN OTHERS THEN
    -- If there's an error with multipliers, use defaults
    RAISE WARNING 'Error calculating difficulty/priority multipliers: %', SQLERRM;
    v_difficulty_multiplier := 1.0;
    v_priority_multiplier := 1.0;
    v_stat_multiplier := 1.0;
  END;
  
  -- STEP 4: Award experience points and increase happiness
  BEGIN
    -- Calculate EXP multiplier based on streak
    IF v_daily_quota.current_streak <= 1 THEN
      v_exp_multiplier := 1.0;
    ELSE
      v_exp_multiplier := LEAST(1.0 + (v_daily_quota.current_streak - 1) * 0.1, 2.5);
    END IF;
    
    -- Calculate base exp points based on task type
    IF v_task_record.is_daily THEN
      v_exp_points := 75; -- BASE_EXP_FOR_DAILY_TASK
      v_boost_value := 1; -- BASE_STAT_FOR_DAILY_TASK
    ELSIF v_task_record.recurring_days IS NOT NULL THEN
      v_exp_points := 75; -- BASE_EXP_FOR_RECURRING_TASK
      v_boost_value := 1; -- BASE_STAT_FOR_RECURRING_TASK
    ELSE
      v_exp_points := 100; -- BASE_EXP_FOR_ONE_TIME_TASK
      v_boost_value := 1; -- BASE_STAT_FOR_ONE_TIME_TASK
    END IF;
    
    -- Apply all multipliers to EXP
    v_exp_points := ROUND(v_exp_points * v_exp_multiplier * v_difficulty_multiplier * v_priority_multiplier);
    
    -- Apply stat multiplier
    v_boost_value := ROUND(v_boost_value * v_stat_multiplier);
    
    -- Get the active digimon for the user
    SELECT id INTO v_active_digimon_id
    FROM user_digimon
    WHERE user_id = p_user_id AND is_active = TRUE;
    
    -- Calculate reserve exp for return value
    v_reserve_exp := ROUND(v_exp_points * v_non_active_multiplier);
    
    -- Process active Digimon separately to avoid trigger conflicts
    IF v_active_digimon_id IS NOT NULL THEN
      -- Update exp and happiness (happiness capped at 100)
      UPDATE user_digimon
      SET 
        experience_points = experience_points + v_exp_points,
        last_fed_tasks_at = v_current_time,
        happiness = LEAST(100, happiness + v_happiness_boost)
      WHERE id = v_active_digimon_id;
    END IF;
    
    -- Process non-active Digimon separately (only exp, not happiness)
    UPDATE user_digimon
    SET experience_points = experience_points + ROUND(v_exp_points * v_non_active_multiplier),
        last_fed_tasks_at = v_current_time
    WHERE user_id = p_user_id AND id != v_active_digimon_id;
  EXCEPTION WHEN OTHERS THEN
    -- If there's an error updating exp points, we'll still try to continue
    RAISE WARNING 'Error updating experience points or happiness: %', SQLERRM;
  END;
  
  -- STEP 3.5: Contribute to weekly boss event (if active)
  BEGIN
    -- Contribute task progress to boss raid
    PERFORM contribute_boss_progress(p_user_id, 1, v_quota_completed);
  EXCEPTION WHEN OTHERS THEN
    -- If there's an error with boss progress, continue with task completion
    RAISE WARNING 'Error contributing to boss progress: %', SQLERRM;
  END;

  -- STEP 5: Handle stat allocation
  BEGIN
    -- Get the user's profile with daily_stat_gains
    SELECT daily_stat_gains, saved_stats
    INTO v_daily_gains, v_saved_stats
    FROM profiles
    WHERE id = p_user_id;
    
    -- Initialize saved_stats if null
    IF v_saved_stats IS NULL THEN
      v_saved_stats := '{"HP": 0, "SP": 0, "ATK": 0, "DEF": 0, "INT": 0, "SPD": 0}';
    END IF;
    
    -- Calculate the daily stat cap based on the number of digimon owned
    SELECT 3 + COUNT(*) INTO v_stat_cap
    FROM user_digimon
    WHERE user_id = p_user_id;
    
    -- Calculate remaining points
    v_remaining := GREATEST(0, v_stat_cap - COALESCE(v_daily_gains, 0));
    
    -- Process stat points if task has a category and there are remaining points
    IF v_task_category IS NOT NULL AND v_remaining > 0 THEN
      -- Adjust boost value based on remaining points
      v_adjusted_boost_value := LEAST(v_boost_value, v_remaining);
      
      -- Check if the active digimon is under its stat cap
      SELECT EXISTS (
        SELECT 1 FROM user_digimon ud
        WHERE ud.id = v_active_digimon_id
        AND (
          COALESCE(ud.hp_bonus, 0) + 
          COALESCE(ud.sp_bonus, 0) + 
          COALESCE(ud.atk_bonus, 0) + 
          COALESCE(ud.def_bonus, 0) + 
          COALESCE(ud.int_bonus, 0) + 
          COALESCE(ud.spd_bonus, 0)
        ) < (50 + FLOOR(COALESCE(ud.abi, 0) / 2))
      ) INTO v_under_stat_cap;
      
      -- Update user's daily stat gains 
      UPDATE profiles
      SET daily_stat_gains = COALESCE(daily_stat_gains, 0) + v_adjusted_boost_value
      WHERE id = p_user_id;
      
      -- If auto-allocate and digimon is under stat cap, increase stat directly
      IF p_auto_allocate AND v_under_stat_cap AND v_active_digimon_id IS NOT NULL THEN
        -- Apply stat boost to active Digimon based on category (in separate transactions)
        CASE v_task_category
          WHEN 'HP' THEN
            UPDATE user_digimon
            SET hp_bonus = COALESCE(hp_bonus, 0) + v_adjusted_boost_value
            WHERE id = v_active_digimon_id;
          WHEN 'SP' THEN
            UPDATE user_digimon
            SET sp_bonus = COALESCE(sp_bonus, 0) + v_adjusted_boost_value
            WHERE id = v_active_digimon_id;
          WHEN 'ATK' THEN
            UPDATE user_digimon
            SET atk_bonus = COALESCE(atk_bonus, 0) + v_adjusted_boost_value
            WHERE id = v_active_digimon_id;
          WHEN 'DEF' THEN
            UPDATE user_digimon
            SET def_bonus = COALESCE(def_bonus, 0) + v_adjusted_boost_value
            WHERE id = v_active_digimon_id;
          WHEN 'INT' THEN
            UPDATE user_digimon
            SET int_bonus = COALESCE(int_bonus, 0) + v_adjusted_boost_value
            WHERE id = v_active_digimon_id;
          WHEN 'SPD' THEN
            UPDATE user_digimon
            SET spd_bonus = COALESCE(spd_bonus, 0) + v_adjusted_boost_value
            WHERE id = v_active_digimon_id;
          ELSE
            -- Do nothing for unknown categories
        END CASE;
      ELSE
        -- Save the stat points for later allocation
        v_saved_stats := jsonb_set(
          v_saved_stats,
          ARRAY[v_task_category],
          to_jsonb(COALESCE((v_saved_stats->>v_task_category)::INTEGER, 0) + v_adjusted_boost_value)
        );
        
        -- Update saved stats
        UPDATE profiles
        SET saved_stats = v_saved_stats
        WHERE id = p_user_id;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If there's an error with stat allocation, we'll still return a result
    RAISE WARNING 'Error with stat allocation: %', SQLERRM;
  END;
  
  -- Build the result
  v_result := jsonb_build_object(
    'task_id', p_task_id,
    'exp_points', v_exp_points,
    'reserve_exp', v_reserve_exp,
    'stat_category', v_task_category,
    'stat_points', v_adjusted_boost_value,
    'remaining_stat_points', v_remaining - v_adjusted_boost_value,
    'saved_stats', v_saved_stats,
    'stat_cap', v_stat_cap,
    'daily_quota', jsonb_build_object(
      'completed_today', v_daily_quota.completed_today,
      'current_streak', v_daily_quota.current_streak,
      'quota_completed', v_quota_completed
    ),
    'auto_allocated', p_auto_allocate AND v_under_stat_cap AND v_task_category IS NOT NULL,
    -- Add difficulty and priority info to result for debugging/display
    'difficulty', v_task_record.difficulty,
    'priority', v_task_record.priority,
    'difficulty_multiplier', v_difficulty_multiplier,
    'priority_multiplier', v_priority_multiplier,
    'stat_multiplier', v_stat_multiplier
  );
  
  RETURN v_result;
END;
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION complete_task_all_triggers TO authenticated;
GRANT EXECUTE ON FUNCTION complete_task_all_triggers TO service_role;

COMMENT ON FUNCTION complete_task_all_triggers IS 'Completes a task and handles all operations in separate transactions, increases happiness by 10 (max 100), and avoids ALL trigger conflicts. Now includes difficulty and priority scaling for rewards.';
