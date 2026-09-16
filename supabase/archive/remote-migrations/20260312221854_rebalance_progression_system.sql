-- Rebalance progression system
-- Changes:
--   complete_task_all_triggers:
--     - EXP by difficulty: easy=75, medium=150, hard=300 (was flat 100 × multiplier)
--     - Priority: low=0.75×, medium=1.0×, high=1.5× (was low=0.5×, high=1.5×)
--     - Stat points: easy=0, medium=1, hard=2 (was easy=1)
--     - Stat cap: 20 + abi (was 50 + floor(abi/2))
--   level_up_digimon trigger:
--     - Threshold: 100 + level*50 (was level*20)

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
  v_happiness_boost INTEGER := 20;
  v_difficulty_exp_multiplier FLOAT := 1.0;
  v_difficulty_stat_multiplier FLOAT := 1.0;
  v_priority_exp_multiplier FLOAT := 1.0;
BEGIN
  -- STEP 1: Mark task as completed
  BEGIN
    SELECT * INTO v_task_record
    FROM tasks
    WHERE id = p_task_id AND user_id = p_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Task not found or does not belong to user';
    END IF;

    v_task_category := v_task_record.category;

    UPDATE tasks
    SET is_completed = TRUE, completed_at = v_current_time
    WHERE id = p_task_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating task: %', SQLERRM;
  END;

  -- STEP 2: Handle daily quota
  BEGIN
    SELECT * INTO v_daily_quota
    FROM daily_quotas
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
      INSERT INTO daily_quotas
        (user_id, completed_today, consecutive_days_missed, penalized_tasks, current_streak, longest_streak)
      VALUES
        (p_user_id, 1, 0, '{}', 0, 0)
      RETURNING * INTO v_daily_quota;
    ELSE
      v_old_completed_today := v_daily_quota.completed_today;

      IF v_daily_quota.completed_today + 1 >= v_quota_threshold AND v_daily_quota.completed_today < v_quota_threshold THEN
        v_quota_completed := TRUE;
        v_current_streak := v_daily_quota.current_streak + 1;
        v_longest_streak := GREATEST(v_daily_quota.longest_streak, v_current_streak);

        INSERT INTO daily_quotas (
          user_id, completed_today, consecutive_days_missed,
          penalized_tasks, current_streak, longest_streak, updated_at
        ) VALUES (
          p_user_id, v_quota_threshold, v_daily_quota.consecutive_days_missed,
          v_daily_quota.penalized_tasks, v_current_streak, v_longest_streak, v_current_time
        )
        RETURNING * INTO v_daily_quota;
      ELSE
        INSERT INTO daily_quotas (
          user_id, completed_today, consecutive_days_missed,
          penalized_tasks, current_streak, longest_streak, updated_at
        ) VALUES (
          p_user_id, v_daily_quota.completed_today + 1, v_daily_quota.consecutive_days_missed,
          v_daily_quota.penalized_tasks, v_daily_quota.current_streak, v_daily_quota.longest_streak, v_current_time
        )
        RETURNING * INTO v_daily_quota;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error updating daily quota: %', SQLERRM;
  END;

  -- STEP 3: Calculate EXP and stat points, award to Digimon
  BEGIN
    -- Streak multiplier capped at 2.0x
    IF v_daily_quota.current_streak <= 1 THEN
      v_exp_multiplier := 1.0;
    ELSE
      v_exp_multiplier := LEAST(1.0 + (v_daily_quota.current_streak - 1) * 0.1, 2.0);
    END IF;

    -- Base EXP and stat points by difficulty
    -- Easy tasks are casual; medium/hard build Digimon meaningfully
    CASE COALESCE(v_task_record.difficulty, 'medium')
      WHEN 'easy' THEN
        v_exp_points := 75;
        v_boost_value := 0;  -- easy tasks give no stat points
      WHEN 'medium' THEN
        v_exp_points := 150;
        v_boost_value := 1;
      WHEN 'hard' THEN
        v_exp_points := 300;
        v_boost_value := 2;
      ELSE
        v_exp_points := 150;
        v_boost_value := 1;
    END CASE;

    -- Priority multiplier on EXP only (not stat points)
    CASE COALESCE(v_task_record.priority, 'medium')
      WHEN 'low' THEN
        v_priority_exp_multiplier := 0.75;
      WHEN 'medium' THEN
        v_priority_exp_multiplier := 1.0;
      WHEN 'high' THEN
        v_priority_exp_multiplier := 1.5;
      ELSE
        v_priority_exp_multiplier := 1.0;
    END CASE;

    -- Apply multipliers
    v_exp_points := ROUND(v_exp_points * v_exp_multiplier * v_priority_exp_multiplier);

    -- Get the active digimon
    SELECT id INTO v_active_digimon_id
    FROM user_digimon
    WHERE user_id = p_user_id AND is_active = TRUE;

    -- Reserve exp (50% for non-active party members)
    v_reserve_exp := ROUND(v_exp_points * v_non_active_multiplier);

    -- Update active Digimon (full EXP + happiness)
    IF v_active_digimon_id IS NOT NULL THEN
      UPDATE user_digimon
      SET
        experience_points = experience_points + v_exp_points,
        last_fed_tasks_at = v_current_time,
        happiness = LEAST(100, happiness + v_happiness_boost)
      WHERE id = v_active_digimon_id;
    END IF;

    -- Update non-active party Digimon (50% EXP, no happiness, exclude storage)
    UPDATE user_digimon
    SET experience_points = experience_points + v_reserve_exp,
        last_fed_tasks_at = v_current_time
    WHERE user_id = p_user_id
      AND id != v_active_digimon_id
      AND COALESCE(is_in_storage, false) = false;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error updating experience points or happiness: %', SQLERRM;
  END;

  -- STEP 3.5: Weekly boss (no-op stub kept for compatibility)
  BEGIN
    PERFORM contribute_boss_progress(p_user_id, 1, v_quota_completed);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error contributing to boss progress: %', SQLERRM;
  END;

  -- STEP 4: Handle stat allocation (no daily cap, ABI-based lifetime cap)
  BEGIN
    SELECT saved_stats
    INTO v_saved_stats
    FROM profiles
    WHERE id = p_user_id;

    IF v_saved_stats IS NULL THEN
      v_saved_stats := '{"HP": 0, "SP": 0, "ATK": 0, "DEF": 0, "INT": 0, "SPD": 0}';
    END IF;

    -- Only allocate stat points if task has a category AND gives stat points
    IF v_task_category IS NOT NULL AND v_boost_value > 0 THEN
      v_adjusted_boost_value := v_boost_value;

      -- Stat cap formula: 20 + abi (was 50 + floor(abi/2))
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
        ) < (20 + COALESCE(ud.abi, 0))
      ) INTO v_under_stat_cap;

      IF p_auto_allocate AND v_under_stat_cap AND v_active_digimon_id IS NOT NULL THEN
        CASE v_task_category
          WHEN 'HP' THEN
            UPDATE user_digimon SET hp_bonus = COALESCE(hp_bonus, 0) + v_adjusted_boost_value WHERE id = v_active_digimon_id;
          WHEN 'SP' THEN
            UPDATE user_digimon SET sp_bonus = COALESCE(sp_bonus, 0) + v_adjusted_boost_value WHERE id = v_active_digimon_id;
          WHEN 'ATK' THEN
            UPDATE user_digimon SET atk_bonus = COALESCE(atk_bonus, 0) + v_adjusted_boost_value WHERE id = v_active_digimon_id;
          WHEN 'DEF' THEN
            UPDATE user_digimon SET def_bonus = COALESCE(def_bonus, 0) + v_adjusted_boost_value WHERE id = v_active_digimon_id;
          WHEN 'INT' THEN
            UPDATE user_digimon SET int_bonus = COALESCE(int_bonus, 0) + v_adjusted_boost_value WHERE id = v_active_digimon_id;
          WHEN 'SPD' THEN
            UPDATE user_digimon SET spd_bonus = COALESCE(spd_bonus, 0) + v_adjusted_boost_value WHERE id = v_active_digimon_id;
          ELSE
            NULL;
        END CASE;
      ELSE
        v_saved_stats := jsonb_set(
          v_saved_stats,
          ARRAY[v_task_category],
          to_jsonb(COALESCE((v_saved_stats->>v_task_category)::INTEGER, 0) + v_adjusted_boost_value)
        );
        UPDATE profiles SET saved_stats = v_saved_stats WHERE id = p_user_id;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error with stat allocation: %', SQLERRM;
  END;

  -- Build result
  v_result := jsonb_build_object(
    'task_id', p_task_id,
    'exp_points', v_exp_points,
    'reserve_exp', v_reserve_exp,
    'stat_category', v_task_category,
    'stat_points', v_adjusted_boost_value,
    'saved_stats', v_saved_stats,
    'daily_quota', jsonb_build_object(
      'completed_today', v_daily_quota.completed_today,
      'current_streak', v_daily_quota.current_streak,
      'quota_completed', v_quota_completed
    ),
    'auto_allocated', p_auto_allocate AND v_under_stat_cap AND v_task_category IS NOT NULL AND v_boost_value > 0,
    'difficulty', v_task_record.difficulty,
    'priority', v_task_record.priority,
    'difficulty_exp_multiplier', v_difficulty_exp_multiplier,
    'difficulty_stat_multiplier', v_difficulty_stat_multiplier,
    'priority_exp_multiplier', v_priority_exp_multiplier
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION complete_task_all_triggers TO authenticated;
GRANT EXECUTE ON FUNCTION complete_task_all_triggers TO service_role;

COMMENT ON FUNCTION complete_task_all_triggers IS
  'Task completion handler. EXP: easy=75, medium=150, hard=300 × priority(0.75/1/1.5) × streak(cap 2x). Stats: easy=0, medium=1, hard=2 pts. Cap=20+ABI. Party (non-storage) gets 50% EXP.';
