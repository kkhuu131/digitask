-- Baseline captured from the live Supabase database on 2026-09-16.
-- Existing production: mark this version applied ONLY after schema verification.
-- Fresh databases: execute normally. Never replay this on existing production.

SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = on;

SELECT pg_catalog.set_config('search_path', '', false);

SET check_function_bodies = false;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";

CREATE EXTENSION IF NOT EXISTS "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text" DEFAULT NULL::"text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_uuid TEXT;
  generated_username TEXT;
BEGIN
  -- Get the first 5 characters of the user's UUID
  SELECT SUBSTRING(id::TEXT, 1, 5) INTO user_uuid
  FROM auth.users
  WHERE id = user_id;
  
  -- If no new username provided, generate one
  IF new_username IS NULL THEN
    generated_username := 'User' || user_uuid;
  ELSE
    generated_username := new_username;
  END IF;
  
  -- Update the username in the profiles table
  UPDATE profiles
  SET username = generated_username,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN generated_username;
END;
$$;

ALTER FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  v_stat_field TEXT;
  v_current_bonus INTEGER;
  v_saved_stats JSONB;
BEGIN
  -- IMPORTANT: Convert to lowercase for column name
  v_stat_field := lower(p_stat_type) || '_bonus';
  
  -- Get current bonus value
  EXECUTE format('SELECT %I FROM user_digimon WHERE id = $1', v_stat_field)
  INTO v_current_bonus
  USING p_digimon_id;
  
  -- If null, set to 0
  IF v_current_bonus IS NULL THEN
    v_current_bonus := 0;
  END IF;
  
  -- Get saved stats
  SELECT saved_stats INTO v_saved_stats
  FROM profiles
  WHERE id = p_user_id;
  
  -- If saved_stats is NULL, initialize it
  IF v_saved_stats IS NULL THEN
    v_saved_stats := '{"HP": 0, "SP": 0, "ATK": 0, "DEF": 0, "INT": 0, "SPD": 0}'::JSONB;
  END IF;
  
  -- Check if we have stats to allocate - use original case for JSONB keys
  IF (v_saved_stats->>p_stat_type)::INTEGER <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Update the digimon stat - use lowercase for column name
  EXECUTE format('UPDATE user_digimon SET %I = $1 WHERE id = $2', v_stat_field)
  USING v_current_bonus + 1, p_digimon_id;
  
  -- Decrement saved stat - use original case for JSONB keys
  v_saved_stats := jsonb_set(
    v_saved_stats,
    ARRAY[p_stat_type],
    to_jsonb((v_saved_stats->>p_stat_type)::INTEGER - 1)
  );
  
  -- Update saved stats
  UPDATE profiles
  SET saved_stats = v_saved_stats
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$_$;

ALTER FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."assign_personality_to_digimon"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only assign if no personality was manually given
  IF NEW.personality IS NULL THEN
    CASE (NEW.digimon_id % 6)
      WHEN 0 THEN NEW.personality := 'Durable';
      WHEN 1 THEN NEW.personality := 'Lively';
      WHEN 2 THEN NEW.personality := 'Fighter';
      WHEN 3 THEN NEW.personality := 'Defender';
      WHEN 4 THEN NEW.personality := 'Brainy';
      WHEN 5 THEN NEW.personality := 'Nimble';
    END CASE;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."assign_personality_to_digimon"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_all_overdue_tasks"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  overdue_task RECORD;
  user_digimon_record RECORD;
BEGIN
  -- Find all overdue, non-completed, non-daily tasks that haven't been penalized yet
  FOR overdue_task IN 
    SELECT t.* 
    FROM tasks t
    LEFT JOIN daily_quotas q ON t.user_id = q.user_id
    WHERE 
      t.is_daily = FALSE AND 
      t.is_completed = FALSE AND 
      t.due_date < NOW() AND
      (q.penalized_tasks IS NULL OR NOT (t.id::text = ANY(q.penalized_tasks)))
  LOOP
    -- Find the user's active Digimon
    SELECT * INTO user_digimon_record 
    FROM user_digimon 
    WHERE user_id = overdue_task.user_id AND is_active = TRUE;
    
    -- Apply penalties if Digimon exists
    IF FOUND THEN
      -- Apply health and happiness penalties
      UPDATE user_digimon
      SET 
        happiness = GREATEST(0, happiness - 20)
      WHERE id = user_digimon_record.id;
      
      -- Add to penalized tasks in daily_quotas
      -- Cast the UUID to text before appending
      UPDATE daily_quotas
      SET penalized_tasks = array_append(penalized_tasks, overdue_task.id::text)
      WHERE user_id = overdue_task.user_id;

    END IF;
  END LOOP;
END;$$;

ALTER FUNCTION "public"."check_all_overdue_tasks"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_and_increment_battle_limit"() RETURNS TABLE("success" boolean, "battles_used" integer, "battles_remaining" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _user_id UUID := auth.uid();
  _today DATE := CURRENT_DATE;
  _max_battles INTEGER := 5;
  _battle_limit RECORD;
BEGIN
  -- Get or create battle limit record
  SELECT * INTO _battle_limit FROM battle_limits 
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    -- Create new record if none exists
    INSERT INTO battle_limits (user_id, battles_used, last_reset_date)
    VALUES (_user_id, 0, _today)
    RETURNING * INTO _battle_limit;
  END IF;
  
  -- Check if we need to reset for a new day
  IF _battle_limit.last_reset_date < _today THEN
    UPDATE battle_limits 
    SET battles_used = 0, 
        last_reset_date = _today,
        updated_at = NOW()
    WHERE user_id = _user_id
    RETURNING * INTO _battle_limit;
  END IF;
  
  -- Check if user has battles remaining
  IF _battle_limit.battles_used >= _max_battles THEN
    RETURN QUERY SELECT 
      FALSE AS success, 
      _battle_limit.battles_used, 
      0 AS battles_remaining;
    RETURN;
  END IF;
  
  -- Increment battles_used
  UPDATE battle_limits 
  SET battles_used = battle_limits.battles_used + 1,
      updated_at = NOW()
  WHERE user_id = _user_id
  RETURNING * INTO _battle_limit;
  
  -- Return success and updated counts
  RETURN QUERY SELECT 
    TRUE AS success, 
    _battle_limit.battles_used, 
    (_max_battles - _battle_limit.battles_used) AS battles_remaining;
END;
$$;

ALTER FUNCTION "public"."check_and_increment_battle_limit"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_and_set_first_win"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_last date;
  v_today date := (now() AT TIME ZONE 'America/Los_Angeles')::date;
BEGIN
  SELECT last_arena_first_win INTO v_last FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF v_last IS DISTINCT FROM v_today THEN
    UPDATE public.profiles SET last_arena_first_win = v_today WHERE id = p_user_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

ALTER FUNCTION "public"."check_and_set_first_win"("p_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_and_set_first_win_self"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_last date;
  v_today date := (now() AT TIME ZONE 'America/Los_Angeles')::date;
BEGIN
  SELECT last_arena_first_win INTO v_last FROM public.profiles WHERE id = auth.uid() FOR UPDATE;

  IF v_last IS DISTINCT FROM v_today THEN
    UPDATE public.profiles SET last_arena_first_win = v_today WHERE id = auth.uid();
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

ALTER FUNCTION "public"."check_and_set_first_win_self"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_overdue_tasks"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  user_digimon_record RECORD;
BEGIN
  -- Only process non-daily tasks that have just become overdue
  IF NEW.is_daily = FALSE AND NEW.is_completed = FALSE AND 
     NEW.due_date < NOW() AND 
     (OLD.due_date IS NULL OR OLD.due_date >= NOW()) THEN
    
    -- Find the user's active Digimon
    SELECT * INTO user_digimon_record 
    FROM user_digimon 
    WHERE user_id = NEW.user_id AND is_active = TRUE;
    
    -- Apply penalties if Digimon exists
    IF FOUND THEN
      -- Apply health and happiness penalties
      UPDATE user_digimon
      SET 
        happiness = GREATEST(0, happiness - 20)
      WHERE id = user_digimon_record.id;
      
      -- Add to penalized tasks in daily_quotas
      -- Cast the UUID to text before appending
      UPDATE daily_quotas
      SET penalized_tasks = array_append(penalized_tasks, NEW.id::text)
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;$$;

ALTER FUNCTION "public"."check_overdue_tasks"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."cleanup_team_battles"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM public.team_battles LOOP
        DELETE FROM public.team_battles
        WHERE user_id = user_record.user_id
        AND id NOT IN (
            SELECT id FROM public.team_battles
            WHERE user_id = user_record.user_id
            ORDER BY created_at DESC
            LIMIT 20
        );
    END LOOP;
END;
$$;

ALTER FUNCTION "public"."cleanup_team_battles"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean DEFAULT false) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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

ALTER FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) IS 'Task completion handler. EXP: easy=75, medium=150, hard=300 × priority(0.75/1/1.5) × streak(cap 2x). Stats: easy=0, medium=1, hard=2 pts. Cap=20+ABI. Party (non-storage) gets 50% EXP.';

CREATE OR REPLACE FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer DEFAULT 1, "p_is_daily_quota" boolean DEFAULT false) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Weekly boss feature has been removed. No-op.
  RETURN TRUE;
END;
$$;

ALTER FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_add_dna_requirement_function"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  CREATE OR REPLACE FUNCTION public.add_dna_requirement_column()
  RETURNS void AS $func$
  BEGIN
    ALTER TABLE public.evolution_paths 
    ADD COLUMN IF NOT EXISTS dna_requirement INTEGER NULL REFERENCES public.digimon(id);
  END;
  $func$ LANGUAGE plpgsql;
END;
$_$;

ALTER FUNCTION "public"."create_add_dna_requirement_function"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."delete_user_and_data"("input_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  delete from battle_limits where user_id = input_user_id;
  delete from daily_quotas where user_id = input_user_id;
  delete from user_digimon where user_id = input_user_id;
  delete from user_milestones where user_id = input_user_id;
  delete from user_discovered_digimon where user_id = input_user_id;
  delete from team_battles where user_id = input_user_id;
  delete from tasks where user_id = input_user_id;
  delete from profiles where id = input_user_id;

  delete from auth.users where id = input_user_id;
end;
$$;

ALTER FUNCTION "public"."delete_user_and_data"("input_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id UUID;
  v_digimon_name TEXT;
  v_current_abi INTEGER;
BEGIN
  -- Get the user ID and current name of the digimon
  SELECT user_id, name, abi INTO v_user_id, v_digimon_name, v_current_abi
  FROM user_digimon
  WHERE id = p_digimon_id;
  
  -- Verify both digimon belong to the same user
  IF NOT EXISTS (
    SELECT 1 FROM user_digimon 
    WHERE id = p_dna_partner_digimon_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'DNA partner digimon does not belong to the same user';
  END IF;
  
  -- Update the evolving digimon
  UPDATE user_digimon
  SET 
    digimon_id = p_to_digimon_id,
    current_level = 1,
    experience_points = 0,
    abi = v_current_abi + p_abi_gain
  WHERE id = p_digimon_id;
  
  -- Delete the DNA partner digimon
  DELETE FROM user_digimon
  WHERE id = p_dna_partner_digimon_id;
  
  RETURN TRUE;
END;
$$;

ALTER FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."ensure_single_active_digimon"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If the new/updated row is being set to active
  IF NEW.is_active = true THEN
    -- Set all other Digimon for this user to inactive
    UPDATE user_digimon
    SET is_active = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."ensure_single_active_digimon"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."generate_enemy_team"("avg_level" integer) RETURNS TABLE("digimon_id" integer, "name" "text", "stage" "text", "type" "text", "attribute" "text", "sprite_url" "text", "hp" integer, "sp" integer, "atk" integer, "def" integer, "int" integer, "spd" integer, "detail_url" "text", "hp_level1" integer, "sp_level1" integer, "atk_level1" integer, "def_level1" integer, "int_level1" integer, "spd_level1" integer, "hp_level99" integer, "sp_level99" integer, "atk_level99" integer, "def_level99" integer, "int_level99" integer, "spd_level99" integer, "is_alpha" boolean, "level" integer)
    LANGUAGE "plpgsql"
    AS $_$DECLARE
  picked_stage_var text;
  next_stage_var text;
  attribute_chance float := 0.3;
  type_chance float := 0.3;
  alpha_chance float := 0.25;
  selected_attribute text;
  selected_type text;
  team_size integer := 3;
  alpha_index integer := 0;
  random_val float;
  team_query text;
  i integer := 0;
  team_member record;
  level_boost integer;
  display_stage text;
BEGIN
  -- Pick stage based on level
  IF avg_level <= 5 THEN
    picked_stage_var := 'Baby';
    next_stage_var := 'In-Training';
  ELSIF avg_level <= 15 THEN
    picked_stage_var := 'In-Training';
    next_stage_var := 'Rookie';
  ELSIF avg_level <= 30 THEN
    picked_stage_var := 'Rookie';
    next_stage_var := 'Champion';
  ELSIF avg_level <= 55 THEN
    picked_stage_var := 'Champion';
    next_stage_var := 'Ultimate';
  ELSIF avg_level <= 60 THEN
    picked_stage_var := 'Ultimate';
    next_stage_var := 'Mega';
  ELSE
    picked_stage_var := 'Mega';
    next_stage_var := 'Ultra';
  END IF;

  -- Determine if we'll have a themed team
  random_val := random();
  
  -- Determine if we'll have an alpha
  IF random() < alpha_chance THEN
    alpha_index := floor(random() * team_size) + 1;
  END IF;
  
  -- Try to get a themed team first
  IF random_val < attribute_chance THEN
    -- Get a random attribute from digimon of the picked stage
    EXECUTE 'SELECT d.attribute FROM digimon d WHERE d.stage = $1 AND d.attribute IS NOT NULL ORDER BY random() LIMIT 1'
    INTO selected_attribute
    USING picked_stage_var;
    
    -- If we found an attribute, use it
    IF selected_attribute IS NOT NULL THEN
      FOR team_member IN EXECUTE 'SELECT d.* FROM digimon d WHERE d.stage = $1 AND d.attribute = $2 ORDER BY random() LIMIT $3' 
                        USING picked_stage_var, selected_attribute, team_size LOOP
        i := i + 1;
        digimon_id := team_member.digimon_id;
        name := team_member.name;
        
        -- Set the display stage based on whether this is an alpha
        IF i = alpha_index THEN
          stage := next_stage_var; -- Alpha gets next stage
        ELSE
          stage := team_member.stage; -- Regular digimon keeps its stage
        END IF;
        
        type := team_member.type;
        attribute := team_member.attribute;
        sprite_url := team_member.sprite_url;
        hp := team_member.hp;
        sp := team_member.sp;
        atk := team_member.atk;
        def := team_member.def;
        "int" := team_member."int";
        spd := team_member.spd;
        detail_url := team_member.detail_url;
        hp_level1 := team_member.hp_level1;
        sp_level1 := team_member.sp_level1;
        atk_level1 := team_member.atk_level1;
        def_level1 := team_member.def_level1;
        int_level1 := team_member.int_level1;
        spd_level1 := team_member.spd_level1;
        hp_level99 := team_member.hp_level99;
        sp_level99 := team_member.sp_level99;
        atk_level99 := team_member.atk_level99;
        def_level99 := team_member.def_level99;
        int_level99 := team_member.int_level99;
        spd_level99 := team_member.spd_level99;
        is_alpha := i = alpha_index;
        level_boost := CASE WHEN i = alpha_index THEN 5 ELSE 0 END;
        level := GREATEST(1, avg_level + floor(random() * 5 - 2)::int + level_boost);
        
        RETURN NEXT;
      END LOOP;
    END IF;
  ELSIF random_val < (attribute_chance + type_chance) THEN
    -- Get a random type from digimon of the picked stage
    EXECUTE 'SELECT d.type FROM digimon d WHERE d.stage = $1 AND d.type IS NOT NULL ORDER BY random() LIMIT 1'
    INTO selected_type
    USING picked_stage_var;
    
    -- If we found a type, use it
    IF selected_type IS NOT NULL THEN
      FOR team_member IN EXECUTE 'SELECT d.* FROM digimon d WHERE d.stage = $1 AND d.type = $2 ORDER BY random() LIMIT $3' 
                        USING picked_stage_var, selected_type, team_size LOOP
        i := i + 1;
        digimon_id := team_member.digimon_id;
        name := team_member.name;
        
        -- Set the display stage based on whether this is an alpha
        IF i = alpha_index THEN
          stage := next_stage_var; -- Alpha gets next stage
        ELSE
          stage := team_member.stage; -- Regular digimon keeps its stage
        END IF;
        
        type := team_member.type;
        attribute := team_member.attribute;
        sprite_url := team_member.sprite_url;
        hp := team_member.hp;
        sp := team_member.sp;
        atk := team_member.atk;
        def := team_member.def;
        "int" := team_member."int";
        spd := team_member.spd;
        detail_url := team_member.detail_url;
        hp_level1 := team_member.hp_level1;
        sp_level1 := team_member.sp_level1;
        atk_level1 := team_member.atk_level1;
        def_level1 := team_member.def_level1;
        int_level1 := team_member.int_level1;
        spd_level1 := team_member.spd_level1;
        hp_level99 := team_member.hp_level99;
        sp_level99 := team_member.sp_level99;
        atk_level99 := team_member.atk_level99;
        def_level99 := team_member.def_level99;
        int_level99 := team_member.int_level99;
        spd_level99 := team_member.spd_level99;
        is_alpha := i = alpha_index;
        level_boost := CASE WHEN i = alpha_index THEN 5 ELSE 0 END;
        level := avg_level + floor(random() * 5 - 2)::int + level_boost;
        
        RETURN NEXT;
      END LOOP;
    END IF;
  END IF;
  
  -- If we didn't get a full team from themed selection, get random digimon of the right stage
  IF i < team_size THEN
    FOR team_member IN EXECUTE 'SELECT d.* FROM digimon d WHERE d.stage = $1 ORDER BY random() LIMIT $2' 
                      USING picked_stage_var, (team_size - i) LOOP
      i := i + 1;
      digimon_id := team_member.digimon_id;
      name := team_member.name;
      
      -- Set the display stage based on whether this is an alpha
      IF i = alpha_index THEN
        stage := next_stage_var; -- Alpha gets next stage
      ELSE
        stage := team_member.stage; -- Regular digimon keeps its stage
      END IF;
      
      type := team_member.type;
      attribute := team_member.attribute;
      sprite_url := team_member.sprite_url;
      hp := team_member.hp;
      sp := team_member.sp;
      atk := team_member.atk;
      def := team_member.def;
      "int" := team_member."int";
      spd := team_member.spd;
      detail_url := team_member.detail_url;
      hp_level1 := team_member.hp_level1;
      sp_level1 := team_member.sp_level1;
      atk_level1 := team_member.atk_level1;
      def_level1 := team_member.def_level1;
      int_level1 := team_member.int_level1;
      spd_level1 := team_member.spd_level1;
      hp_level99 := team_member.hp_level99;
      sp_level99 := team_member.sp_level99;
      atk_level99 := team_member.atk_level99;
      def_level99 := team_member.def_level99;
      int_level99 := team_member.int_level99;
      spd_level99 := team_member.spd_level99;
      is_alpha := i = alpha_index;
      level_boost := CASE WHEN i = alpha_index THEN 5 ELSE 0 END;
      level := avg_level + floor(random() * 5 - 2)::int + level_boost;
      
      RETURN NEXT;
    END LOOP;
  END IF;
  
  -- If we still don't have enough, try any digimon
  IF i < team_size THEN
    FOR team_member IN EXECUTE 'SELECT d.* FROM digimon d ORDER BY random() LIMIT $1' 
                      USING (team_size - i) LOOP
      i := i + 1;
      digimon_id := team_member.digimon_id;
      name := team_member.name;
      
      -- Set the display stage based on whether this is an alpha
      IF i = alpha_index THEN
        stage := next_stage_var; -- Alpha gets next stage
      ELSE
        stage := team_member.stage; -- Regular digimon keeps its stage
      END IF;
      
      type := team_member.type;
      attribute := team_member.attribute;
      sprite_url := team_member.sprite_url;
      hp := team_member.hp;
      sp := team_member.sp;
      atk := team_member.atk;
      def := team_member.def;
      "int" := team_member."int";
      spd := team_member.spd;
      detail_url := team_member.detail_url;
      hp_level1 := team_member.hp_level1;
      sp_level1 := team_member.sp_level1;
      atk_level1 := team_member.atk_level1;
      def_level1 := team_member.def_level1;
      int_level1 := team_member.int_level1;
      spd_level1 := team_member.spd_level1;
      hp_level99 := team_member.hp_level99;
      sp_level99 := team_member.sp_level99;
      atk_level99 := team_member.atk_level99;
      def_level99 := team_member.def_level99;
      int_level99 := team_member.int_level99;
      spd_level99 := team_member.spd_level99;
      is_alpha := i = alpha_index;
      level_boost := CASE WHEN i = alpha_index THEN 5 ELSE 0 END;
      level := avg_level + floor(random() * 5 - 2)::int + level_boost;
      
      RETURN NEXT;
    END LOOP;
  END IF;
  
  RETURN;
END;$_$;

ALTER FUNCTION "public"."generate_enemy_team"("avg_level" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_opponents_with_digimon"("limit_count" integer, "exclude_user" "uuid") RETURNS TABLE("id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
begin
  return query
  select p.id
  from profiles p
  where p.id != exclude_user
    and exists (
      select 1 from user_digimon ud
      where ud.user_id = p.id
    )
  order by random()
  limit limit_count;
end;
$$;

ALTER FUNCTION "public"."get_opponents_with_digimon"("limit_count" integer, "exclude_user" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_random_digimon"("teamsize" integer) RETURNS TABLE("id" integer, "digimon_id" integer, "request_id" integer, "name" "text", "stage" "text", "type" "text", "attribute" "text", "sprite_url" "text", "hp" integer, "sp" integer, "atk" integer, "def" integer, "int" integer, "spd" integer, "hp_level1" integer, "sp_level1" integer, "atk_level1" integer, "def_level1" integer, "int_level1" integer, "spd_level1" integer, "hp_level99" integer, "sp_level99" integer, "atk_level99" integer, "def_level99" integer, "int_level99" integer, "spd_level99" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.digimon_id,
    d.request_id,
    d.name,
    d.stage,
    d.type,
    d.attribute,
    d.sprite_url,
    d.hp,
    d.sp,
    d.atk,
    d.def,
    d."int",
    d.spd,
    d.hp_level1,
    d.sp_level1,
    d.atk_level1,
    d.def_level1,
    d.int_level1,
    d.spd_level1,
    d.hp_level99,
    d.sp_level99,
    d.atk_level99,
    d.def_level99,
    d.int_level99,
    d.spd_level99
  FROM public.digimon d
  ORDER BY RANDOM()
  LIMIT teamsize;
END;
$$;

ALTER FUNCTION "public"."get_random_digimon"("teamsize" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_random_digimon_by_stage"("stage_param" "text") RETURNS TABLE("id" integer, "digimon_id" integer, "request_id" integer, "name" "text", "stage" "text", "type" "text", "attribute" "text", "sprite_url" "text", "hp" integer, "sp" integer, "atk" integer, "def" integer, "int" integer, "spd" integer, "hp_level1" integer, "sp_level1" integer, "atk_level1" integer, "def_level1" integer, "int_level1" integer, "spd_level1" integer, "hp_level99" integer, "sp_level99" integer, "atk_level99" integer, "def_level99" integer, "int_level99" integer, "spd_level99" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.digimon_id,
    d.request_id,
    d.name,
    d.stage,
    d.type,
    d.attribute,
    d.sprite_url,
    d.hp,
    d.sp,
    d.atk,
    d.def,
    d."int",
    d.spd,
    d.hp_level1,
    d.sp_level1,
    d.atk_level1,
    d.def_level1,
    d.int_level1,
    d.spd_level1,
    d.hp_level99,
    d.sp_level99,
    d.atk_level99,
    d.def_level99,
    d.int_level99,
    d.spd_level99
  FROM public.digimon d
  WHERE d.stage = stage_param
  ORDER BY RANDOM()
  LIMIT 1;
END;$$;

ALTER FUNCTION "public"."get_random_digimon_by_stage"("stage_param" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_random_users"("exclude_user_id" "uuid") RETURNS TABLE("id" "uuid", "username" "text", "display_name" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.username, p.display_name
    FROM profiles p
    WHERE p.id != exclude_user_id
    ORDER BY RANDOM()
    LIMIT 30;
END;
$$;

ALTER FUNCTION "public"."get_random_users"("exclude_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."grant_energy_self"("p_amount" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  update public.profiles p
  set battle_energy = least(p.max_battle_energy, coalesce(p.battle_energy,0) + greatest(0, p_amount))
  where p.id = auth.uid();
end;
$$;

ALTER FUNCTION "public"."grant_energy_self"("p_amount" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  );
$$;

ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_admin"("input_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = input_user_id
  );
END;
$$;

ALTER FUNCTION "public"."is_admin"("input_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."keep_recent_team_battles"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Wait for the current insert to be visible
    -- Then delete older battles
    DELETE FROM public.team_battles
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM public.team_battles
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        LIMIT 20
    );
    
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."keep_recent_team_battles"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."level_up_digimon"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    xp_threshold INTEGER;
BEGIN
    -- Loop in case multiple level-ups are earned at once
    LOOP
        xp_threshold := 100 + (NEW.current_level * 50);

        EXIT WHEN NEW.experience_points < xp_threshold OR NEW.current_level >= 99;

        NEW.current_level := NEW.current_level + 1;
        NEW.experience_points := NEW.experience_points - xp_threshold;

        -- Safety: don't go negative
        IF NEW.experience_points < 0 THEN
            NEW.experience_points := 0;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."level_up_digimon"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."process_daily_quotas"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."process_daily_quotas"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."reset_all_battle_limits"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE battle_limits
  SET battles_used = 0,
      last_reset_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE true;
END;
$$;

ALTER FUNCTION "public"."reset_all_battle_limits"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."reset_boss_hp"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_event_id UUID;
BEGIN
  SELECT event_id INTO current_event_id
  FROM get_current_weekly_boss_event()
  LIMIT 1;
  
  IF current_event_id IS NOT NULL THEN
    UPDATE weekly_boss_events 
    SET 
      boss_current_hp = boss_max_hp,
      is_defeated = false,
      total_damage_dealt = 0
    WHERE id = current_event_id;
    
    RAISE NOTICE 'Boss HP reset to maximum';
  END IF;
END;
$$;

ALTER FUNCTION "public"."reset_boss_hp"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."reset_daily_tasks"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_day text;
  loop_user_id uuid;  -- Renamed to avoid ambiguity
  loop_task_id uuid;
  loop_task_category text;
  penalty_value integer;
BEGIN
  -- Get the current day of the week (Sunday, Monday, etc.)
  current_day := to_char(now(), 'Day');
  current_day := trim(current_day);
  
  -- First, handle penalties for uncompleted recurring tasks scheduled for today
  FOR loop_user_id, loop_task_id, loop_task_category IN
    SELECT t.user_id, t.id, t.category
    FROM public.tasks t
    WHERE 
      t.is_completed = false AND
      t.recurring_days IS NOT NULL AND
      t.recurring_days @> ARRAY[current_day]::text[]
  LOOP
    -- Calculate penalty
    penalty_value := 5; -- Default penalty
    
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
    penalty_value := 5; -- Default penalty
    
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
    AND recurring_days @> ARRAY[current_day]::text[];
    
  -- Log the reset
  RAISE NOTICE 'Daily and recurring tasks reset for %', current_day;
END;
$$;

ALTER FUNCTION "public"."reset_daily_tasks"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."reset_user_tasks"("target_user_id" "uuid", "override_day" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_day text;
  task_id uuid;
  task_category text;
  penalty_value integer;
BEGIN
  -- Get the current day of the week (Sunday, Monday, etc.) or use the override
  IF override_day IS NULL THEN
    current_day := trim(to_char(now(), 'Day'));
  ELSE
    current_day := override_day;
  END IF;
  
  -- First, handle penalties for uncompleted recurring tasks scheduled for today
  FOR task_id, task_category IN
    SELECT t.id, t.category
    FROM public.tasks t
    WHERE 
      t.user_id = target_user_id AND
      t.is_completed = false AND
      t.recurring_days IS NOT NULL AND
      t.recurring_days @> ARRAY[current_day]::text[]
  LOOP
    -- Calculate penalty
    penalty_value := 5; -- Default penalty
    
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
  
  -- Next, handle penalties for uncompleted daily tasks
  FOR task_id, task_category IN
    SELECT t.id, t.category
    FROM public.tasks t
    WHERE 
      t.user_id = target_user_id AND
      t.is_completed = false AND
      t.is_daily = true
  LOOP
    -- Calculate penalty
    penalty_value := 5; -- Default penalty
    
    -- Apply penalty to the user's digimon happiness
    UPDATE public.user_digimon
    SET happiness = GREATEST(0, happiness - penalty_value)
    WHERE user_id = target_user_id AND is_active = true;
    
    -- Add task to penalized_tasks in daily_quotas
    UPDATE public.daily_quotas
    SET penalized_tasks = array_append(penalized_tasks, task_id::text)
    WHERE user_id = target_user_id;
    
    -- Log the penalty
    RAISE NOTICE 'Applied penalty for uncompleted daily task % for user %', task_id, target_user_id;
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
    recurring_days @> ARRAY[current_day]::text[];
    
  -- Log the reset
  RAISE NOTICE 'Reset tasks for user % on day %', target_user_id, current_day;
END;
$$;

ALTER FUNCTION "public"."reset_user_tasks"("target_user_id" "uuid", "override_day" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_event_phase"("p_phase" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_event_id UUID;
BEGIN
  -- Get current event
  SELECT event_id INTO current_event_id
  FROM get_current_weekly_boss_event()
  LIMIT 1;
  
  IF current_event_id IS NOT NULL THEN
    UPDATE weekly_boss_events 
    SET phase = p_phase
    WHERE id = current_event_id;
    
    RAISE NOTICE 'Event phase set to %', p_phase;
  ELSE
    RAISE NOTICE 'No current event found';
  END IF;
END;
$$;

ALTER FUNCTION "public"."set_event_phase"("p_phase" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."show_event_status"() RETURNS TABLE("phase" integer, "boss_name" "text", "global_progress" integer, "target_progress" integer, "boss_current_hp" bigint, "boss_max_hp" bigint, "is_defeated" boolean, "participants_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wbe.phase,
    pbc.name as boss_name,
    wbe.global_progress,
    wbe.target_progress,
    wbe.boss_current_hp,
    wbe.boss_max_hp,
    wbe.is_defeated,
    wbe.participants_count
  FROM weekly_boss_events wbe
  JOIN preset_boss_configs pbc ON wbe.preset_boss_id = pbc.id
  WHERE wbe.week_start_date = DATE_TRUNC('week', CURRENT_DATE)
  LIMIT 1;
END;
$$;

ALTER FUNCTION "public"."show_event_status"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."show_user_participation"("p_user_id" "uuid") RETURNS TABLE("tasks_contributed" integer, "battle_attempts" integer, "total_damage_dealt" bigint, "best_single_damage" integer, "participation_tier" integer, "rewards_claimed" boolean)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_event_id UUID;
BEGIN
  SELECT event_id INTO current_event_id
  FROM get_current_weekly_boss_event()
  LIMIT 1;
  
  RETURN QUERY
  SELECT 
    wbp.tasks_contributed,
    wbp.battle_attempts,
    wbp.total_damage_dealt,
    wbp.best_single_damage,
    wbp.participation_tier,
    wbp.rewards_claimed
  FROM weekly_boss_participation wbp
  WHERE wbp.user_id = p_user_id AND wbp.event_id = current_event_id;
END;
$$;

ALTER FUNCTION "public"."show_user_participation"("p_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."spend_energy"("p_user_id" "uuid", "p_amount" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_energy integer;
BEGIN
  SELECT battle_energy INTO v_energy FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF v_energy IS NULL OR v_energy < p_amount OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET battle_energy = v_energy - p_amount
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;

ALTER FUNCTION "public"."spend_energy"("p_user_id" "uuid", "p_amount" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."spend_energy_self"("p_amount" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_energy integer;
BEGIN
  SELECT battle_energy INTO v_energy FROM public.profiles WHERE id = auth.uid() FOR UPDATE;

  IF v_energy IS NULL OR v_energy < p_amount OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET battle_energy = v_energy - p_amount
  WHERE id = auth.uid();

  RETURN TRUE;
END;
$$;

ALTER FUNCTION "public"."spend_energy_self"("p_amount" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Verify both Digimon belong to the user
  IF NOT EXISTS (
    SELECT 1 FROM user_digimon 
    WHERE id IN (team_digimon_id, reserve_digimon_id) 
    AND user_id = user_id_param
    HAVING COUNT(*) = 2
  ) THEN
    RAISE EXCEPTION 'One or both Digimon do not belong to this user';
  END IF;
  
  -- Verify one is on team and one is not
  IF NOT EXISTS (
    SELECT 1 FROM user_digimon WHERE id = team_digimon_id AND is_on_team = true
  ) THEN
    RAISE EXCEPTION 'First Digimon is not on team';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM user_digimon WHERE id = reserve_digimon_id AND is_on_team = true
  ) THEN
    RAISE EXCEPTION 'Second Digimon is already on team';
  END IF;
  
  -- Perform the swap
  UPDATE user_digimon SET is_on_team = false WHERE id = team_digimon_id;
  UPDATE user_digimon SET is_on_team = true WHERE id = reserve_digimon_id;
END;
$$;

ALTER FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_battle_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update battles_completed for the user who initiated the battle
    UPDATE profiles
    SET battles_completed = battles_completed + 1
    WHERE id = NEW.user_id;
    
    -- Update battles_won for the winner
    IF NEW.winner_id IS NOT NULL THEN
        UPDATE profiles
        SET battles_won = battles_won + 1
        WHERE id = NEW.winner_id;
    END IF;
    
    -- If there's an opponent (not a wild battle), update their battles_completed too
    IF NEW.opponent_id IS NOT NULL THEN
        UPDATE profiles
        SET battles_completed = battles_completed + 1
        WHERE id = NEW.opponent_id;
    END IF;
    
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_battle_stats"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_completed_today"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only proceed if this is a task completion (not a task creation or other update)
  IF NEW.is_completed = TRUE AND (OLD.is_completed = FALSE OR OLD.is_completed IS NULL) THEN
    -- Check if there's an existing quota record for today
    DECLARE
      quota_id UUID;
    BEGIN
      SELECT id INTO quota_id FROM daily_quotas 
      WHERE user_id = NEW.user_id;
      
      IF quota_id IS NULL THEN
        -- Create a new quota record if none exists
        INSERT INTO daily_quotas (
          user_id, 
          completed_today, 
          consecutive_days_missed
        ) VALUES (
          NEW.user_id, 
          today, 
          today + INTERVAL '1 day', 
          1, 
          0
        );
      ELSE
        -- Update the existing record
        UPDATE daily_quotas 
        SET completed_today = completed_today + 1,
            updated_at = NOW()
        WHERE id = quota_id;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_completed_today"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision DEFAULT 0.5) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$begin
  -- Update active Digimon with full exp and increased happiness
  update public.user_digimon
  set 
    experience_points = experience_points + p_base_exp,
    happiness = least(happiness + 10, 100)
  where id = p_active_digimon_id;
  
  -- Update non-active Digimon with reduced exp
  update public.user_digimon
  set experience_points = experience_points + floor(p_base_exp * p_non_active_multiplier)
  where id != p_active_digimon_id
  and is_in_storage = false
  and user_id = (
    select user_id 
    from public.user_digimon 
    where id = p_active_digimon_id
  );
end;$$;

ALTER FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_longest_streak"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Debug logging (optional)
  RAISE NOTICE 'Trigger fired: old=%, new=%', OLD.current_streak, NEW.current_streak;
  
  -- Only update if current_streak is changing
  IF (TG_OP = 'UPDATE' AND NEW.current_streak IS DISTINCT FROM OLD.current_streak) 
     OR TG_OP = 'INSERT' THEN
    -- Set longest_streak to the maximum of current value and new current_streak
    NEW.longest_streak := GREATEST(COALESCE(NEW.longest_streak, 0), COALESCE(NEW.current_streak, 0));
    
    -- Debug logging (optional)
    RAISE NOTICE 'Updated longest_streak to %', NEW.longest_streak;
  END IF;
  
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_longest_streak"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_milestone_on_daily_quota"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$

BEGIN

  -- If the daily quota has been completed (reached 3 tasks)

  IF NEW.completed_today >= 3 AND (OLD.completed_today < 3 OR OLD.completed_today IS NULL) THEN

    -- Check if user has a milestone record

    DECLARE

      milestone_id UUID;

    BEGIN

      SELECT id INTO milestone_id FROM user_milestones 

      WHERE user_id = NEW.user_id;

      

      IF milestone_id IS NULL THEN

        -- Create milestone record if it doesn't exist

        INSERT INTO user_milestones (

          user_id, 

          daily_quota_streak,

          tasks_completed_count

        ) VALUES (

          NEW.user_id, 

          1,

          0

        );

      ELSE

        -- Increment the daily quota streak

        UPDATE user_milestones 

        SET daily_quota_streak = daily_quota_streak + 1,

            updated_at = NOW()

        WHERE id = milestone_id;

      END IF;

    END;

  END IF;

  

  RETURN NEW;

END;

$$;

ALTER FUNCTION "public"."update_milestone_on_daily_quota"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_profiles_updated_at"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_streak_on_quota_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- If we've reached or exceeded the quota requirement (3 tasks)
  IF NEW.completed_today >= 3 AND OLD.completed_today < 3 THEN
    -- Increment the streak
    NEW.current_streak := OLD.current_streak + 1;
    
    -- Also update longest_streak if the new current_streak is greater
    IF NEW.current_streak > COALESCE(NEW.longest_streak, 0) THEN
      NEW.longest_streak := NEW.current_streak;
    END IF;
  END IF;
  
  RETURN NEW;
END;$$;

ALTER FUNCTION "public"."update_streak_on_quota_completion"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."user_can_battle_boss"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_event_id UUID;
  current_phase INTEGER;
  boss_defeated BOOLEAN;
  user_participated BOOLEAN;
BEGIN
  -- Get current event details
  SELECT event_id, phase, (boss_current_hp <= 0) 
  INTO current_event_id, current_phase, boss_defeated
  FROM get_current_weekly_boss_event()
  LIMIT 1;
  
  -- Must be in Phase 2
  IF current_phase != 2 THEN
    RETURN FALSE;
  END IF;
  
  -- Boss must not be defeated
  IF boss_defeated THEN
    RETURN FALSE;
  END IF;
  
  -- User must have participated in Phase 1
  user_participated := user_participated_in_phase1(p_user_id, current_event_id);
  
  RETURN user_participated;
END;
$$;

ALTER FUNCTION "public"."user_can_battle_boss"("p_user_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."user_participated_in_phase1"("p_user_id" "uuid", "p_event_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  participation_record RECORD;
BEGIN
  -- Check if user has a participation record with tasks contributed > 0
  SELECT * INTO participation_record
  FROM weekly_boss_participation
  WHERE user_id = p_user_id 
    AND event_id = p_event_id
    AND tasks_contributed > 0;
    
  RETURN FOUND;
END;
$$;

ALTER FUNCTION "public"."user_participated_in_phase1"("p_user_id" "uuid", "p_event_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "saved_stats" "jsonb" DEFAULT '{"HP": 0, "SP": 0, "ATK": 0, "DEF": 0, "INT": 0, "SPD": 0}'::"jsonb",
    "battles_won" integer DEFAULT 0,
    "battles_completed" integer DEFAULT 0,
    "highest_stage_cleared" integer DEFAULT 0,
    "has_completed_onboarding" boolean DEFAULT false,
    "battle_energy" integer DEFAULT 0 NOT NULL,
    "max_battle_energy" integer DEFAULT 10 NOT NULL,
    "last_arena_first_win" "date"
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

COMMENT ON COLUMN "public"."profiles"."highest_stage_cleared" IS 'Records the highest stage cleared in the Campaign';

CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reported_user_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone
);

ALTER TABLE "public"."reports" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."admin_reports" WITH ("security_invoker"='on') AS
 SELECT "r"."id",
    "r"."reporter_id",
    "r"."reported_user_id",
    "r"."reason",
    "r"."category",
    "r"."status",
    "r"."admin_notes",
    "r"."created_at",
    "r"."updated_at",
    "r"."resolved_at",
    "reporter"."username" AS "reporter_username",
    "reported"."username" AS "reported_username"
   FROM (("public"."reports" "r"
     JOIN "public"."profiles" "reporter" ON (("r"."reporter_id" = "reporter"."id")))
     JOIN "public"."profiles" "reported" ON (("r"."reported_user_id" = "reported"."id")));

ALTER TABLE "public"."admin_reports" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."admin_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."battle_limits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "battles_used" integer DEFAULT 0,
    "last_reset_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "boss_battles_used" integer DEFAULT 0
);

ALTER TABLE "public"."battle_limits" OWNER TO "postgres";

COMMENT ON COLUMN "public"."battle_limits"."boss_battles_used" IS 'Number of weekly boss battles used today (max 5 per day during Phase 2)';

CREATE TABLE IF NOT EXISTS "public"."daily_quotas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "completed_today" integer DEFAULT 0,
    "consecutive_days_missed" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "penalized_tasks" "text"[] DEFAULT '{}'::"text"[],
    "current_streak" integer DEFAULT 0 NOT NULL,
    "longest_streak" integer DEFAULT 0
);

ALTER TABLE "public"."daily_quotas" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."digimon" (
    "id" integer NOT NULL,
    "digimon_id" integer NOT NULL,
    "request_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "stage" "text" NOT NULL,
    "type" "text",
    "attribute" "text",
    "sprite_url" "text",
    "hp" integer,
    "sp" integer,
    "atk" integer,
    "def" integer,
    "int" integer,
    "spd" integer,
    "detail_url" "text",
    "hp_level1" integer DEFAULT 0,
    "sp_level1" integer DEFAULT 0,
    "atk_level1" integer DEFAULT 0,
    "def_level1" integer DEFAULT 0,
    "int_level1" integer DEFAULT 0,
    "spd_level1" integer DEFAULT 0,
    "hp_level99" integer DEFAULT 0,
    "sp_level99" integer DEFAULT 0,
    "atk_level99" integer DEFAULT 0,
    "def_level99" integer DEFAULT 0,
    "int_level99" integer DEFAULT 0,
    "spd_level99" integer DEFAULT 0
);

ALTER TABLE "public"."digimon" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."digimon_forms" (
    "id" integer NOT NULL,
    "base_digimon_id" integer NOT NULL,
    "form_digimon_id" integer NOT NULL,
    "form_type" "text" NOT NULL,
    "unlock_condition" "text"
);

ALTER TABLE "public"."digimon_forms" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."digimon_forms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."digimon_forms_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."digimon_forms_id_seq" OWNED BY "public"."digimon_forms"."id";

CREATE SEQUENCE IF NOT EXISTS "public"."digimon_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."digimon_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."digimon_id_seq" OWNED BY "public"."digimon"."id";

CREATE TABLE IF NOT EXISTS "public"."evolution_paths" (
    "id" integer NOT NULL,
    "from_digimon_id" integer,
    "to_digimon_id" integer,
    "level_required" integer DEFAULT 0 NOT NULL,
    "stat_requirements" "jsonb" DEFAULT '{}'::"jsonb",
    "dna_requirement" integer,
    "item_requirement" "text"
);

ALTER TABLE "public"."evolution_paths" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."evolution_paths_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."evolution_paths_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."evolution_paths_id_seq" OWNED BY "public"."evolution_paths"."id";

CREATE TABLE IF NOT EXISTS "public"."task_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "tasks_completed" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."task_history" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "is_daily" boolean DEFAULT false NOT NULL,
    "due_date" timestamp with time zone,
    "is_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "category" "text",
    "notes" "text",
    "recurring_days" "text"[],
    "difficulty" "text" DEFAULT 'medium'::"text",
    "priority" "text" DEFAULT 'medium'::"text",
    CONSTRAINT "tasks_category_check" CHECK (("category" = ANY (ARRAY['HP'::"text", 'SP'::"text", 'ATK'::"text", 'DEF'::"text", 'INT'::"text", 'SPD'::"text"]))),
    CONSTRAINT "tasks_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text"]))),
    CONSTRAINT "tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);

ALTER TABLE "public"."tasks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."team_battles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "opponent_id" "uuid",
    "winner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_team" "jsonb" NOT NULL,
    "opponent_team" "jsonb" NOT NULL,
    "turns" "jsonb"
);

ALTER TABLE "public"."team_battles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."titles" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "requirement_type" "text" NOT NULL,
    "requirement_value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."titles" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."titles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."titles_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."titles_id_seq" OWNED BY "public"."titles"."id";

CREATE TABLE IF NOT EXISTS "public"."user_currency" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bits" integer DEFAULT 2000 NOT NULL,
    "digicoins" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_currency" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_digimon" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "digimon_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "current_level" integer DEFAULT 1 NOT NULL,
    "experience_points" integer DEFAULT 0 NOT NULL,
    "happiness" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_updated_at" timestamp with time zone DEFAULT "now"(),
    "last_fed_tasks_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT false,
    "is_on_team" boolean DEFAULT false NOT NULL,
    "hp_bonus" integer DEFAULT 0 NOT NULL,
    "sp_bonus" integer DEFAULT 0 NOT NULL,
    "atk_bonus" integer DEFAULT 0 NOT NULL,
    "def_bonus" integer DEFAULT 0 NOT NULL,
    "int_bonus" integer DEFAULT 0 NOT NULL,
    "spd_bonus" integer DEFAULT 0 NOT NULL,
    "personality" "text",
    "abi" integer DEFAULT 0,
    "is_in_storage" boolean DEFAULT false,
    "has_x_antibody" boolean DEFAULT false
);

ALTER TABLE "public"."user_digimon" OWNER TO "postgres";

COMMENT ON COLUMN "public"."user_digimon"."hp_bonus" IS 'Bonus HP points earned from completing HP category tasks';

COMMENT ON COLUMN "public"."user_digimon"."sp_bonus" IS 'Bonus SP points earned from completing SP category tasks';

COMMENT ON COLUMN "public"."user_digimon"."atk_bonus" IS 'Bonus ATK points earned from completing ATK category tasks';

COMMENT ON COLUMN "public"."user_digimon"."def_bonus" IS 'Bonus DEF points earned from completing DEF category tasks';

COMMENT ON COLUMN "public"."user_digimon"."int_bonus" IS 'Bonus INT points earned from completing INT category tasks';

COMMENT ON COLUMN "public"."user_digimon"."spd_bonus" IS 'Bonus SPD points earned from completing SPD category tasks';

CREATE OR REPLACE VIEW "public"."user_digimon_profiles" WITH ("security_invoker"='on') AS
 SELECT "ud"."id" AS "user_digimon_id",
    "ud"."user_id",
    "p"."username",
    "ud"."digimon_id",
    "d"."name" AS "digimon_species",
    "ud"."name" AS "digimon_nickname",
    "d"."stage",
    "d"."type",
    "d"."attribute",
    "ud"."current_level",
    "ud"."experience_points",
    "ud"."abi",
    "ud"."personality",
    "ud"."is_active",
    "ud"."is_on_team",
    "d"."sprite_url",
    "ud"."created_at"
   FROM (("public"."user_digimon" "ud"
     JOIN "public"."profiles" "p" ON (("ud"."user_id" = "p"."id")))
     JOIN "public"."digimon" "d" ON (("ud"."digimon_id" = "d"."id")));

ALTER TABLE "public"."user_digimon_profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_discovered_digimon" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "digimon_id" integer NOT NULL,
    "discovered_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_discovered_digimon" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_inventory" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" "text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "item_type" "text"
);

ALTER TABLE "public"."user_inventory" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_milestones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "daily_quota_streak" integer DEFAULT 0 NOT NULL,
    "tasks_completed_count" integer DEFAULT 0 NOT NULL,
    "last_digimon_claimed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."user_milestones" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_titles" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "title_id" integer,
    "earned_at" timestamp with time zone DEFAULT "now"(),
    "is_displayed" boolean DEFAULT false,
    "claimed_at" timestamp with time zone
);

ALTER TABLE "public"."user_titles" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."user_titles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."user_titles_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."user_titles_id_seq" OWNED BY "public"."user_titles"."id";

CREATE TABLE IF NOT EXISTS "public"."user_tournaments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "week_start" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "current_round" integer DEFAULT 1 NOT NULL,
    "bracket" "jsonb" NOT NULL,
    "round_results" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "final_placement" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_tournaments" OWNER TO "postgres";

ALTER TABLE ONLY "public"."digimon" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."digimon_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."digimon_forms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."digimon_forms_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."evolution_paths" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."evolution_paths_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."titles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."titles_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."user_titles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_titles_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."battle_limits"
    ADD CONSTRAINT "battle_limits_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."battle_limits"
    ADD CONSTRAINT "battle_limits_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_base_digimon_id_form_digimon_id_key" UNIQUE ("base_digimon_id", "form_digimon_id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."digimon"
    ADD CONSTRAINT "digimon_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_from_digimon_id_to_digimon_id_key" UNIQUE ("from_digimon_id", "to_digimon_id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "task_history_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "task_history_user_id_date_key" UNIQUE ("user_id", "date");

ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."titles"
    ADD CONSTRAINT "titles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "unique_user_date" UNIQUE ("user_id", "date");

ALTER TABLE ONLY "public"."user_currency"
    ADD CONSTRAINT "user_currency_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_currency"
    ADD CONSTRAINT "user_currency_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_digimon"
    ADD CONSTRAINT "user_digimon_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_user_id_digimon_id_key" UNIQUE ("user_id", "digimon_id");

ALTER TABLE ONLY "public"."user_inventory"
    ADD CONSTRAINT "user_inventory_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_inventory"
    ADD CONSTRAINT "user_inventory_user_item_unique" UNIQUE ("user_id", "item_id");

ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_user_id_title_id_key" UNIQUE ("user_id", "title_id");

ALTER TABLE ONLY "public"."user_tournaments"
    ADD CONSTRAINT "user_tournaments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_tournaments"
    ADD CONSTRAINT "user_tournaments_user_id_week_start_key" UNIQUE ("user_id", "week_start");

CREATE INDEX "idx_battle_limits_user_id" ON "public"."battle_limits" USING "btree" ("user_id");

CREATE INDEX "idx_daily_quotas_user_id" ON "public"."daily_quotas" USING "btree" ("user_id");

CREATE INDEX "idx_evolution_paths_dna_requirement" ON "public"."evolution_paths" USING "btree" ("dna_requirement");

CREATE INDEX "idx_task_history_user_date" ON "public"."task_history" USING "btree" ("user_id", "date");

CREATE INDEX "idx_user_currency_user_id" ON "public"."user_currency" USING "btree" ("user_id");

CREATE INDEX "idx_user_digimon_storage" ON "public"."user_digimon" USING "btree" ("user_id", "is_in_storage");

CREATE INDEX "idx_user_inventory_user_id" ON "public"."user_inventory" USING "btree" ("user_id");

CREATE INDEX "idx_user_milestones_user_id" ON "public"."user_milestones" USING "btree" ("user_id");

CREATE INDEX "team_battles_opponent_id_idx" ON "public"."team_battles" USING "btree" ("opponent_id");

CREATE INDEX "team_battles_user_id_idx" ON "public"."team_battles" USING "btree" ("user_id");

CREATE OR REPLACE TRIGGER "assign_personality_trigger" BEFORE INSERT ON "public"."user_digimon" FOR EACH ROW EXECUTE FUNCTION "public"."assign_personality_to_digimon"();

CREATE OR REPLACE TRIGGER "ensure_single_active_digimon_trigger" BEFORE INSERT OR UPDATE ON "public"."user_digimon" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_active_digimon"();

CREATE OR REPLACE TRIGGER "level_up_trigger" BEFORE UPDATE ON "public"."user_digimon" FOR EACH ROW EXECUTE FUNCTION "public"."level_up_digimon"();

CREATE OR REPLACE TRIGGER "task_completion_trigger" AFTER UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_completed_today"();

CREATE OR REPLACE TRIGGER "task_overdue_check" AFTER INSERT OR UPDATE OF "due_date" ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."check_overdue_tasks"();

CREATE OR REPLACE TRIGGER "trigger_update_milestone_on_daily_quota" AFTER UPDATE OF "completed_today" ON "public"."daily_quotas" FOR EACH ROW EXECUTE FUNCTION "public"."update_milestone_on_daily_quota"();

CREATE OR REPLACE TRIGGER "update_battle_stats_after_insert" AFTER INSERT ON "public"."team_battles" FOR EACH ROW EXECUTE FUNCTION "public"."update_battle_stats"();

CREATE OR REPLACE TRIGGER "update_battle_stats_trigger" AFTER INSERT ON "public"."team_battles" FOR EACH ROW EXECUTE FUNCTION "public"."update_battle_stats"();

CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_streak_trigger" BEFORE UPDATE ON "public"."daily_quotas" FOR EACH ROW EXECUTE FUNCTION "public"."update_streak_on_quota_completion"();

CREATE OR REPLACE TRIGGER "user_digimon_level_up" AFTER UPDATE OF "experience_points" ON "public"."user_digimon" FOR EACH ROW EXECUTE FUNCTION "public"."level_up_digimon"();

ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."battle_limits"
    ADD CONSTRAINT "battle_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_base_digimon_id_fkey" FOREIGN KEY ("base_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_form_digimon_id_fkey" FOREIGN KEY ("form_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_dna_requirement_fkey" FOREIGN KEY ("dna_requirement") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_from_digimon_id_fkey" FOREIGN KEY ("from_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_to_digimon_id_fkey" FOREIGN KEY ("to_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "task_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."user_currency"
    ADD CONSTRAINT "user_currency_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_digimon"
    ADD CONSTRAINT "user_digimon_digimon_id_fkey" FOREIGN KEY ("digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."user_digimon"
    ADD CONSTRAINT "user_digimon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_digimon_id_fkey" FOREIGN KEY ("digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_inventory"
    ADD CONSTRAINT "user_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_tournaments"
    ADD CONSTRAINT "user_tournaments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

CREATE POLICY "Admins can view all reports" ON "public"."reports" FOR SELECT USING (("auth"."uid"() IN ( SELECT "admin_users"."user_id"
   FROM "public"."admin_users")));

CREATE POLICY "Allow admins to manage digimon" ON "public"."digimon" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "Allow admins to manage digimon" ON "public"."digimon_forms" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "Allow admins to manage digimon" ON "public"."evolution_paths" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."team_battles" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_milestones" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_currency" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_inventory" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_titles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for all users" ON "public"."daily_quotas" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."digimon" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."digimon_forms" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."evolution_paths" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."task_history" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."team_battles" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."titles" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_digimon" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_discovered_digimon" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_milestones" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_titles" FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."user_milestones" FOR UPDATE TO "authenticated" USING (true);

CREATE POLICY "Only admins can delete reports" ON "public"."reports" FOR DELETE USING (("auth"."uid"() IN ( SELECT "admin_users"."user_id"
   FROM "public"."admin_users")));

CREATE POLICY "Only admins can update reports" ON "public"."reports" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "admin_users"."user_id"
   FROM "public"."admin_users")));

CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON "public"."reports" FOR INSERT WITH CHECK (("auth"."uid"() = "reporter_id"));

CREATE POLICY "Users can delete their own daily quotas" ON "public"."daily_quotas" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own digimon" ON "public"."user_digimon" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own tasks" ON "public"."tasks" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own battle limits" ON "public"."battle_limits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own daily quotas" ON "public"."daily_quotas" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own digimon" ON "public"."user_digimon" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own discovered Digimon" ON "public"."user_discovered_digimon" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Users can insert their own tasks" ON "public"."tasks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can only see their own tasks" ON "public"."tasks" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own battle limits" ON "public"."battle_limits" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own daily quotas" ON "public"."daily_quotas" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own digimon" ON "public"."user_digimon" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "Users can update their own tasks" ON "public"."tasks" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can view their own battle limits" ON "public"."battle_limits" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can view their own reports" ON "public"."reports" FOR SELECT USING (("auth"."uid"() = "reporter_id"));

CREATE POLICY "Users manage their own tournaments" ON "public"."user_tournaments" USING (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_policy" ON "public"."admin_users" FOR SELECT USING (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."battle_limits" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."daily_quotas" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."digimon" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."digimon_forms" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."evolution_paths" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_admin_delete_policy" ON "public"."reports" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "reports_admin_select_policy" ON "public"."reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "reports_admin_update_policy" ON "public"."reports" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "reports_insert_policy" ON "public"."reports" FOR INSERT WITH CHECK (("auth"."uid"() = "reporter_id"));

CREATE POLICY "reports_view_own_policy" ON "public"."reports" FOR SELECT USING (("reporter_id" = "auth"."uid"()));

CREATE POLICY "select_own_profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));

ALTER TABLE "public"."task_history" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."team_battles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."titles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "update_own_profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));

ALTER TABLE "public"."user_currency" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_digimon" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_discovered_digimon" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_inventory" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_milestones" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_titles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_titles_update" ON "public"."user_titles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."user_tournaments" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."assign_personality_to_digimon"() TO "anon";

GRANT ALL ON FUNCTION "public"."assign_personality_to_digimon"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."assign_personality_to_digimon"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_all_overdue_tasks"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_all_overdue_tasks"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_all_overdue_tasks"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_and_increment_battle_limit"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_and_increment_battle_limit"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_and_increment_battle_limit"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win_self"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win_self"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win_self"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_overdue_tasks"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_overdue_tasks"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_overdue_tasks"() TO "service_role";

GRANT ALL ON FUNCTION "public"."cleanup_team_battles"() TO "anon";

GRANT ALL ON FUNCTION "public"."cleanup_team_battles"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."cleanup_team_battles"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) TO "anon";

GRANT ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) TO "authenticated";

GRANT ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) TO "service_role";

GRANT ALL ON FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) TO "anon";

GRANT ALL ON FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) TO "authenticated";

GRANT ALL ON FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_add_dna_requirement_function"() TO "anon";

GRANT ALL ON FUNCTION "public"."create_add_dna_requirement_function"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."create_add_dna_requirement_function"() TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_user_and_data"("input_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."delete_user_and_data"("input_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."delete_user_and_data"("input_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."ensure_single_active_digimon"() TO "anon";

GRANT ALL ON FUNCTION "public"."ensure_single_active_digimon"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."ensure_single_active_digimon"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_enemy_team"("avg_level" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."generate_enemy_team"("avg_level" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."generate_enemy_team"("avg_level" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_opponents_with_digimon"("limit_count" integer, "exclude_user" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_opponents_with_digimon"("limit_count" integer, "exclude_user" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_opponents_with_digimon"("limit_count" integer, "exclude_user" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_random_digimon"("teamsize" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."get_random_digimon"("teamsize" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_random_digimon"("teamsize" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_random_digimon_by_stage"("stage_param" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."get_random_digimon_by_stage"("stage_param" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_random_digimon_by_stage"("stage_param" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_random_users"("exclude_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_random_users"("exclude_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_random_users"("exclude_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."grant_energy_self"("p_amount" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."grant_energy_self"("p_amount" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."grant_energy_self"("p_amount" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";

GRANT ALL ON FUNCTION "public"."is_admin"("input_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."is_admin"("input_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."is_admin"("input_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."keep_recent_team_battles"() TO "anon";

GRANT ALL ON FUNCTION "public"."keep_recent_team_battles"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."keep_recent_team_battles"() TO "service_role";

GRANT ALL ON FUNCTION "public"."level_up_digimon"() TO "anon";

GRANT ALL ON FUNCTION "public"."level_up_digimon"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."level_up_digimon"() TO "service_role";

GRANT ALL ON FUNCTION "public"."process_daily_quotas"() TO "anon";

GRANT ALL ON FUNCTION "public"."process_daily_quotas"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."process_daily_quotas"() TO "service_role";

GRANT ALL ON FUNCTION "public"."reset_all_battle_limits"() TO "anon";

GRANT ALL ON FUNCTION "public"."reset_all_battle_limits"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."reset_all_battle_limits"() TO "service_role";

GRANT ALL ON FUNCTION "public"."reset_boss_hp"() TO "anon";

GRANT ALL ON FUNCTION "public"."reset_boss_hp"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."reset_boss_hp"() TO "service_role";

GRANT ALL ON FUNCTION "public"."reset_daily_tasks"() TO "anon";

GRANT ALL ON FUNCTION "public"."reset_daily_tasks"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."reset_daily_tasks"() TO "service_role";

GRANT ALL ON FUNCTION "public"."reset_user_tasks"("target_user_id" "uuid", "override_day" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."reset_user_tasks"("target_user_id" "uuid", "override_day" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."reset_user_tasks"("target_user_id" "uuid", "override_day" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."set_event_phase"("p_phase" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."set_event_phase"("p_phase" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."set_event_phase"("p_phase" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."show_event_status"() TO "anon";

GRANT ALL ON FUNCTION "public"."show_event_status"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."show_event_status"() TO "service_role";

GRANT ALL ON FUNCTION "public"."show_user_participation"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."show_user_participation"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."show_user_participation"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."spend_energy"("p_user_id" "uuid", "p_amount" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."spend_energy"("p_user_id" "uuid", "p_amount" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."spend_energy"("p_user_id" "uuid", "p_amount" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."spend_energy_self"("p_amount" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."spend_energy_self"("p_amount" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."spend_energy_self"("p_amount" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_battle_stats"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_battle_stats"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_battle_stats"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_completed_today"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_completed_today"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_completed_today"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) TO "anon";

GRANT ALL ON FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_longest_streak"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_longest_streak"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_longest_streak"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_milestone_on_daily_quota"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_milestone_on_daily_quota"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_milestone_on_daily_quota"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_profiles_updated_at"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_streak_on_quota_completion"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_streak_on_quota_completion"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_streak_on_quota_completion"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON FUNCTION "public"."user_can_battle_boss"("p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."user_can_battle_boss"("p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."user_can_battle_boss"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."user_participated_in_phase1"("p_user_id" "uuid", "p_event_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."user_participated_in_phase1"("p_user_id" "uuid", "p_event_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."user_participated_in_phase1"("p_user_id" "uuid", "p_event_id" "uuid") TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";

GRANT ALL ON TABLE "public"."profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."reports" TO "anon";

GRANT ALL ON TABLE "public"."reports" TO "authenticated";

GRANT ALL ON TABLE "public"."reports" TO "service_role";

GRANT ALL ON TABLE "public"."admin_reports" TO "anon";

GRANT ALL ON TABLE "public"."admin_reports" TO "authenticated";

GRANT ALL ON TABLE "public"."admin_reports" TO "service_role";

GRANT ALL ON TABLE "public"."admin_users" TO "anon";

GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";

GRANT ALL ON TABLE "public"."admin_users" TO "service_role";

GRANT ALL ON TABLE "public"."battle_limits" TO "anon";

GRANT ALL ON TABLE "public"."battle_limits" TO "authenticated";

GRANT ALL ON TABLE "public"."battle_limits" TO "service_role";

GRANT ALL ON TABLE "public"."daily_quotas" TO "anon";

GRANT ALL ON TABLE "public"."daily_quotas" TO "authenticated";

GRANT ALL ON TABLE "public"."daily_quotas" TO "service_role";

GRANT ALL ON TABLE "public"."digimon" TO "anon";

GRANT ALL ON TABLE "public"."digimon" TO "authenticated";

GRANT ALL ON TABLE "public"."digimon" TO "service_role";

GRANT ALL ON TABLE "public"."digimon_forms" TO "anon";

GRANT ALL ON TABLE "public"."digimon_forms" TO "authenticated";

GRANT ALL ON TABLE "public"."digimon_forms" TO "service_role";

GRANT ALL ON SEQUENCE "public"."digimon_forms_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."digimon_forms_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."digimon_forms_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."digimon_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."digimon_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."digimon_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."evolution_paths" TO "anon";

GRANT ALL ON TABLE "public"."evolution_paths" TO "authenticated";

GRANT ALL ON TABLE "public"."evolution_paths" TO "service_role";

GRANT ALL ON SEQUENCE "public"."evolution_paths_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."evolution_paths_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."evolution_paths_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."task_history" TO "anon";

GRANT ALL ON TABLE "public"."task_history" TO "authenticated";

GRANT ALL ON TABLE "public"."task_history" TO "service_role";

GRANT ALL ON TABLE "public"."tasks" TO "anon";

GRANT ALL ON TABLE "public"."tasks" TO "authenticated";

GRANT ALL ON TABLE "public"."tasks" TO "service_role";

GRANT ALL ON TABLE "public"."team_battles" TO "anon";

GRANT ALL ON TABLE "public"."team_battles" TO "authenticated";

GRANT ALL ON TABLE "public"."team_battles" TO "service_role";

GRANT ALL ON TABLE "public"."titles" TO "anon";

GRANT ALL ON TABLE "public"."titles" TO "authenticated";

GRANT ALL ON TABLE "public"."titles" TO "service_role";

GRANT ALL ON SEQUENCE "public"."titles_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."titles_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."titles_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_currency" TO "anon";

GRANT ALL ON TABLE "public"."user_currency" TO "authenticated";

GRANT ALL ON TABLE "public"."user_currency" TO "service_role";

GRANT ALL ON TABLE "public"."user_digimon" TO "anon";

GRANT ALL ON TABLE "public"."user_digimon" TO "authenticated";

GRANT ALL ON TABLE "public"."user_digimon" TO "service_role";

GRANT ALL ON TABLE "public"."user_digimon_profiles" TO "anon";

GRANT ALL ON TABLE "public"."user_digimon_profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_digimon_profiles" TO "service_role";

GRANT ALL ON TABLE "public"."user_discovered_digimon" TO "anon";

GRANT ALL ON TABLE "public"."user_discovered_digimon" TO "authenticated";

GRANT ALL ON TABLE "public"."user_discovered_digimon" TO "service_role";

GRANT ALL ON TABLE "public"."user_inventory" TO "anon";

GRANT ALL ON TABLE "public"."user_inventory" TO "authenticated";

GRANT ALL ON TABLE "public"."user_inventory" TO "service_role";

GRANT ALL ON TABLE "public"."user_milestones" TO "anon";

GRANT ALL ON TABLE "public"."user_milestones" TO "authenticated";

GRANT ALL ON TABLE "public"."user_milestones" TO "service_role";

GRANT ALL ON TABLE "public"."user_titles" TO "anon";

GRANT ALL ON TABLE "public"."user_titles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_titles" TO "service_role";

GRANT ALL ON SEQUENCE "public"."user_titles_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."user_titles_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."user_titles_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_tournaments" TO "anon";

GRANT ALL ON TABLE "public"."user_tournaments" TO "authenticated";

GRANT ALL ON TABLE "public"."user_tournaments" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

-- Initial application reference data (species, forms, paths, titles).
SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: digimon; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."digimon" ("id", "digimon_id", "request_id", "name", "stage", "type", "attribute", "sprite_url", "hp", "sp", "atk", "def", "int", "spd", "detail_url", "hp_level1", "sp_level1", "atk_level1", "def_level1", "int_level1", "spd_level1", "hp_level99", "sp_level99", "atk_level99", "def_level99", "int_level99", "spd_level99") VALUES
	(2, 2, 2, 'Pabumon', 'Baby', 'Free', 'Neutral', '/assets/digimon/dot387.png', 950, 62, 76, 76, 69, 68, 'https://digidb.io/digimon-search/?request=2', 320, 18, 23, 23, 20, 24, 1590, 106, 130, 130, 118, 112),
	(3, 3, 3, 'Punimon', 'Baby', 'Free', 'Neutral', '/assets/digimon/dot437.png', 870, 50, 97, 87, 50, 75, 'https://digidb.io/digimon-search/?request=3', 290, 11, 34, 29, 11, 26, 1460, 89, 161, 146, 89, 124),
	(5, 5, 5, 'Poyomon', 'Baby', 'Free', 'Neutral', '/assets/digimon/dot320.png', 540, 98, 54, 59, 95, 86, 'https://digidb.io/digimon-search/?request=5', 150, 35, 15, 15, 32, 28, 930, 162, 93, 103, 159, 145),
	(6, 6, 250, 'Arcadiamon In-Tr.', 'In-Training', 'Free', 'Dark', '/assets/digimon/dot062.png', 720, 85, 86, 59, 81, 93, 'https://digidb.io/digimon-search/?request=250', 330, 22, 47, 15, 18, 35, 1110, 149, 125, 103, 145, 152),
	(7, 7, 6, 'Koromon', 'In-Training', 'Free', 'Fire', '/assets/digimon/dot322.png', 940, 52, 109, 93, 52, 76, 'https://digidb.io/digimon-search/?request=6', 360, 13, 46, 35, 13, 27, 1530, 91, 173, 152, 91, 125),
	(9, 9, 8, 'Tsunomon', 'In-Training', 'Free', 'Earth', '/assets/digimon/dot438.png', 930, 54, 107, 92, 54, 76, 'https://digidb.io/digimon-search/?request=8', 350, 15, 44, 34, 15, 27, 1520, 93, 171, 151, 93, 125),
	(10, 10, 9, 'Tsumemon', 'In-Training', 'Free', 'Dark', '/assets/digimon/dot631.png', 930, 64, 108, 64, 54, 93, 'https://digidb.io/digimon-search/?request=9', 350, 20, 45, 20, 15, 35, 1520, 108, 172, 108, 93, 152),
	(11, 11, 10, 'Tokomon', 'In-Training', 'Free', 'Neutral', '/assets/digimon/dot325.png', 640, 86, 76, 74, 74, 103, 'https://digidb.io/digimon-search/?request=10', 200, 33, 27, 25, 25, 40, 1080, 140, 125, 123, 123, 167),
	(12, 12, 11, 'Nyaromon', 'In-Training', 'Free', 'Light', '/assets/digimon/dot515.png', 540, 107, 54, 64, 103, 94, 'https://digidb.io/digimon-search/?request=11', 150, 44, 15, 20, 40, 36, 930, 171, 93, 108, 167, 153),
	(14, 14, 13, 'Yokomon', 'In-Training', 'Free', 'Plant', '/assets/digimon/dot510.png', 1040, 64, 82, 82, 75, 69, 'https://digidb.io/digimon-search/?request=13', 410, 20, 29, 29, 26, 25, 1680, 108, 136, 136, 124, 113),
	(15, 15, 14, 'Bukamon', 'In-Training', 'Free', 'Water', '/assets/digimon/dot514.png', 830, 93, 54, 74, 103, 69, 'https://digidb.io/digimon-search/?request=14', 300, 35, 15, 25, 40, 25, 1370, 152, 93, 123, 167, 113),
	(16, 16, 15, 'Motimon', 'In-Training', 'Free', 'Neutral', '/assets/digimon/dot388.png', 1030, 63, 82, 81, 78, 69, 'https://digidb.io/digimon-search/?request=15', 400, 19, 29, 28, 29, 25, 1670, 107, 136, 135, 127, 113),
	(18, 18, 17, 'Agumon', 'Rookie', 'Vaccine', 'Fire', '/assets/digimon/dot050.png', 1030, 59, 131, 103, 54, 86, 'https://digidb.io/digimon-search/?request=17', 450, 20, 68, 45, 15, 37, 1620, 98, 195, 162, 93, 135),
	(19, 19, 18, 'Agumon (Blk)', 'Rookie', 'Virus', 'Fire', '/assets/digimon/dot143.png', 1020, 56, 124, 108, 56, 85, 'https://digidb.io/digimon-search/?request=18', 440, 17, 61, 50, 17, 36, 1610, 95, 188, 167, 95, 134),
	(20, 20, 251, 'Arcadiamon Rookie', 'Rookie', 'Virus', 'Dark', '/assets/digimon/dot063.png', 950, 86, 105, 79, 85, 86, 'https://digidb.io/digimon-search/?request=251', 420, 33, 56, 30, 36, 33, 1490, 140, 154, 128, 134, 140),
	(22, 22, 20, 'Impmon', 'Rookie', 'Virus', 'Dark', '/assets/digimon/dot081.png', 530, 114, 83, 65, 114, 102, 'https://digidb.io/digimon-search/?request=20', 140, 51, 44, 21, 51, 44, 920, 178, 122, 109, 178, 161),
	(23, 23, 21, 'Elecmon', 'Rookie', 'Data', 'Electric', '/assets/digimon/dot564.png', 930, 93, 82, 79, 79, 90, 'https://digidb.io/digimon-search/?request=21', 400, 40, 33, 30, 30, 37, 1470, 147, 131, 128, 128, 144),
	(24, 24, 22, 'Otamamon', 'Rookie', 'Virus', 'Water', '/assets/digimon/dot582.png', 930, 105, 52, 75, 113, 78, 'https://digidb.io/digimon-search/?request=22', 400, 47, 13, 26, 50, 34, 1470, 164, 91, 124, 177, 122),
	(26, 26, 24, 'Gazimon', 'Rookie', 'Virus', 'Dark', '/assets/digimon/dot569.png', 970, 71, 123, 64, 59, 102, 'https://digidb.io/digimon-search/?request=24', 390, 27, 60, 20, 20, 44, 1560, 115, 187, 108, 98, 161),
	(27, 27, 25, 'Gabumon', 'Rookie', 'Data', 'Fire', '/assets/digimon/dot151.png', 980, 88, 94, 81, 79, 91, 'https://digidb.io/digimon-search/?request=25', 450, 35, 45, 32, 30, 38, 1520, 142, 143, 130, 128, 145),
	(28, 28, 26, 'Gabumon (Blk)', 'Rookie', 'Virus', 'Fire', '/assets/digimon/dot713.png', 950, 83, 99, 89, 74, 91, 'https://digidb.io/digimon-search/?request=26', 420, 30, 50, 40, 25, 38, 1490, 137, 148, 138, 123, 145),
	(30, 30, 28, 'Kudamon', 'Rookie', 'Vaccine', 'Light', '/assets/digimon/dot053.png', 590, 128, 53, 74, 117, 105, 'https://digidb.io/digimon-search/?request=28', 200, 65, 14, 30, 54, 47, 980, 192, 92, 118, 181, 164),
	(31, 31, 29, 'Keramon', 'Rookie', 'Free', 'Dark', '/assets/digimon/dot626.png', 1030, 74, 123, 69, 61, 101, 'https://digidb.io/digimon-search/?request=29', 450, 30, 60, 25, 22, 43, 1620, 118, 187, 113, 100, 160),
	(32, 32, 30, 'Gotsumon', 'Rookie', 'Data', 'Earth', '/assets/digimon/dot595.png', 790, 79, 93, 118, 90, 72, 'https://digidb.io/digimon-search/?request=30', 300, 30, 40, 55, 37, 33, 1280, 128, 147, 182, 144, 111),
	(33, 33, 31, 'Goblimon', 'Rookie', 'Virus', 'Earth', '/assets/digimon/dot111.png', 1050, 51, 115, 110, 51, 84, 'https://digidb.io/digimon-search/?request=31', 470, 12, 52, 52, 12, 35, 1640, 90, 179, 169, 90, 133),
	(35, 35, 33, 'Syakomon', 'Rookie', 'Virus', 'Water', '/assets/digimon/dot709.png', 870, 100, 53, 86, 112, 78, 'https://digidb.io/digimon-search/?request=33', 340, 42, 14, 37, 49, 34, 1410, 159, 92, 135, 176, 122),
	(36, 36, 252, 'Zubamon', 'Rookie', 'Vaccine', 'Neutral', '/assets/digimon/dot697.png', 1010, 57, 126, 111, 54, 87, 'https://digidb.io/digimon-search/?request=252', 430, 18, 63, 53, 15, 38, 1600, 96, 190, 170, 93, 136),
	(37, 37, 34, 'Solarmon', 'Rookie', 'Vaccine', 'Light', '/assets/digimon/dot728.png', 1030, 88, 69, 108, 71, 77, 'https://digidb.io/digimon-search/?request=34', 400, 35, 25, 45, 27, 38, 1670, 142, 113, 172, 115, 116),
	(39, 39, 35, 'Terriermon', 'Rookie', 'Vaccine', 'Wind', '/assets/digimon/dot701.png', 690, 93, 84, 75, 84, 112, 'https://digidb.io/digimon-search/?request=35', 250, 40, 35, 26, 35, 49, 1130, 147, 133, 124, 133, 176),
	(40, 40, 36, 'Tentomon', 'Rookie', 'Vaccine', 'Plant', '/assets/digimon/dot303.png', 750, 79, 86, 110, 93, 73, 'https://digidb.io/digimon-search/?request=36', 260, 30, 33, 47, 40, 34, 1240, 128, 140, 174, 147, 112),
	(41, 41, 37, 'ToyAgumon', 'Rookie', 'Vaccine', 'Neutral', '/assets/digimon/dot708.png', 1110, 87, 72, 112, 63, 71, 'https://digidb.io/digimon-search/?request=37', 480, 34, 28, 49, 19, 32, 1750, 141, 116, 176, 107, 110),
	(43, 43, 255, 'Dracomon', 'Rookie', 'Data', 'Fire', '/assets/digimon/dot208.png', 980, 69, 132, 89, 49, 99, 'https://digidb.io/digimon-search/?request=255', 400, 30, 69, 31, 10, 50, 1570, 108, 196, 148, 88, 148),
	(44, 44, 38, 'Dorumon', 'Rookie', 'Data', 'Neutral', '/assets/digimon/dot112.png', 1020, 65, 128, 79, 56, 101, 'https://digidb.io/digimon-search/?request=38', 440, 21, 65, 35, 17, 43, 1610, 109, 192, 123, 95, 160),
	(45, 45, 39, 'Hagurumon', 'Rookie', 'Virus', 'Electric', '/assets/digimon/dot009.png', 1090, 91, 66, 110, 69, 71, 'https://digidb.io/digimon-search/?request=39', 460, 38, 22, 47, 25, 32, 1730, 145, 110, 174, 113, 110),
	(46, 46, 40, 'Patamon', 'Rookie', 'Data', 'Wind', '/assets/digimon/dot096.png', 880, 93, 79, 74, 92, 90, 'https://digidb.io/digimon-search/?request=40', 350, 40, 30, 25, 43, 37, 1420, 147, 128, 123, 141, 144),
	(50, 50, 44, 'Biyomon', 'Rookie', 'Vaccine', 'Wind', '/assets/digimon/dot307.png', 830, 93, 85, 79, 85, 91, 'https://digidb.io/digimon-search/?request=44', 300, 40, 36, 30, 36, 38, 1370, 147, 134, 128, 134, 145),
	(51, 51, 45, 'Falcomon', 'Rookie', 'Vaccine', 'Wind', '/assets/digimon/dot705.png', 740, 93, 94, 79, 79, 113, 'https://digidb.io/digimon-search/?request=45', 300, 40, 45, 30, 30, 50, 1180, 147, 143, 128, 128, 177),
	(52, 52, 256, 'FanBeemon', 'Rookie', 'Virus', 'Plant', '/assets/digimon/dot042.png', 860, 69, 104, 86, 73, 98, 'https://digidb.io/digimon-search/?request=256', 280, 30, 41, 28, 34, 49, 1450, 108, 168, 145, 112, 147),
	(54, 54, 47, 'Salamon', 'Rookie', 'Vaccine', 'Light', '/assets/digimon/dot361.png', 540, 118, 59, 69, 119, 97, 'https://digidb.io/digimon-search/?request=47', 150, 55, 20, 25, 56, 39, 930, 182, 98, 113, 183, 156),
	(55, 55, 48, 'Betamon', 'Rookie', 'Virus', 'Water', '/assets/digimon/dot389.png', 870, 101, 61, 76, 113, 78, 'https://digidb.io/digimon-search/?request=48', 340, 43, 22, 27, 50, 34, 1410, 160, 100, 125, 177, 122),
	(56, 56, 49, 'Hawkmon', 'Rookie', 'Free', 'Wind', '/assets/digimon/dot706.png', 690, 88, 99, 79, 83, 114, 'https://digidb.io/digimon-search/?request=49', 250, 35, 50, 30, 34, 51, 1130, 142, 148, 128, 132, 178),
	(57, 57, 257, 'Mushroomon', 'Rookie', 'Virus', 'Plant', '/assets/digimon/dot607.png', 1110, 64, 96, 88, 79, 78, 'https://digidb.io/digimon-search/?request=257', 480, 20, 43, 35, 30, 34, 1750, 108, 150, 142, 128, 122),
	(59, 59, 50, 'Lalamon', 'Rookie', 'Data', 'Plant', '/assets/digimon/dot056.png', 1100, 74, 87, 87, 79, 79, 'https://digidb.io/digimon-search/?request=50', 470, 30, 34, 34, 30, 35, 1740, 118, 141, 141, 128, 123),
	(60, 60, 51, 'Lucemon', 'Rookie', 'Vaccine', 'Light', '/assets/digimon/dot390.png', 1230, 148, 59, 104, 208, 119, 'https://digidb.io/digimon-search/?request=51', 700, 90, 20, 55, 145, 75, 1770, 207, 98, 153, 272, 163),
	(61, 61, 259, 'Lunamon', 'Rookie', 'Data', 'Water', '/assets/digimon/dot002.png', 890, 94, 89, 76, 101, 82, 'https://digidb.io/digimon-search/?request=259', 260, 50, 36, 23, 52, 38, 1530, 138, 143, 130, 150, 126),
	(63, 63, 53, 'Lopmon', 'Rookie', 'Data', 'Earth', '/assets/digimon/dot750.png', 790, 79, 103, 68, 103, 85, 'https://digidb.io/digimon-search/?request=53', 300, 30, 45, 24, 45, 36, 1280, 128, 162, 112, 162, 134),
	(64, 64, 54, 'Wormmon', 'Rookie', 'Free', 'Plant', '/assets/digimon/dot392.png', 760, 76, 92, 111, 90, 71, 'https://digidb.io/digimon-search/?request=54', 270, 27, 39, 48, 37, 32, 1250, 125, 146, 175, 144, 110),
	(65, 65, 55, 'IceDevimon', 'Champion', 'Virus', 'Water', '/assets/digimon/dot730.png', 990, 94, 140, 89, 118, 92, 'https://digidb.io/digimon-search/?request=55', 500, 45, 82, 45, 60, 43, 1480, 143, 199, 133, 177, 141),
	(67, 67, 56, 'Aquilamon', 'Champion', 'Free', 'Wind', '/assets/digimon/dot015.png', 840, 108, 109, 89, 89, 143, 'https://digidb.io/digimon-search/?request=56', 400, 55, 60, 40, 40, 80, 1280, 162, 158, 138, 138, 207),
	(68, 68, 261, 'Agunimon', 'Champion', 'Free', 'Fire', '/assets/digimon/dot676.png', 1130, 88, 134, 93, 84, 119, 'https://digidb.io/digimon-search/?request=261', 600, 35, 85, 44, 35, 66, 1670, 142, 183, 142, 133, 173),
	(69, 69, 262, 'Arcadiamon Champion', 'Champion', 'Virus', 'Dark', '/assets/digimon/dot064.png', 1130, 98, 139, 84, 89, 108, 'https://digidb.io/digimon-search/?request=262', 600, 45, 90, 35, 40, 55, 1670, 152, 188, 133, 138, 162),
	(71, 71, 58, 'Ikkakumon', 'Champion', 'Vaccine', 'Water', '/assets/digimon/dot344.png', 1330, 84, 118, 102, 94, 90, 'https://digidb.io/digimon-search/?request=58', 700, 40, 65, 49, 45, 46, 1970, 128, 172, 156, 143, 134),
	(72, 72, 59, 'Wizardmon', 'Champion', 'Data', 'Dark', '/assets/digimon/dot377.png', 690, 138, 74, 79, 143, 118, 'https://digidb.io/digimon-search/?request=59', 300, 75, 35, 35, 80, 60, 1080, 202, 113, 123, 207, 177),
	(73, 73, 263, 'Lobomon', 'Champion', 'Free', 'Light', '/assets/digimon/dot680.png', 1180, 79, 143, 95, 69, 117, 'https://digidb.io/digimon-search/?request=263', 600, 40, 80, 37, 30, 68, 1770, 118, 207, 154, 108, 166),
	(74, 74, 60, 'Woodmon', 'Champion', 'Virus', 'Plant', '/assets/digimon/dot393.png', 1480, 74, 109, 103, 89, 88, 'https://digidb.io/digimon-search/?request=60', 850, 30, 56, 50, 40, 44, 2120, 118, 163, 157, 138, 132),
	(76, 76, 61, 'ExVeemon', 'Champion', 'Free', 'Neutral', '/assets/digimon/dot365.png', 1030, 118, 104, 94, 94, 118, 'https://digidb.io/digimon-search/?request=61', 500, 65, 55, 45, 45, 65, 1570, 172, 153, 143, 143, 172),
	(77, 77, 62, 'Angemon', 'Champion', 'Vaccine', 'Light', '/assets/digimon/dot087.png', 940, 94, 128, 89, 128, 99, 'https://digidb.io/digimon-search/?request=62', 450, 45, 70, 45, 70, 50, 1430, 143, 187, 133, 187, 148),
	(78, 78, 63, 'Ogremon', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot394.png', 1230, 64, 155, 118, 64, 97, 'https://digidb.io/digimon-search/?request=63', 650, 25, 92, 60, 25, 48, 1820, 103, 219, 177, 103, 146),
	(80, 80, 265, 'Guardromon (Gold)', 'Champion', 'Free', 'Electric', '/assets/digimon/dot760.png', 1130, 83, 99, 168, 96, 62, 'https://digidb.io/digimon-search/?request=265', 500, 30, 55, 105, 52, 23, 1770, 137, 143, 232, 140, 101),
	(81, 81, 65, 'GaoGamon', 'Champion', 'Data', 'Wind', '/assets/digimon/dot068.png', 740, 108, 109, 94, 99, 138, 'https://digidb.io/digimon-search/?request=65', 300, 55, 60, 45, 50, 75, 1180, 162, 158, 143, 148, 202),
	(82, 82, 66, 'Kabuterimon', 'Champion', 'Vaccine', 'Plant', '/assets/digimon/dot304.png', 890, 89, 108, 128, 116, 81, 'https://digidb.io/digimon-search/?request=66', 400, 40, 55, 65, 63, 42, 1380, 138, 162, 192, 170, 120),
	(84, 84, 68, 'Gargomon', 'Champion', 'Vaccine', 'Electric', '/assets/digimon/dot710.png', 1030, 103, 109, 99, 89, 108, 'https://digidb.io/digimon-search/?request=68', 500, 50, 60, 50, 40, 55, 1570, 157, 158, 148, 138, 162),
	(85, 85, 69, 'Garurumon', 'Champion', 'Vaccine', 'Fire', '/assets/digimon/dot012.png', 890, 108, 99, 94, 94, 138, 'https://digidb.io/digimon-search/?request=69', 450, 55, 50, 45, 45, 75, 1330, 162, 148, 143, 143, 202),
	(86, 86, 70, 'Garurumon (Blk)', 'Champion', 'Virus', 'Fire', '/assets/digimon/dot714.png', 890, 108, 109, 104, 79, 133, 'https://digidb.io/digimon-search/?request=70', 450, 55, 60, 55, 30, 70, 1330, 162, 158, 153, 128, 197),
	(87, 87, 71, 'Kyubimon', 'Champion', 'Data', 'Fire', '/assets/digimon/dot395.png', 740, 138, 59, 84, 138, 128, 'https://digidb.io/digimon-search/?request=71', 350, 75, 20, 40, 75, 70, 1130, 202, 98, 128, 202, 187),
	(89, 89, 73, 'Kurisarimon', 'Champion', 'Free', 'Dark', '/assets/digimon/dot630.png', 1280, 84, 153, 79, 64, 113, 'https://digidb.io/digimon-search/?request=73', 700, 40, 90, 35, 25, 55, 1870, 128, 217, 123, 103, 172),
	(90, 90, 74, 'Greymon', 'Champion', 'Vaccine', 'Fire', '/assets/digimon/dot326.png', 1230, 74, 148, 118, 64, 104, 'https://digidb.io/digimon-search/?request=74', 650, 35, 85, 60, 25, 55, 1820, 113, 212, 177, 103, 153),
	(91, 91, 75, 'Greymon (Blue)', 'Champion', 'Virus', 'Fire', '/assets/digimon/dot712.png', 1280, 74, 153, 118, 59, 99, 'https://digidb.io/digimon-search/?request=75', 700, 35, 90, 60, 20, 50, 1870, 113, 217, 177, 98, 148),
	(93, 93, 77, 'Kuwagamon', 'Champion', 'Virus', 'Plant', '/assets/digimon/dot367.png', 1180, 69, 153, 113, 59, 99, 'https://digidb.io/digimon-search/?request=77', 600, 30, 90, 55, 20, 50, 1770, 108, 217, 172, 98, 148),
	(94, 94, 78, 'Gekomon', 'Champion', 'Virus', 'Water', '/assets/digimon/dot399.png', 1130, 123, 68, 89, 128, 90, 'https://digidb.io/digimon-search/?request=78', 600, 65, 29, 40, 65, 46, 1670, 182, 107, 138, 192, 134),
	(97, 97, 267, 'Coredramon (Green)', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot209.png', 1230, 74, 151, 99, 61, 123, 'https://digidb.io/digimon-search/?request=267', 650, 30, 88, 55, 22, 65, 1820, 118, 215, 143, 100, 182),
	(98, 98, 80, 'GoldNumemon', 'Champion', 'Virus', 'Light', '/assets/digimon/dot113.png', 1130, 124, 59, 84, 143, 88, 'https://digidb.io/digimon-search/?request=80', 600, 66, 20, 35, 80, 44, 1670, 183, 98, 133, 207, 132),
	(99, 99, 268, 'Golemon', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot005.png', 1430, 79, 121, 132, 62, 74, 'https://digidb.io/digimon-search/?request=268', 850, 40, 58, 74, 23, 25, 2020, 118, 185, 191, 101, 123),
	(101, 101, 269, 'Sangloupmon', 'Champion', 'Virus', 'Dark', '/assets/digimon/dot030.png', 1180, 85, 123, 91, 90, 104, 'https://digidb.io/digimon-search/?request=269', 550, 41, 70, 38, 41, 60, 1820, 129, 177, 145, 139, 148),
	(102, 102, 82, 'Sunflowmon', 'Champion', 'Data', 'Plant', '/assets/digimon/dot058.png', 1180, 113, 64, 89, 141, 86, 'https://digidb.io/digimon-search/?request=82', 650, 55, 25, 40, 78, 42, 1720, 172, 103, 138, 205, 130),
	(103, 103, 83, 'Seadramon', 'Champion', 'Data', 'Water', '/assets/digimon/dot347.png', 1080, 118, 64, 99, 134, 88, 'https://digidb.io/digimon-search/?request=83', 550, 60, 25, 50, 71, 44, 1620, 177, 103, 148, 198, 132),
	(104, 104, 270, 'Coelamon', 'Champion', 'Data', 'Water', '/assets/digimon/dot130.png', 1290, 79, 113, 105, 90, 96, 'https://digidb.io/digimon-search/?request=270', 800, 30, 55, 61, 32, 47, 1780, 128, 172, 149, 149, 145),
	(106, 106, 85, 'Sukamon', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot313.png', 1430, 98, 89, 133, 69, 79, 'https://digidb.io/digimon-search/?request=85', 800, 45, 45, 70, 25, 40, 2070, 152, 133, 197, 113, 118),
	(107, 107, 86, 'Starmon', 'Champion', 'Data', 'Neutral', '/assets/digimon/dot014.png', 1080, 98, 104, 109, 91, 101, 'https://digidb.io/digimon-search/?request=86', 550, 45, 55, 60, 42, 48, 1620, 152, 153, 158, 140, 155),
	(108, 108, 87, 'Stingmon', 'Champion', 'Free', 'Plant', '/assets/digimon/dot091.png', 1130, 84, 143, 74, 74, 133, 'https://digidb.io/digimon-search/?request=87', 550, 40, 80, 30, 35, 75, 1720, 128, 207, 118, 113, 192),
	(110, 110, 272, 'Zubaeagermon', 'Champion', 'Vaccine', 'Neutral', '/assets/digimon/dot698.png', 1160, 67, 148, 126, 63, 111, 'https://digidb.io/digimon-search/?request=272', 580, 28, 85, 68, 24, 62, 1750, 106, 212, 185, 102, 160),
	(111, 111, 88, 'Socerimon', 'Champion', 'Vaccine', 'Water', '/assets/digimon/dot755.png', 1030, 123, 64, 93, 148, 90, 'https://digidb.io/digimon-search/?request=88', 500, 65, 25, 44, 85, 46, 1570, 182, 103, 142, 212, 134),
	(112, 112, 89, 'Tankmon', 'Champion', 'Data', 'Electric', '/assets/digimon/dot621.png', 940, 84, 113, 141, 98, 81, 'https://digidb.io/digimon-search/?request=89', 450, 35, 60, 78, 45, 42, 1430, 133, 167, 205, 152, 120),
	(114, 114, 90, 'Tyrannomon', 'Champion', 'Data', 'Fire', '/assets/digimon/dot363.png', 1230, 59, 148, 125, 59, 97, 'https://digidb.io/digimon-search/?request=90', 650, 20, 85, 67, 20, 48, 1820, 98, 212, 184, 98, 146),
	(115, 115, 91, 'Gatomon', 'Champion', 'Vaccine', 'Light', '/assets/digimon/dot092.png', 640, 143, 69, 79, 143, 123, 'https://digidb.io/digimon-search/?request=91', 250, 80, 30, 35, 80, 65, 1030, 207, 108, 123, 207, 182),
	(116, 116, 92, 'Devimon', 'Champion', 'Virus', 'Dark', '/assets/digimon/dot093.png', 990, 94, 133, 84, 125, 97, 'https://digidb.io/digimon-search/?request=92', 500, 45, 75, 40, 67, 48, 1480, 143, 192, 128, 184, 146),
	(117, 117, 274, 'Turuiemon', 'Champion', 'Data', 'Earth', '/assets/digimon/dot102.png', 1140, 78, 130, 91, 78, 120, 'https://digidb.io/digimon-search/?request=274', 560, 34, 67, 47, 39, 62, 1730, 122, 194, 135, 117, 179),
	(119, 119, 94, 'Dorugamon', 'Champion', 'Data', 'Earth', '/assets/digimon/dot396.png', 1180, 84, 138, 89, 69, 123, 'https://digidb.io/digimon-search/?request=94', 600, 40, 75, 45, 30, 65, 1770, 128, 202, 133, 108, 182),
	(120, 120, 95, 'Nanimon', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot375.png', 1070, 84, 108, 133, 98, 81, 'https://digidb.io/digimon-search/?request=95', 580, 35, 55, 70, 45, 42, 1560, 133, 162, 197, 152, 120),
	(121, 121, 96, 'Numemon', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot070.png', 1380, 99, 84, 138, 69, 83, 'https://digidb.io/digimon-search/?request=96', 750, 46, 40, 75, 25, 44, 2020, 153, 128, 202, 113, 122),
	(123, 123, 275, 'BaoHuckmon', 'Champion', 'Data', 'Fire', '/assets/digimon/dot115.png', 990, 96, 116, 117, 90, 113, 'https://digidb.io/digimon-search/?request=275', 600, 33, 77, 73, 27, 55, 1380, 160, 155, 161, 154, 172),
	(124, 124, 98, 'Bakemon', 'Champion', 'Virus', 'Dark', '/assets/digimon/dot013.png', 590, 148, 64, 74, 138, 128, 'https://digidb.io/digimon-search/?request=98', 200, 85, 25, 30, 75, 70, 980, 212, 103, 118, 202, 187),
	(125, 125, 99, 'Veedramon', 'Champion', 'Vaccine', 'Wind', '/assets/digimon/dot397.png', 1180, 84, 138, 113, 64, 114, 'https://digidb.io/digimon-search/?request=99', 600, 45, 75, 55, 25, 65, 1770, 123, 202, 172, 103, 163),
	(127, 127, 100, 'PlatinumSukamon', 'Champion', 'Virus', 'Neutral', '/assets/digimon/dot752.png', 450, 98, 84, 999, 50, 103, 'https://digidb.io/digimon-search/?request=100', 10, 45, 35, 999, 1, 40, 890, 152, 133, 999, 99, 167),
	(128, 128, 101, 'BlackGatomon', 'Champion', 'Virus', 'Dark', '/assets/digimon/dot043.png', 690, 133, 84, 84, 133, 118, 'https://digidb.io/digimon-search/?request=101', 300, 70, 45, 40, 70, 60, 1080, 197, 123, 128, 197, 177),
	(129, 129, 102, 'Vegiemon', 'Champion', 'Virus', 'Plant', '/assets/digimon/dot314.png', 1380, 79, 113, 106, 87, 88, 'https://digidb.io/digimon-search/?request=102', 750, 35, 60, 53, 38, 44, 2020, 123, 167, 160, 136, 132),
	(131, 131, 104, 'Meramon', 'Champion', 'Data', 'Fire', '/assets/digimon/dot010.png', 1130, 69, 138, 113, 79, 99, 'https://digidb.io/digimon-search/?request=104', 550, 30, 75, 55, 40, 50, 1720, 108, 202, 172, 118, 148),
	(132, 132, 277, 'Monochromon', 'Champion', 'Data', 'Earth', '/assets/digimon/dot369.png', 1030, 76, 135, 128, 77, 92, 'https://digidb.io/digimon-search/?request=277', 450, 37, 72, 70, 38, 43, 1620, 115, 199, 187, 116, 141),
	(133, 133, 105, 'Frigimon', 'Champion', 'Vaccine', 'Water', '/assets/digimon/dot370.png', 1380, 83, 103, 98, 99, 90, 'https://digidb.io/digimon-search/?request=105', 750, 39, 50, 45, 50, 46, 2020, 127, 157, 152, 148, 134),
	(135, 135, 279, 'Raptordramon', 'Champion', 'Vaccine', 'Neutral', '/assets/digimon/dot025.png', 1130, 83, 131, 101, 83, 100, 'https://digidb.io/digimon-search/?request=279', 600, 25, 92, 52, 20, 56, 1670, 142, 170, 150, 147, 144),
	(136, 136, 280, 'Raremon', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot590.png', 1330, 83, 105, 100, 88, 103, 'https://digidb.io/digimon-search/?request=280', 890, 30, 56, 51, 39, 40, 1770, 137, 154, 149, 137, 167),
	(137, 137, 106, 'Leomon', 'Champion', 'Vaccine', 'Earth', '/assets/digimon/dot072.png', 1180, 69, 143, 123, 71, 97, 'https://digidb.io/digimon-search/?request=106', 600, 30, 80, 65, 32, 48, 1770, 108, 207, 182, 110, 146),
	(138, 138, 281, 'Lekismon', 'Champion', 'Data', 'Water', '/assets/digimon/dot003.png', 790, 113, 94, 84, 99, 143, 'https://digidb.io/digimon-search/?request=281', 350, 60, 45, 35, 50, 80, 1230, 167, 143, 133, 148, 207),
	(140, 140, 108, 'Waspmon', 'Champion', 'Virus', 'Electric', '/assets/digimon/dot454.png', 1180, 74, 133, 99, 74, 113, 'https://digidb.io/digimon-search/?request=108', 600, 30, 70, 55, 35, 55, 1770, 118, 197, 143, 113, 172),
	(141, 141, 109, 'MegaKabuterimon', 'Ultimate', 'Vaccine', 'Plant', '/assets/digimon/dot305.png', 1430, 115, 94, 163, 109, 92, 'https://digidb.io/digimon-search/?request=109', 800, 62, 50, 100, 65, 53, 2070, 169, 138, 227, 153, 131),
	(143, 143, 110, 'Antylamon', 'Ultimate', 'Data', 'Neutral', '/assets/digimon/dot731.png', 940, 123, 124, 109, 114, 168, 'https://digidb.io/digimon-search/?request=110', 500, 70, 75, 60, 65, 105, 1380, 177, 173, 158, 163, 232),
	(144, 144, 111, 'Andromon', 'Ultimate', 'Vaccine', 'Electric', '/assets/digimon/dot342.png', 1040, 94, 133, 157, 133, 95, 'https://digidb.io/digimon-search/?request=111', 550, 45, 80, 94, 80, 56, 1530, 143, 187, 221, 187, 134),
	(145, 145, 112, 'Meteormon', 'Ultimate', 'Data', 'Earth', '/assets/digimon/dot756.png', 1090, 104, 123, 163, 128, 89, 'https://digidb.io/digimon-search/?request=112', 600, 55, 70, 100, 75, 50, 1580, 153, 177, 227, 182, 128),
	(147, 147, 114, 'Myotismon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot085.png', 1290, 113, 148, 99, 148, 110, 'https://digidb.io/digimon-search/?request=114', 800, 64, 90, 55, 90, 61, 1780, 162, 207, 143, 207, 159),
	(148, 148, 283, 'Wingdramon', 'Ultimate', 'Vaccine', 'Wind', '/assets/digimon/dot210.png', 1380, 89, 163, 109, 89, 158, 'https://digidb.io/digimon-search/?request=283', 800, 45, 100, 65, 50, 100, 1970, 133, 227, 153, 128, 217),
	(149, 149, 284, 'BurningGreymon', 'Ultimate', 'Free', 'Fire', '/assets/digimon/dot679.png', 1260, 98, 169, 131, 95, 128, 'https://digidb.io/digimon-search/?request=284', 820, 45, 120, 82, 46, 65, 1700, 152, 218, 180, 144, 192),
	(151, 151, 116, 'Etemon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot311.png', 1130, 133, 104, 119, 129, 133, 'https://digidb.io/digimon-search/?request=116', 600, 80, 55, 70, 80, 80, 1670, 187, 153, 168, 178, 187),
	(152, 152, 117, 'Angewomon', 'Ultimate', 'Vaccine', 'Light', '/assets/digimon/dot148.png', 890, 163, 69, 94, 188, 143, 'https://digidb.io/digimon-search/?request=117', 500, 100, 30, 50, 125, 85, 1280, 227, 108, 138, 252, 202),
	(153, 153, 118, 'Okuwamon', 'Ultimate', 'Virus', 'Plant', '/assets/digimon/dot401.png', 1330, 74, 158, 158, 74, 119, 'https://digidb.io/digimon-search/?request=118', 750, 35, 95, 100, 35, 70, 1920, 113, 222, 217, 113, 168),
	(155, 155, 285, 'KendoGarurumon', 'Ultimate', 'Free', 'Light', '/assets/digimon/dot681.png', 1410, 105, 144, 128, 104, 124, 'https://digidb.io/digimon-search/?request=285', 780, 52, 100, 65, 60, 85, 2050, 159, 188, 192, 148, 163),
	(156, 156, 120, 'Gigadramon', 'Ultimate', 'Virus', 'Wind', '/assets/digimon/dot402.png', 1240, 94, 137, 148, 113, 100, 'https://digidb.io/digimon-search/?request=120', 750, 45, 84, 85, 60, 61, 1730, 143, 191, 212, 167, 139),
	(157, 157, 286, 'CatchMamemon', 'Ultimate', 'Data', 'Electric', '/assets/digimon/dot044.png', 1420, 109, 123, 134, 95, 104, 'https://digidb.io/digimon-search/?request=286', 930, 60, 65, 90, 37, 55, 1910, 158, 182, 178, 154, 153),
	(159, 159, 287, 'Groundramon', 'Ultimate', 'Virus', 'Earth', '/assets/digimon/dot211.png', 1430, 84, 198, 143, 74, 104, 'https://digidb.io/digimon-search/?request=287', 850, 45, 135, 85, 35, 55, 2020, 123, 262, 202, 113, 153),
	(160, 160, 122, 'GrapLeomon', 'Ultimate', 'Vaccine', 'Electric', '/assets/digimon/dot403.png', 1580, 89, 163, 99, 79, 143, 'https://digidb.io/digimon-search/?request=122', 1000, 45, 100, 55, 40, 85, 2170, 133, 227, 143, 118, 202),
	(161, 161, 288, 'Grademon', 'Ultimate', 'Vaccine', 'Neutral', '/assets/digimon/dot026.png', 1290, 97, 173, 89, 100, 144, 'https://digidb.io/digimon-search/?request=288', 800, 48, 115, 45, 42, 95, 1780, 146, 232, 133, 159, 193),
	(162, 162, 289, 'Crescemon', 'Ultimate', 'Data', 'Water', '/assets/digimon/dot004.png', 1180, 133, 124, 103, 139, 114, 'https://digidb.io/digimon-search/?request=289', 550, 80, 80, 40, 95, 75, 1820, 187, 168, 167, 183, 153),
	(164, 164, 124, 'Shakkoumon', 'Ultimate', 'Free', 'Light', '/assets/digimon/dot723.png', 1530, 135, 84, 158, 139, 92, 'https://digidb.io/digimon-search/?request=124', 900, 82, 40, 95, 95, 53, 2170, 189, 128, 222, 183, 131),
	(165, 165, 125, 'Cherrymon', 'Ultimate', 'Virus', 'Plant', '/assets/digimon/dot379.png', 1630, 108, 113, 133, 114, 100, 'https://digidb.io/digimon-search/?request=125', 1000, 64, 60, 80, 65, 56, 2270, 152, 167, 187, 163, 144),
	(166, 166, 126, 'Silphymon', 'Ultimate', 'Free', 'Wind', '/assets/digimon/dot720.png', 1040, 138, 119, 119, 124, 158, 'https://digidb.io/digimon-search/?request=126', 600, 85, 70, 70, 75, 95, 1480, 192, 168, 168, 173, 222),
	(168, 168, 128, 'SkullGreymon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot404.png', 1230, 79, 203, 153, 69, 119, 'https://digidb.io/digimon-search/?request=128', 650, 40, 140, 95, 30, 70, 1820, 118, 267, 212, 108, 168),
	(169, 169, 290, 'SkullSatamon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot006.png', 1210, 103, 141, 101, 132, 118, 'https://digidb.io/digimon-search/?request=290', 680, 50, 92, 52, 83, 65, 1750, 157, 190, 150, 181, 172),
	(170, 170, 129, 'Zudomon', 'Ultimate', 'Vaccine', 'Water', '/assets/digimon/dot345.png', 1630, 84, 150, 128, 104, 102, 'https://digidb.io/digimon-search/?request=129', 1000, 40, 97, 75, 55, 58, 2270, 128, 204, 182, 153, 146),
	(171, 171, 291, 'SaviorHuckmon', 'Ultimate', 'Data', 'Fire', '/assets/digimon/dot116.png', 1380, 94, 163, 128, 79, 144, 'https://digidb.io/digimon-search/?request=291', 800, 55, 100, 70, 40, 95, 1970, 133, 227, 187, 118, 193),
	(173, 173, 292, 'Dragomon', 'Ultimate', 'Virus', 'Water', '/assets/digimon/dot129.png', 1280, 115, 126, 111, 137, 99, 'https://digidb.io/digimon-search/?request=292', 700, 76, 63, 53, 98, 50, 1870, 154, 190, 170, 176, 148),
	(174, 174, 131, 'Chirinmon', 'Ultimate', 'Vaccine', 'Light', '/assets/digimon/dot084.png', 940, 133, 124, 119, 124, 168, 'https://digidb.io/digimon-search/?request=131', 500, 80, 75, 70, 75, 105, 1380, 187, 173, 168, 173, 232),
	(175, 175, 293, 'Dinobeemon', 'Ultimate', 'Free', 'Plant', '/assets/digimon/dot023.png', 1330, 94, 193, 124, 84, 133, 'https://digidb.io/digimon-search/?request=293', 750, 50, 130, 80, 45, 75, 1920, 138, 257, 168, 123, 192),
	(177, 177, 133, 'SkullMeramon', 'Ultimate', 'Data', 'Fire', '/assets/digimon/dot406.png', 1530, 79, 183, 133, 70, 113, 'https://digidb.io/digimon-search/?request=133', 950, 40, 120, 75, 31, 64, 2120, 118, 247, 192, 109, 162),
	(178, 178, 294, 'Duramon', 'Ultimate', 'Vaccine', 'Neutral', '/assets/digimon/dot699.png', 1460, 81, 175, 146, 79, 119, 'https://digidb.io/digimon-search/?request=294', 880, 42, 112, 88, 40, 70, 2050, 120, 239, 205, 118, 168),
	(179, 179, 134, 'ShogunGekomon', 'Ultimate', 'Virus', 'Water', '/assets/digimon/dot376.png', 1980, 96, 113, 113, 99, 97, 'https://digidb.io/digimon-search/?request=134', 1350, 52, 60, 60, 50, 53, 2620, 140, 167, 167, 148, 141),
	(181, 181, 135, 'DoruGreymon', 'Ultimate', 'Data', 'Fire', '/assets/digimon/dot407.png', 1480, 84, 161, 153, 84, 116, 'https://digidb.io/digimon-search/?request=135', 900, 45, 98, 95, 45, 67, 2070, 123, 225, 212, 123, 165),
	(182, 182, 136, 'Knightmon', 'Ultimate', 'Data', 'Neutral', '/assets/digimon/dot718.png', 1140, 109, 135, 158, 123, 92, 'https://digidb.io/digimon-search/?request=136', 650, 60, 82, 95, 70, 53, 1630, 158, 189, 222, 177, 131),
	(183, 183, 137, 'Datamon', 'Ultimate', 'Virus', 'Electric', '/assets/digimon/dot576.png', 1180, 133, 74, 114, 175, 102, 'https://digidb.io/digimon-search/?request=137', 650, 75, 35, 65, 112, 58, 1720, 192, 113, 163, 239, 146),
	(185, 185, 139, 'Panjyamon', 'Ultimate', 'Vaccine', 'Water', '/assets/digimon/dot409.png', 1280, 128, 124, 114, 111, 126, 'https://digidb.io/digimon-search/?request=139', 750, 75, 75, 65, 62, 73, 1820, 182, 173, 163, 160, 180),
	(186, 186, 296, 'Pandamon', 'Ultimate', 'Data', 'Earth', '/assets/digimon/dot041.png', 1090, 104, 135, 153, 118, 97, 'https://digidb.io/digimon-search/?request=296', 600, 55, 82, 90, 65, 58, 1580, 153, 189, 217, 172, 136),
	(187, 187, 140, 'Pumpkinmon', 'Ultimate', 'Data', 'Earth', '/assets/digimon/dot596.png', 1480, 97, 123, 108, 119, 111, 'https://digidb.io/digimon-search/?request=140', 850, 53, 70, 55, 70, 67, 2120, 141, 177, 162, 168, 155),
	(189, 189, 297, 'HippoGryphonmon', 'Ultimate', 'Data', 'Wind', '/assets/digimon/dot082.png', 990, 138, 107, 82, 143, 148, 'https://digidb.io/digimon-search/?request=297', 550, 85, 58, 33, 94, 85, 1430, 192, 156, 131, 192, 212),
	(190, 190, 298, 'Phantomon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot584.png', 940, 123, 99, 99, 163, 138, 'https://digidb.io/digimon-search/?request=298', 550, 60, 60, 55, 100, 80, 1330, 187, 138, 143, 227, 197),
	(192, 192, 143, 'BlueMeramon', 'Ultimate', 'Virus', 'Fire', '/assets/digimon/dot177.png', 1140, 109, 148, 94, 133, 119, 'https://digidb.io/digimon-search/?request=143', 650, 60, 90, 50, 75, 70, 1630, 158, 207, 138, 192, 168),
	(193, 193, 144, 'Vademon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot411.png', 1130, 165, 64, 94, 173, 97, 'https://digidb.io/digimon-search/?request=144', 600, 107, 25, 45, 110, 53, 1670, 224, 103, 143, 237, 141),
	(194, 194, 145, 'Whamon', 'Ultimate', 'Vaccine', 'Water', '/assets/digimon/dot021.png', 1680, 93, 123, 123, 124, 100, 'https://digidb.io/digimon-search/?request=145', 1050, 49, 70, 70, 75, 56, 2320, 137, 177, 177, 173, 144),
	(195, 195, 146, 'MagnaAngemon', 'Ultimate', 'Vaccine', 'Light', '/assets/digimon/dot101.png', 1180, 143, 98, 119, 163, 105, 'https://digidb.io/digimon-search/?request=146', 650, 85, 59, 70, 100, 61, 1720, 202, 137, 168, 227, 149),
	(197, 197, 300, 'Matadormon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot031.png', 1480, 94, 148, 93, 104, 144, 'https://digidb.io/digimon-search/?request=300', 850, 50, 95, 40, 55, 100, 2120, 138, 202, 147, 153, 188),
	(198, 198, 147, 'MachGaogamon', 'Ultimate', 'Data', 'Wind', '/assets/digimon/dot074.png', 1480, 89, 158, 89, 89, 158, 'https://digidb.io/digimon-search/?request=147', 900, 45, 95, 45, 50, 100, 2070, 133, 222, 133, 128, 217),
	(199, 199, 148, 'Mamemon', 'Ultimate', 'Data', 'Earth', '/assets/digimon/dot412.png', 1480, 113, 111, 153, 84, 97, 'https://digidb.io/digimon-search/?request=148', 850, 60, 67, 90, 40, 58, 2120, 167, 155, 217, 128, 136),
	(201, 201, 150, 'Megadramon', 'Ultimate', 'Virus', 'Wind', '/assets/digimon/dot301.png', 1430, 79, 158, 148, 69, 119, 'https://digidb.io/digimon-search/?request=150', 850, 40, 95, 90, 30, 70, 2020, 118, 222, 207, 108, 168),
	(202, 202, 151, 'WarGrowlmon', 'Ultimate', 'Virus', 'Fire', '/assets/digimon/dot134.png', 1430, 84, 178, 138, 87, 116, 'https://digidb.io/digimon-search/?request=151', 850, 45, 115, 80, 48, 67, 2020, 123, 242, 197, 126, 165),
	(203, 203, 152, 'MetalGreymon', 'Ultimate', 'Vaccine', 'Fire', '/assets/digimon/dot302.png', 1530, 84, 168, 148, 80, 113, 'https://digidb.io/digimon-search/?request=152', 950, 45, 105, 90, 41, 64, 2120, 123, 232, 207, 119, 162),
	(205, 205, 154, 'MetalTyrannomon', 'Ultimate', 'Virus', 'Electric', '/assets/digimon/dot364.png', 1090, 104, 130, 178, 118, 92, 'https://digidb.io/digimon-search/?request=154', 600, 55, 77, 115, 65, 53, 1580, 153, 184, 242, 172, 131),
	(206, 206, 155, 'MetalMamemon', 'Ultimate', 'Data', 'Electric', '/assets/digimon/dot413.png', 1040, 99, 123, 153, 128, 103, 'https://digidb.io/digimon-search/?request=155', 600, 50, 70, 90, 75, 64, 1480, 148, 177, 217, 182, 142),
	(207, 207, 156, 'Monzaemon', 'Ultimate', 'Vaccine', 'Neutral', '/assets/digimon/dot061.png', 1580, 93, 128, 118, 119, 100, 'https://digidb.io/digimon-search/?request=156', 950, 49, 75, 65, 70, 56, 2220, 137, 182, 172, 168, 144),
	(208, 208, 157, 'Crowmon', 'Ultimate', 'Vaccine', 'Wind', '/assets/digimon/dot721.png', 890, 128, 119, 104, 119, 173, 'https://digidb.io/digimon-search/?request=157', 450, 75, 70, 55, 70, 110, 1330, 182, 168, 153, 168, 237),
	(210, 210, 159, 'Lilamon', 'Ultimate', 'Data', 'Plant', '/assets/digimon/dot073.png', 1280, 148, 69, 104, 168, 114, 'https://digidb.io/digimon-search/?request=159', 750, 90, 30, 55, 105, 70, 1820, 207, 108, 153, 232, 158),
	(211, 211, 160, 'Rapidmon', 'Ultimate', 'Vaccine', 'Electric', '/assets/digimon/dot722.png', 1180, 113, 114, 109, 119, 143, 'https://digidb.io/digimon-search/?request=160', 650, 60, 65, 60, 70, 90, 1720, 167, 163, 158, 168, 197),
	(212, 212, 161, 'Lillymon', 'Ultimate', 'Data', 'Plant', '/assets/digimon/dot359.png', 890, 153, 74, 94, 163, 158, 'https://digidb.io/digimon-search/?request=161', 500, 90, 35, 50, 100, 100, 1280, 217, 113, 138, 227, 217),
	(214, 214, 163, 'LadyDevimon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot107.png', 890, 163, 99, 94, 158, 143, 'https://digidb.io/digimon-search/?request=163', 500, 100, 60, 50, 95, 85, 1280, 227, 138, 138, 222, 202),
	(215, 215, 164, 'WereGarurumon', 'Ultimate', 'Vaccine', 'Earth', '/assets/digimon/dot140.png', 1430, 89, 178, 89, 79, 153, 'https://digidb.io/digimon-search/?request=164', 850, 45, 115, 45, 40, 95, 2020, 133, 242, 133, 118, 212),
	(216, 216, 165, 'WereGarurumon (Blk)', 'Ultimate', 'Virus', 'Earth', '/assets/digimon/dot715.png', 1480, 79, 183, 104, 69, 148, 'https://digidb.io/digimon-search/?request=165', 900, 35, 120, 60, 30, 90, 2070, 123, 247, 148, 108, 207),
	(218, 218, 301, 'Arcadiamon Mega', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot066.png', 1410, 153, 196, 109, 119, 163, 'https://digidb.io/digimon-search/?request=301', 880, 100, 147, 60, 70, 110, 1950, 207, 245, 158, 168, 217),
	(219, 219, 167, 'Alphamon', 'Mega', 'Vaccine', 'Neutral', '/assets/digimon/dot416.png', 1390, 128, 158, 183, 158, 130, 'https://digidb.io/digimon-search/?request=167', 900, 79, 105, 120, 105, 91, 1880, 177, 212, 247, 212, 169),
	(220, 220, 168, 'UlforceVeedramon', 'Mega', 'Vaccine', 'Wind', '/assets/digimon/dot417.png', 1680, 129, 188, 109, 104, 198, 'https://digidb.io/digimon-search/?request=168', 1100, 85, 125, 65, 65, 140, 2270, 173, 252, 153, 143, 257),
	(221, 221, 169, 'Ebemon', 'Mega', 'Virus', 'Electric', '/assets/digimon/dot451.png', 1230, 178, 74, 114, 198, 129, 'https://digidb.io/digimon-search/?request=169', 700, 120, 35, 65, 135, 85, 1770, 237, 113, 163, 262, 173),
	(223, 223, 171, 'Imperialdramon FM', 'Mega', 'Free', 'Neutral', '/assets/digimon/dot419.png', 1780, 114, 198, 124, 114, 153, 'https://digidb.io/digimon-search/?request=171', 1200, 70, 135, 80, 75, 95, 2370, 158, 262, 168, 153, 212),
	(224, 224, 172, 'Vikemon', 'Mega', 'Free', 'Water', '/assets/digimon/dot346.png', 1780, 105, 158, 143, 129, 133, 'https://digidb.io/digimon-search/?request=172', 1150, 61, 105, 90, 80, 89, 2420, 149, 212, 197, 178, 177),
	(225, 225, 245, 'Valkyrimon', 'Mega', 'Free', 'Wind', '/assets/digimon/dot773.png', 1330, 139, 148, 129, 129, 168, 'https://digidb.io/digimon-search/?request=245', 750, 95, 85, 85, 90, 110, 1920, 183, 212, 173, 168, 227),
	(227, 227, 173, 'VenomMyotismon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot600.png', 1540, 120, 193, 104, 148, 138, 'https://digidb.io/digimon-search/?request=173', 1050, 71, 135, 60, 90, 89, 2030, 169, 252, 148, 207, 187),
	(228, 228, 174, 'WarGreymon', 'Mega', 'Vaccine', 'Fire', '/assets/digimon/dot027.png', 1630, 98, 193, 163, 99, 140, 'https://digidb.io/digimon-search/?request=174', 1050, 59, 130, 105, 60, 91, 2220, 137, 257, 222, 138, 189),
	(229, 229, 176, 'Ophanimon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot421.png', 840, 183, 104, 164, 193, 153, 'https://digidb.io/digimon-search/?request=176', 450, 120, 65, 120, 130, 95, 1230, 247, 143, 208, 257, 212),
	(231, 231, 303, 'KaiserGreymon', 'Mega', 'Free', 'Fire', '/assets/digimon/dot677.png', 1640, 99, 206, 151, 123, 139, 'https://digidb.io/digimon-search/?request=303', 1150, 50, 148, 107, 65, 90, 2130, 148, 265, 195, 182, 188),
	(232, 232, 178, 'ChaosGallantmon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot150.png', 1340, 139, 178, 139, 163, 144, 'https://digidb.io/digimon-search/?request=178', 850, 90, 120, 95, 105, 95, 1830, 188, 237, 183, 222, 193),
	(233, 233, 304, 'Chaosdramon', 'Mega', 'Virus', 'Electric', '/assets/digimon/dot422.png', 1630, 99, 203, 173, 109, 134, 'https://digidb.io/digimon-search/?request=304', 1050, 60, 140, 115, 70, 85, 2220, 138, 267, 232, 148, 183),
	(235, 235, 305, 'KingEtemon', 'Mega', 'Virus', 'Earth', '/assets/digimon/dot127.png', 1290, 114, 164, 163, 131, 125, 'https://digidb.io/digimon-search/?request=305', 800, 65, 111, 100, 78, 86, 1780, 163, 218, 227, 185, 164),
	(237, 237, 181, 'GranKuwagamon', 'Mega', 'Virus', 'Plant', '/assets/digimon/dot423.png', 1530, 88, 178, 178, 89, 140, 'https://digidb.io/digimon-search/?request=181', 950, 49, 115, 120, 50, 91, 2120, 127, 242, 237, 128, 189),
	(238, 238, 306, 'GranDracmon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot032.png', 1340, 140, 174, 114, 169, 151, 'https://digidb.io/digimon-search/?request=306', 900, 87, 125, 65, 120, 88, 1780, 194, 223, 163, 218, 215),
	(239, 239, 182, 'GroundLocomon', 'Mega', 'Data', 'Electric', '/assets/digimon/dot704.png', 1140, 114, 144, 213, 133, 128, 'https://digidb.io/digimon-search/?request=182', 650, 65, 91, 150, 80, 89, 1630, 163, 198, 277, 187, 167),
	(241, 241, 183, 'Craniamon', 'Mega', 'Vaccine', 'Earth', '/assets/digimon/dot734.png', 1630, 143, 124, 208, 134, 124, 'https://digidb.io/digimon-search/?request=183', 1000, 90, 80, 145, 90, 85, 2270, 197, 168, 272, 178, 163),
	(242, 242, 241, 'Kerpymon (Blk)', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot774.png', 1290, 188, 94, 94, 223, 153, 'https://digidb.io/digimon-search/?request=241', 900, 125, 55, 50, 160, 95, 1680, 252, 133, 138, 287, 212),
	(243, 243, 184, 'Kerpymon (Good)', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot735.png', 1290, 188, 94, 104, 208, 158, 'https://digidb.io/digimon-search/?request=184', 900, 125, 55, 60, 145, 100, 1680, 252, 133, 148, 272, 217),
	(245, 245, 185, 'SaberLeomon', 'Mega', 'Data', 'Wind', '/assets/digimon/dot424.png', 1680, 99, 228, 104, 84, 163, 'https://digidb.io/digimon-search/?request=185', 1100, 55, 165, 60, 45, 105, 2270, 143, 292, 148, 123, 222),
	(246, 246, 186, 'Sakuyamon', 'Mega', 'Data', 'Light', '/assets/digimon/dot425.png', 990, 178, 94, 114, 188, 173, 'https://digidb.io/digimon-search/?request=186', 600, 115, 55, 70, 125, 115, 1380, 242, 133, 158, 252, 232),
	(247, 247, 187, 'Jesmon', 'Mega', 'Data', 'Neutral', '/assets/digimon/dot749.png', 1480, 119, 198, 149, 114, 168, 'https://digidb.io/digimon-search/?request=187', 900, 75, 135, 105, 75, 110, 2070, 163, 262, 193, 153, 227),
	(248, 248, 188, 'ShineGreymon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot094.png', 1880, 114, 203, 109, 84, 158, 'https://digidb.io/digimon-search/?request=188', 1300, 70, 140, 65, 45, 100, 2470, 158, 267, 153, 123, 217),
	(250, 250, 189, 'Justimon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot737.png', 1530, 99, 193, 158, 99, 144, 'https://digidb.io/digimon-search/?request=189', 950, 60, 130, 100, 60, 95, 2120, 138, 257, 217, 138, 193),
	(251, 251, 190, 'Kentaurosmon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot086.png', 1140, 153, 139, 154, 154, 183, 'https://digidb.io/digimon-search/?request=190', 700, 100, 90, 105, 105, 120, 1580, 207, 188, 203, 203, 247),
	(252, 252, 309, 'Slayerdramon', 'Mega', 'Vaccine', 'Wind', '/assets/digimon/dot213.png', 1530, 148, 169, 129, 129, 153, 'https://digidb.io/digimon-search/?request=309', 1000, 95, 120, 80, 80, 100, 2070, 202, 218, 178, 178, 207),
	(254, 254, 192, 'MegaGargomon', 'Mega', 'Vaccine', 'Electric', '/assets/digimon/dot741.png', 1430, 132, 149, 139, 119, 144, 'https://digidb.io/digimon-search/?request=192', 900, 79, 100, 90, 70, 91, 1970, 186, 198, 188, 168, 198),
	(255, 255, 243, 'Darkdramon', 'Mega', 'Virus', 'Electric', '/assets/digimon/dot771.png', 1580, 94, 188, 148, 99, 139, 'https://digidb.io/digimon-search/?request=243', 1000, 55, 125, 90, 60, 90, 2170, 133, 252, 207, 138, 188),
	(256, 256, 193, 'TigerVespamon', 'Mega', 'Virus', 'Electric', '/assets/digimon/dot745.png', 1630, 104, 193, 114, 99, 173, 'https://digidb.io/digimon-search/?request=193', 1050, 60, 130, 70, 60, 115, 2220, 148, 257, 158, 138, 232),
	(258, 258, 310, 'TyrantKabuterimon', 'Mega', 'Virus', 'Plant', '/assets/digimon/dot128.png', 1530, 108, 174, 164, 123, 159, 'https://digidb.io/digimon-search/?request=310', 1000, 50, 135, 115, 60, 115, 2070, 167, 213, 213, 187, 203),
	(259, 259, 195, 'Dianamon', 'Mega', 'Data', 'Water', '/assets/digimon/dot733.png', 790, 178, 89, 154, 198, 183, 'https://digidb.io/digimon-search/?request=195', 400, 115, 50, 110, 135, 125, 1180, 242, 128, 198, 262, 242),
	(260, 260, 196, 'Diaboromon', 'Mega', 'Free', 'Dark', '/assets/digimon/dot632.png', 1680, 114, 243, 104, 79, 173, 'https://digidb.io/digimon-search/?request=196', 1100, 70, 180, 60, 40, 115, 2270, 158, 307, 148, 118, 232),
	(262, 262, 198, 'Gallantmon', 'Mega', 'Virus', 'Light', '/assets/digimon/dot126.png', 1480, 148, 149, 154, 149, 148, 'https://digidb.io/digimon-search/?request=198', 950, 95, 100, 105, 100, 95, 2020, 202, 198, 203, 198, 202),
	(263, 263, 199, 'Dynasmon', 'Mega', 'Data', 'Wind', '/assets/digimon/dot738.png', 1680, 114, 213, 129, 94, 178, 'https://digidb.io/digimon-search/?request=199', 1100, 70, 150, 85, 55, 120, 2270, 158, 277, 173, 133, 237),
	(264, 264, 311, 'Durandamon', 'Mega', 'Vaccine', 'Neutral', '/assets/digimon/dot700.png', 1660, 92, 193, 175, 95, 135, 'https://digidb.io/digimon-search/?request=311', 1080, 53, 130, 117, 56, 86, 2250, 131, 257, 234, 134, 184),
	(265, 265, 200, 'Leopardmon', 'Mega', 'Data', 'Light', '/assets/digimon/dot739.png', 990, 188, 124, 114, 183, 188, 'https://digidb.io/digimon-search/?request=200', 600, 125, 85, 70, 120, 130, 1380, 252, 163, 158, 247, 247),
	(267, 267, 312, 'Dorugoramon', 'Mega', 'Data', 'Dark', '/assets/digimon/dot019.png', 1640, 91, 225, 134, 88, 145, 'https://digidb.io/digimon-search/?request=312', 1150, 42, 167, 90, 30, 96, 2130, 140, 284, 178, 147, 194),
	(268, 268, 313, 'Neptunemon', 'Mega', 'Vaccine', 'Water', '/assets/digimon/dot075.png', 1440, 137, 158, 130, 173, 139, 'https://digidb.io/digimon-search/?request=313', 950, 88, 105, 67, 120, 100, 1930, 186, 212, 194, 227, 178),
	(269, 269, 202, 'HiAndromon', 'Mega', 'Vaccine', 'Electric', '/assets/digimon/dot426.png', 1190, 114, 153, 178, 138, 124, 'https://digidb.io/digimon-search/?request=202', 700, 65, 100, 115, 85, 85, 1680, 163, 207, 242, 192, 163),
	(271, 271, 203, 'Barbamon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot036.png', 1330, 184, 84, 129, 233, 133, 'https://digidb.io/digimon-search/?request=203', 800, 126, 45, 80, 170, 89, 1870, 243, 123, 178, 297, 177),
	(272, 272, 204, 'BanchoLeomon', 'Mega', 'Vaccine', 'Earth', '/assets/digimon/dot049.png', 1630, 84, 193, 188, 80, 138, 'https://digidb.io/digimon-search/?request=204', 1050, 45, 130, 130, 41, 89, 2220, 123, 257, 247, 119, 187),
	(273, 273, 205, 'Piedmon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot427.png', 890, 178, 129, 104, 183, 163, 'https://digidb.io/digimon-search/?request=205', 500, 115, 90, 60, 120, 105, 1280, 242, 168, 148, 247, 222),
	(275, 275, 207, 'PlatinumNumemon', 'Mega', 'Virus', 'Neutral', '/assets/digimon/dot069.png', 450, 132, 99, 999, 50, 144, 'https://digidb.io/digimon-search/?request=207', 10, 79, 50, 999, 1, 81, 890, 186, 148, 999, 99, 208),
	(276, 276, 208, 'BlackWarGreymon', 'Mega', 'Virus', 'Fire', '/assets/digimon/dot175.png', 1730, 93, 183, 178, 89, 140, 'https://digidb.io/digimon-search/?request=208', 1150, 54, 120, 120, 50, 91, 2320, 132, 247, 237, 128, 189),
	(277, 277, 209, 'PrinceMamemon', 'Mega', 'Data', 'Neutral', '/assets/digimon/dot429.png', 1630, 137, 104, 173, 109, 130, 'https://digidb.io/digimon-search/?request=209', 1000, 84, 60, 110, 65, 91, 2270, 191, 148, 237, 153, 169),
	(279, 279, 210, 'Plesiomon', 'Mega', 'Data', 'Water', '/assets/digimon/dot450.png', 1680, 153, 74, 114, 188, 129, 'https://digidb.io/digimon-search/?request=210', 1150, 95, 35, 65, 125, 85, 2220, 212, 113, 163, 252, 173),
	(280, 280, 211, 'HerculesKabuterimon', 'Mega', 'Vaccine', 'Plant', '/assets/digimon/dot306.png', 1680, 128, 114, 168, 124, 124, 'https://digidb.io/digimon-search/?request=211', 1050, 75, 70, 105, 80, 85, 2320, 182, 158, 232, 168, 163),
	(283, 283, 213, 'Belphemon SM', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot439.png', 1730, 178, 89, 114, 203, 139, 'https://digidb.io/digimon-search/?request=213', 1200, 120, 50, 65, 140, 95, 2270, 237, 128, 163, 267, 183),
	(284, 284, 214, 'Hououmon', 'Mega', 'Vaccine', 'Fire', '/assets/digimon/dot310.png', 1390, 173, 84, 99, 193, 158, 'https://digidb.io/digimon-search/?request=214', 1000, 110, 45, 55, 130, 100, 1780, 237, 123, 143, 257, 217),
	(285, 285, 215, 'Magnadramon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot453.png', 1880, 168, 89, 124, 183, 129, 'https://digidb.io/digimon-search/?request=215', 1350, 110, 50, 75, 120, 85, 2420, 227, 128, 173, 247, 173),
	(286, 286, 216, 'Boltmon', 'Mega', 'Data', 'Electric', '/assets/digimon/dot431.png', 1580, 83, 198, 163, 84, 140, 'https://digidb.io/digimon-search/?request=216', 1000, 44, 135, 105, 45, 91, 2170, 122, 262, 222, 123, 189),
	(288, 288, 317, 'MagnaGarurumon (SV)', 'Mega', 'Free', 'Light', '/assets/digimon/dot675.png', 1020, 138, 163, 107, 119, 218, 'https://digidb.io/digimon-search/?request=317', 580, 85, 114, 58, 70, 155, 1460, 192, 212, 156, 168, 282),
	(289, 289, 217, 'Mastemon', 'Mega', 'Vaccine', 'Neutral', '/assets/digimon/dot748.png', 1340, 144, 173, 134, 173, 149, 'https://digidb.io/digimon-search/?request=217', 850, 95, 115, 90, 115, 100, 1830, 193, 232, 178, 232, 198),
	(290, 290, 218, 'MarineAngemon', 'Mega', 'Vaccine', 'Water', '/assets/digimon/dot024.png', 1190, 198, 64, 89, 203, 153, 'https://digidb.io/digimon-search/?request=218', 800, 135, 25, 45, 140, 95, 1580, 262, 103, 133, 267, 212),
	(292, 292, 220, 'MirageGaogamon', 'Mega', 'Data', 'Wind', '/assets/digimon/dot095.png', 1480, 114, 183, 114, 109, 178, 'https://digidb.io/digimon-search/?request=220', 900, 70, 120, 70, 70, 120, 2070, 158, 247, 158, 148, 237),
	(293, 293, 247, 'MirageGaogamon BM', 'Mega', 'Data', 'Light', '/assets/digimon/dot777.png', 1440, 124, 178, 104, 158, 174, 'https://digidb.io/digimon-search/?request=247', 950, 75, 120, 60, 100, 125, 1930, 173, 237, 148, 217, 223),
	(294, 294, 221, 'Machinedramon', 'Mega', 'Virus', 'Electric', '/assets/digimon/dot385.png', 1240, 114, 173, 183, 128, 124, 'https://digidb.io/digimon-search/?request=221', 750, 65, 120, 120, 75, 85, 1730, 163, 227, 247, 182, 163),
	(296, 296, 222, 'MetalEtemon', 'Mega', 'Virus', 'Earth', '/assets/digimon/dot312.png', 1630, 128, 134, 188, 89, 124, 'https://digidb.io/digimon-search/?request=222', 1000, 75, 90, 125, 45, 85, 2270, 182, 178, 252, 133, 163),
	(297, 297, 223, 'MetalGarurumon', 'Mega', 'Data', 'Water', '/assets/digimon/dot135.png', 1140, 143, 154, 129, 129, 178, 'https://digidb.io/digimon-search/?request=223', 700, 90, 105, 80, 80, 115, 1580, 197, 203, 178, 178, 242),
	(298, 298, 224, 'MetalGarurumon (Blk)', 'Mega', 'Virus', 'Electric', '/assets/digimon/dot182.png', 1190, 128, 163, 173, 133, 130, 'https://digidb.io/digimon-search/?request=224', 700, 79, 110, 110, 80, 91, 1680, 177, 217, 237, 187, 169),
	(300, 300, 319, 'Merukimon', 'Mega', 'Virus', 'Wind', '/assets/digimon/dot080.png', 1320, 115, 178, 138, 141, 177, 'https://digidb.io/digimon-search/?request=319', 830, 66, 125, 75, 88, 138, 1810, 164, 232, 202, 195, 216),
	(301, 301, 226, 'RustTyranomon', 'Mega', 'Virus', 'Electric', '/assets/digimon/dot383.png', 1680, 83, 218, 163, 74, 140, 'https://digidb.io/digimon-search/?request=226', 1100, 44, 155, 105, 35, 91, 2270, 122, 282, 222, 113, 189),
	(302, 302, 227, 'Leviamon', 'Mega', 'Virus', 'Water', '/assets/digimon/dot037.png', 1730, 120, 168, 158, 144, 133, 'https://digidb.io/digimon-search/?request=227', 1100, 76, 115, 105, 95, 89, 2370, 164, 222, 212, 193, 177),
	(303, 303, 228, 'Lilithmon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot034.png', 940, 203, 99, 104, 223, 173, 'https://digidb.io/digimon-search/?request=228', 550, 140, 60, 60, 160, 115, 1330, 267, 138, 148, 287, 232),
	(305, 305, 248, 'Ravemon BM', 'Mega', 'Vaccine', 'Wind', '/assets/digimon/dot778.png', 1040, 133, 149, 139, 144, 213, 'https://digidb.io/digimon-search/?request=248', 600, 80, 100, 90, 95, 150, 1480, 187, 198, 188, 193, 277),
	(306, 306, 230, 'Crusadermon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot703.png', 1240, 153, 144, 139, 144, 193, 'https://digidb.io/digimon-search/?request=230', 800, 100, 95, 90, 95, 130, 1680, 207, 193, 188, 193, 257),
	(307, 307, 231, 'Rosemon', 'Mega', 'Data', 'Plant', '/assets/digimon/dot057.png', 1330, 147, 144, 129, 149, 144, 'https://digidb.io/digimon-search/?request=231', 800, 94, 95, 80, 100, 91, 1870, 201, 193, 178, 198, 198),
	(309, 309, 232, 'Lotosmon', 'Mega', 'Data', 'Plant', '/assets/digimon/dot742.png', 940, 188, 74, 109, 213, 168, 'https://digidb.io/digimon-search/?request=232', 550, 125, 35, 65, 150, 110, 1330, 252, 113, 153, 277, 227),
	(310, 310, 320, 'Armageddemon', 'Ultra', 'Free', 'Dark', '/assets/digimon/dot106.png', 1760, 114, 255, 133, 84, 164, 'https://digidb.io/digimon-search/?request=320', 1180, 75, 192, 75, 45, 115, 2350, 153, 319, 192, 123, 213),
	(311, 311, 321, 'Arcadiamon Ultra', 'Ultra', 'Virus', 'Dark', '/assets/digimon/dot067.png', 1510, 158, 204, 109, 134, 170, 'https://digidb.io/digimon-search/?request=321', 980, 105, 155, 60, 85, 117, 2050, 212, 253, 158, 183, 224),
	(313, 313, 233, 'Imperialdramon PM', 'Ultra', 'Vaccine', 'Light', '/assets/digimon/dot420.png', 1530, 158, 154, 154, 154, 153, 'https://digidb.io/digimon-search/?request=233', 1000, 105, 105, 105, 105, 100, 2070, 212, 203, 203, 203, 207),
	(314, 314, 175, 'Examon', 'Ultra', 'Data', 'Wind', '/assets/digimon/dot215.png', 1730, 148, 179, 139, 134, 153, 'https://digidb.io/digimon-search/?request=175', 1200, 95, 130, 90, 85, 100, 2270, 202, 228, 188, 183, 207),
	(315, 315, 234, 'Omnimon', 'Ultra', 'Vaccine', 'Light', '/assets/digimon/dot088.png', 1680, 104, 208, 168, 134, 144, 'https://digidb.io/digimon-search/?request=234', 1100, 65, 145, 110, 95, 95, 2270, 143, 272, 227, 173, 193),
	(317, 317, 244, 'Chaosmon', 'Ultra', 'Vaccine', 'Neutral', '/assets/digimon/dot772.png', 1080, 129, 318, 94, 89, 188, 'https://digidb.io/digimon-search/?request=244', 500, 85, 255, 50, 50, 130, 1670, 173, 382, 138, 128, 247),
	(318, 318, 323, 'Chaosmon VA', 'Ultra', 'Vaccine', 'Light', '/assets/digimon/dot118.png', 790, 138, 254, 84, 204, 168, 'https://digidb.io/digimon-search/?request=323', 350, 85, 205, 35, 155, 105, 1230, 192, 303, 133, 253, 232),
	(319, 319, 324, 'Susanomon', 'Ultra', 'Vaccine', 'Light', '/assets/digimon/dot104.png', 1630, 129, 183, 158, 149, 149, 'https://digidb.io/digimon-search/?request=324', 1050, 90, 120, 100, 110, 100, 2220, 168, 247, 217, 188, 198),
	(320, 320, 325, 'Gallantmon CM', 'Ultra', 'Virus', 'Light', '/assets/digimon/dot105.png', 1480, 139, 203, 124, 139, 173, 'https://digidb.io/digimon-search/?request=325', 900, 95, 140, 80, 100, 115, 2070, 183, 267, 168, 178, 232),
	(322, 322, 237, 'Lucemon SM', 'Ultra', 'Virus', 'Dark', '/assets/digimon/dot435.png', 1490, 173, 89, 124, 233, 158, 'https://digidb.io/digimon-search/?request=237', 1100, 110, 50, 80, 170, 100, 1880, 237, 128, 168, 297, 217),
	(323, 323, 238, 'Flamedramon', 'Armor', 'Free', 'Fire', '/assets/digimon/dot716.png', 1130, 93, 119, 99, 89, 138, 'https://digidb.io/digimon-search/?request=238', 600, 40, 70, 50, 40, 85, 1670, 147, 168, 148, 138, 192),
	(324, 324, 239, 'Magnamon', 'Armor', 'Free', 'Earth', '/assets/digimon/dot382.png', 1240, 124, 168, 208, 148, 124, 'https://digidb.io/digimon-search/?request=239', 750, 75, 115, 145, 95, 85, 1730, 173, 222, 272, 202, 163),
	(326, 326, 326, 'Shoutmon', 'None', 'Free', 'Fire', '/assets/digimon/dot682.png', 1030, 62, 128, 101, 55, 87, 'https://digidb.io/digimon-search/?request=326', 450, 23, 65, 43, 16, 38, 1620, 101, 192, 160, 94, 136),
	(327, 327, 327, 'OmniShoutmon', 'None', 'Free', 'Fire', '/assets/digimon/dot683.png', 1510, 141, 166, 144, 114, 165, 'https://digidb.io/digimon-search/?request=327', 980, 88, 117, 95, 65, 112, 2050, 195, 215, 193, 163, 219),
	(1, 1, 1, 'Kuramon', 'Baby', 'Free', 'Neutral', '/assets/digimon/dot629.png', 590, 77, 79, 69, 68, 95, 'https://digidb.io/digimon-search/?request=1', 150, 24, 30, 20, 19, 32, 1030, 131, 128, 118, 117, 159),
	(4, 4, 4, 'Botamon', 'Baby', 'Free', 'Neutral', '/assets/digimon/dot317.png', 690, 68, 77, 95, 76, 61, 'https://digidb.io/digimon-search/?request=4', 200, 19, 24, 32, 23, 22, 1180, 117, 131, 159, 130, 100),
	(8, 8, 7, 'Tanemon', 'In-Training', 'Free', 'Plant', '/assets/digimon/dot512.png', 1030, 64, 85, 82, 73, 69, 'https://digidb.io/digimon-search/?request=7', 400, 20, 32, 29, 24, 25, 1670, 108, 139, 136, 122, 113),
	(13, 13, 12, 'Pagumon', 'In-Training', 'Free', 'Dark', '/assets/digimon/dot567.png', 550, 103, 60, 63, 102, 93, 'https://digidb.io/digimon-search/?request=12', 160, 40, 21, 19, 39, 35, 940, 167, 99, 107, 166, 152),
	(17, 17, 16, 'Wanyamon', 'In-Training', 'Free', 'Wind', '/assets/digimon/dot321.png', 830, 82, 79, 75, 75, 82, 'https://digidb.io/digimon-search/?request=16', 300, 29, 30, 26, 26, 29, 1370, 136, 128, 124, 124, 136),
	(21, 21, 19, 'Armadillomon', 'Rookie', 'Free', 'Earth', '/assets/digimon/dot707.png', 1160, 85, 67, 111, 65, 72, 'https://digidb.io/digimon-search/?request=19', 530, 32, 23, 48, 21, 33, 1800, 139, 111, 175, 109, 111),
	(25, 25, 23, 'Gaomon', 'Rookie', 'Data', 'Neutral', '/assets/digimon/dot055.png', 1030, 69, 118, 74, 66, 101, 'https://digidb.io/digimon-search/?request=23', 450, 25, 55, 30, 27, 43, 1620, 113, 182, 118, 105, 160),
	(29, 29, 27, 'Guilmon', 'Rookie', 'Virus', 'Fire', '/assets/digimon/dot090.png', 1050, 69, 133, 74, 54, 101, 'https://digidb.io/digimon-search/?request=27', 470, 25, 70, 30, 15, 43, 1640, 113, 197, 118, 93, 160),
	(34, 34, 32, 'Gomamon', 'Rookie', 'Vaccine', 'Water', '/assets/digimon/dot343.png', 1160, 69, 93, 93, 81, 79, 'https://digidb.io/digimon-search/?request=32', 530, 25, 40, 40, 32, 35, 1800, 113, 147, 147, 130, 123),
	(38, 38, 253, 'Chuumon', 'Rookie', 'Virus', 'Earth', '/assets/digimon/dot020.png', 700, 91, 87, 73, 85, 111, 'https://digidb.io/digimon-search/?request=253', 260, 38, 38, 24, 36, 48, 1140, 145, 136, 122, 134, 175),
	(42, 42, 254, 'Dracmon', 'Rookie', 'Virus', 'Dark', '/assets/digimon/dot457.png', 870, 81, 108, 88, 83, 84, 'https://digidb.io/digimon-search/?request=254', 380, 32, 55, 25, 30, 45, 1360, 130, 162, 152, 137, 123),
	(47, 47, 41, 'Hackmon', 'Rookie', 'Data', 'Fire', '/assets/digimon/dot687.png', 1030, 59, 118, 108, 63, 85, 'https://digidb.io/digimon-search/?request=41', 450, 20, 55, 50, 24, 36, 1620, 98, 182, 167, 102, 134),
	(48, 48, 42, 'Palmon', 'Rookie', 'Data', 'Plant', '/assets/digimon/dot348.png', 1140, 65, 103, 90, 80, 79, 'https://digidb.io/digimon-search/?request=42', 510, 21, 50, 37, 31, 35, 1780, 109, 157, 144, 129, 123),
	(49, 49, 43, 'DemiDevimon', 'Rookie', 'Virus', 'Dark', '/assets/digimon/dot097.png', 650, 87, 89, 76, 89, 111, 'https://digidb.io/digimon-search/?request=43', 210, 34, 40, 27, 40, 48, 1090, 141, 138, 125, 138, 175),
	(53, 53, 46, 'Veemon', 'Rookie', 'Free', 'Neutral', '/assets/digimon/dot114.png', 1040, 74, 130, 74, 53, 101, 'https://digidb.io/digimon-search/?request=46', 460, 30, 67, 30, 14, 43, 1630, 118, 194, 118, 92, 160),
	(58, 58, 258, 'Monodramon', 'Rookie', 'Vaccine', 'Neutral', '/assets/digimon/dot458.png', 1040, 54, 128, 100, 51, 79, 'https://digidb.io/digimon-search/?request=258', 460, 15, 65, 42, 12, 30, 1630, 93, 192, 159, 90, 128),
	(62, 62, 52, 'Renamon', 'Rookie', 'Data', 'Plant', '/assets/digimon/dot391.png', 930, 93, 89, 74, 89, 93, 'https://digidb.io/digimon-search/?request=52', 400, 40, 40, 25, 40, 40, 1470, 147, 138, 123, 138, 147),
	(66, 66, 260, 'Icemon', 'Champion', 'Data', 'Water', '/assets/digimon/dot758.png', 940, 87, 108, 132, 106, 84, 'https://digidb.io/digimon-search/?request=260', 450, 38, 55, 69, 53, 45, 1430, 136, 162, 196, 160, 123),
	(70, 70, 57, 'Ankylomon', 'Champion', 'Free', 'Earth', '/assets/digimon/dot711.png', 1330, 98, 89, 133, 79, 79, 'https://digidb.io/digimon-search/?request=57', 700, 45, 45, 70, 35, 40, 1970, 152, 133, 197, 123, 118),
	(75, 75, 264, 'Airdramon', 'Champion', 'Vaccine', 'Wind', '/assets/digimon/dot011.png', 1040, 77, 126, 100, 86, 118, 'https://digidb.io/digimon-search/?request=264', 460, 38, 63, 42, 47, 69, 1630, 116, 190, 159, 125, 167),
	(79, 79, 64, 'Guardromon', 'Champion', 'Virus', 'Electric', '/assets/digimon/dot341.png', 990, 84, 108, 138, 103, 79, 'https://digidb.io/digimon-search/?request=64', 500, 35, 55, 75, 50, 40, 1480, 133, 162, 202, 157, 118),
	(83, 83, 67, 'ShellNumemon', 'Champion', 'Virus', 'Water', '/assets/digimon/dot455.png', 1280, 103, 79, 148, 74, 79, 'https://digidb.io/digimon-search/?request=67', 650, 50, 35, 85, 30, 40, 1920, 157, 123, 212, 118, 118),
	(88, 88, 72, 'Growlmon', 'Champion', 'Virus', 'Fire', '/assets/digimon/dot078.png', 1180, 79, 143, 113, 69, 109, 'https://digidb.io/digimon-search/?request=72', 600, 40, 80, 55, 30, 60, 1770, 118, 207, 172, 108, 158),
	(92, 92, 76, 'Clockmon', 'Champion', 'Data', 'Electric', '/assets/digimon/dot398.png', 1030, 118, 64, 101, 133, 92, 'https://digidb.io/digimon-search/?request=76', 500, 60, 25, 52, 70, 48, 1570, 177, 103, 150, 197, 136),
	(95, 95, 79, 'Geremon', 'Champion', 'Virus', 'Electric', '/assets/digimon/dot729.png', 1380, 99, 104, 128, 64, 78, 'https://digidb.io/digimon-search/?request=79', 750, 46, 60, 65, 20, 39, 2020, 153, 148, 192, 108, 117),
	(329, 329, 338, 'Ginryumon', 'Champion', 'Vaccine', 'Neutral', '/assets/digimon/dot191.png', 970, 86, 135, 114, 71, 118, 'https://digidb.io/digimon-search/?request=338', 390, 42, 72, 70, 32, 60, 1560, 130, 199, 158, 110, 177),
	(330, 330, 339, 'Hisyaryumon', 'Ultimate', 'Vaccine', 'Neutral', '/assets/digimon/dot192.png', 1200, 89, 183, 157, 74, 123, 'https://digidb.io/digimon-search/?request=339', 620, 45, 120, 113, 35, 65, 1790, 133, 247, 201, 113, 182),
	(331, 331, 340, 'Ouryumon', 'Mega', 'Vaccine', 'Neutral', '/assets/digimon/dot193.png', 1350, 104, 221, 179, 84, 158, 'https://digidb.io/digimon-search/?request=340', 770, 60, 158, 135, 45, 100, 1940, 148, 285, 223, 123, 217),
	(333, 333, 328, 'Sistermon Blanc', 'Rookie', 'Vaccine', 'Light', '/assets/digimon/dot781.png', 880, 105, 53, 72, 116, 82, 'https://digidb.io/digimon-search/?request=328', 350, 47, 14, 23, 53, 38, 1420, 164, 92, 121, 180, 126),
	(334, 334, 329, 'Sistermon B (Awake.)', 'Rookie', 'Vaccine', 'Light', '/assets/digimon/dot782.png', 1310, 175, 72, 112, 191, 165, 'https://digidb.io/digimon-search/?request=329', 920, 112, 33, 68, 128, 107, 1700, 239, 111, 156, 255, 224),
	(335, 335, 330, 'Sistermon Ciel', 'Champion', 'Virus', 'Light', '/assets/digimon/dot783.png', 840, 111, 96, 87, 95, 139, 'https://digidb.io/digimon-search/?request=330', 400, 58, 47, 38, 46, 76, 1280, 165, 145, 136, 144, 203),
	(337, 337, 332, 'Alphamon NX', 'Mega', 'Vaccine', 'Neutral', '/assets/digimon/dot901.png', 980, 104, 109, 114, 109, 116, 'https://digidb.io/digimon-search/?request=332', 300, 36, 38, 43, 38, 45, 1670, 173, 180, 185, 180, 187),
	(338, 338, 333, 'Crusadermon NX', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot902.png', 1030, 100, 118, 99, 109, 121, 'https://digidb.io/digimon-search/?request=333', 350, 32, 47, 28, 38, 50, 1720, 169, 189, 170, 180, 192),
	(339, 339, 334, 'Leopardmon NX', 'Mega', 'Data', 'Light', '/assets/digimon/dot903.png', 960, 109, 112, 91, 116, 126, 'https://digidb.io/digimon-search/?request=334', 280, 41, 41, 20, 45, 55, 1650, 178, 183, 162, 187, 197),
	(340, 340, 335, 'Omnimon NX', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot904.png', 1010, 98, 116, 111, 111, 113, 'https://digidb.io/digimon-search/?request=335', 330, 30, 45, 40, 40, 42, 1700, 167, 187, 182, 182, 184),
	(390, 390, 390, 'Diaboromon X', 'Mega', 'Free', 'Dark', '/assets/animated_digimon/Diaboromon X/idle1.png', 1848, 125, 267, 114, 87, 190, '', 1210, 77, 198, 66, 44, 126, 2497, 174, 338, 163, 130, 255),
	(96, 96, 266, 'Coredramon (Blue)', 'Champion', 'Vaccine', 'Wind', '/assets/digimon/dot218.png', 1230, 76, 151, 103, 69, 109, 'https://digidb.io/digimon-search/?request=266', 650, 37, 88, 45, 30, 60, 1820, 115, 215, 162, 108, 158),
	(100, 100, 81, 'Cyclonemon', 'Champion', 'Virus', 'Earth', '/assets/digimon/dot452.png', 940, 84, 131, 128, 93, 81, 'https://digidb.io/digimon-search/?request=81', 450, 35, 78, 65, 40, 42, 1430, 133, 185, 192, 147, 120),
	(105, 105, 84, 'GeoGreymon', 'Champion', 'Vaccine', 'Fire', '/assets/digimon/dot054.png', 1330, 89, 143, 84, 64, 118, 'https://digidb.io/digimon-search/?request=84', 750, 45, 80, 40, 25, 60, 1920, 133, 207, 128, 103, 177),
	(109, 109, 271, 'Strikedramon', 'Champion', 'Vaccine', 'Earth', '/assets/digimon/dot016.png', 1150, 72, 151, 87, 68, 118, 'https://digidb.io/digimon-search/?request=271', 570, 28, 88, 43, 29, 60, 1740, 116, 215, 131, 107, 177),
	(113, 113, 273, 'MudFrigimon', 'Champion', 'Data', 'Earth', '/assets/digimon/dot759.png', 1190, 96, 101, 99, 97, 99, 'https://digidb.io/digimon-search/?request=273', 660, 43, 52, 50, 48, 46, 1730, 150, 150, 148, 146, 153),
	(118, 118, 93, 'Togemon', 'Champion', 'Data', 'Plant', '/assets/digimon/dot349.png', 1330, 84, 108, 113, 93, 90, 'https://digidb.io/digimon-search/?request=93', 700, 40, 55, 60, 44, 46, 1970, 128, 162, 167, 142, 134),
	(122, 122, 97, 'Birdramon', 'Champion', 'Vaccine', 'Fire', '/assets/digimon/dot308.png', 940, 113, 94, 84, 109, 128, 'https://digidb.io/digimon-search/?request=97', 500, 60, 45, 35, 60, 65, 1380, 167, 143, 133, 158, 192),
	(126, 126, 276, 'Hudiemon', 'Champion', 'Free', 'Plant', '/assets/digimon/dot022.png', 980, 111, 109, 85, 113, 115, 'https://digidb.io/digimon-search/?request=276', 450, 58, 60, 36, 64, 62, 1520, 165, 158, 134, 162, 169),
	(130, 130, 103, 'Peckmon', 'Champion', 'Vaccine', 'Wind', '/assets/digimon/dot702.png', 790, 113, 104, 84, 94, 148, 'https://digidb.io/digimon-search/?request=103', 350, 60, 55, 35, 45, 85, 1230, 167, 153, 133, 143, 212),
	(134, 134, 278, 'Unimon', 'Champion', 'Vaccine', 'Wind', '/assets/digimon/dot548.png', 790, 123, 84, 79, 128, 118, 'https://digidb.io/digimon-search/?request=278', 400, 60, 45, 35, 65, 60, 1180, 187, 123, 123, 192, 177),
	(139, 139, 107, 'Reppamon', 'Champion', 'Vaccine', 'Light', '/assets/digimon/dot077.png', 790, 118, 94, 99, 99, 143, 'https://digidb.io/digimon-search/?request=107', 350, 65, 45, 50, 50, 80, 1230, 172, 143, 148, 148, 207),
	(142, 142, 282, 'Arcadiamon Ultimate', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot065.png', 1130, 120, 157, 99, 119, 138, 'https://digidb.io/digimon-search/?request=282', 600, 67, 108, 50, 70, 85, 1670, 174, 206, 148, 168, 192),
	(146, 146, 113, 'Infermon', 'Ultimate', 'Free', 'Dark', '/assets/digimon/dot627.png', 1330, 99, 198, 89, 74, 153, 'https://digidb.io/digimon-search/?request=113', 750, 55, 135, 45, 35, 95, 1920, 143, 262, 133, 113, 212),
	(150, 150, 115, 'AeroVeedramon', 'Ultimate', 'Vaccine', 'Wind', '/assets/digimon/dot400.png', 1430, 94, 163, 99, 94, 153, 'https://digidb.io/digimon-search/?request=115', 850, 50, 100, 55, 55, 95, 2020, 138, 227, 143, 133, 212),
	(154, 154, 119, 'Garudamon', 'Ultimate', 'Vaccine', 'Fire', '/assets/digimon/dot309.png', 1040, 123, 124, 109, 129, 143, 'https://digidb.io/digimon-search/?request=119', 600, 70, 75, 60, 80, 80, 1480, 177, 173, 158, 178, 207),
	(158, 158, 121, 'CannonBeemon', 'Ultimate', 'Virus', 'Electric', '/assets/digimon/dot727.png', 990, 123, 129, 139, 99, 143, 'https://digidb.io/digimon-search/?request=121', 550, 70, 80, 90, 50, 80, 1430, 177, 178, 188, 148, 207),
	(163, 163, 123, 'Cyberdramon', 'Ultimate', 'Vaccine', 'Dark', '/assets/digimon/dot719.png', 1480, 81, 173, 143, 79, 122, 'https://digidb.io/digimon-search/?request=123', 900, 42, 110, 85, 40, 73, 2070, 120, 237, 202, 118, 171),
	(167, 167, 127, 'SuperStarmon', 'Ultimate', 'Data', 'Light', '/assets/digimon/dot079.png', 1180, 128, 122, 134, 109, 120, 'https://digidb.io/digimon-search/?request=127', 650, 75, 73, 85, 60, 67, 1720, 182, 171, 183, 158, 174),
	(172, 172, 130, 'Taomon', 'Ultimate', 'Data', 'Dark', '/assets/digimon/dot405.png', 990, 148, 69, 104, 173, 138, 'https://digidb.io/digimon-search/?request=130', 600, 85, 30, 60, 110, 80, 1380, 212, 108, 148, 237, 197),
	(176, 176, 132, 'Digitamamon', 'Ultimate', 'Data', 'Neutral', '/assets/digimon/dot374.png', 1380, 89, 128, 148, 111, 102, 'https://digidb.io/digimon-search/?request=132', 750, 45, 75, 95, 62, 58, 2020, 133, 182, 202, 160, 146),
	(180, 180, 295, 'Triceramon', 'Ultimate', 'Data', 'Earth', '/assets/digimon/dot033.png', 1180, 89, 148, 168, 94, 99, 'https://digidb.io/digimon-search/?request=295', 600, 50, 85, 110, 55, 50, 1770, 128, 212, 227, 133, 148),
	(184, 184, 138, 'Paildramon', 'Ultimate', 'Free', 'Neutral', '/assets/digimon/dot408.png', 1280, 133, 139, 124, 109, 128, 'https://digidb.io/digimon-search/?request=138', 750, 80, 90, 75, 60, 75, 1820, 187, 188, 173, 158, 182),
	(188, 188, 141, 'Piximon', 'Ultimate', 'Data', 'Light', '/assets/digimon/dot410.png', 990, 123, 104, 104, 134, 153, 'https://digidb.io/digimon-search/?request=141', 550, 70, 55, 55, 85, 90, 1430, 177, 153, 153, 183, 217),
	(191, 191, 142, 'BlackKingNumemon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot753.png', 1580, 113, 89, 168, 89, 89, 'https://digidb.io/digimon-search/?request=142', 950, 60, 45, 105, 45, 50, 2220, 167, 133, 232, 133, 128),
	(196, 196, 299, 'Volcanomon', 'Ultimate', 'Data', 'Fire', '/assets/digimon/dot059.png', 1530, 82, 158, 119, 69, 125, 'https://digidb.io/digimon-search/?request=299', 950, 38, 95, 75, 30, 67, 2120, 126, 222, 163, 108, 184),
	(200, 200, 149, 'MegaSeadramon', 'Ultimate', 'Data', 'Water', '/assets/digimon/dot132.png', 1330, 138, 86, 114, 158, 102, 'https://digidb.io/digimon-search/?request=149', 800, 80, 47, 65, 95, 58, 1870, 197, 125, 163, 222, 146),
	(204, 204, 153, 'MetalGreymon (Blue)', 'Ultimate', 'Virus', 'Fire', '/assets/digimon/dot327.png', 1670, 84, 173, 143, 69, 110, 'https://digidb.io/digimon-search/?request=153', 1090, 45, 110, 85, 30, 61, 2260, 123, 237, 202, 108, 159),
	(209, 209, 158, 'RizeGreymon', 'Ultimate', 'Vaccine', 'Fire', '/assets/digimon/dot071.png', 1530, 94, 178, 109, 69, 143, 'https://digidb.io/digimon-search/?request=158', 950, 50, 115, 65, 30, 85, 2120, 138, 242, 153, 108, 202),
	(213, 213, 162, 'Lucemon FM', 'Ultimate', 'Virus', 'Neutral', '/assets/digimon/dot039.png', 1390, 139, 163, 114, 203, 139, 'https://digidb.io/digimon-search/?request=162', 900, 90, 105, 70, 145, 90, 1880, 188, 222, 158, 262, 188),
	(217, 217, 166, 'Wisemon', 'Ultimate', 'Virus', 'Dark', '/assets/digimon/dot726.png', 790, 168, 69, 84, 198, 133, 'https://digidb.io/digimon-search/?request=166', 400, 105, 30, 40, 135, 75, 1180, 232, 108, 128, 262, 192),
	(222, 222, 170, 'Imperialdramon DM', 'Mega', 'Free', 'Fire', '/assets/digimon/dot732.png', 1730, 143, 139, 139, 139, 148, 'https://digidb.io/digimon-search/?request=170', 1200, 90, 90, 90, 90, 95, 2270, 197, 188, 188, 188, 202),
	(226, 226, 302, 'Varodurumon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot117.png', 1580, 164, 103, 94, 189, 173, 'https://digidb.io/digimon-search/?request=302', 1000, 120, 40, 50, 150, 115, 2170, 208, 167, 138, 228, 232),
	(230, 230, 177, 'Gaiomon', 'Mega', 'Virus', 'Fire', '/assets/digimon/dot744.png', 1630, 99, 203, 129, 94, 158, 'https://digidb.io/digimon-search/?request=177', 1050, 55, 140, 85, 55, 100, 2220, 143, 267, 173, 133, 217),
	(234, 234, 179, 'Gankoomon', 'Mega', 'Data', 'Fire', '/assets/digimon/dot688.png', 2080, 90, 188, 163, 109, 138, 'https://digidb.io/digimon-search/?request=179', 1500, 51, 125, 105, 70, 89, 2670, 129, 252, 222, 148, 187),
	(236, 236, 180, 'Kuzuhamon', 'Mega', 'Data', 'Dark', '/assets/digimon/dot754.png', 1380, 163, 84, 129, 193, 139, 'https://digidb.io/digimon-search/?request=180', 850, 105, 45, 80, 130, 95, 1920, 222, 123, 178, 257, 183),
	(240, 240, 307, 'Gryphonmon', 'Mega', 'Data', 'Wind', '/assets/digimon/dot083.png', 1260, 129, 164, 104, 130, 173, 'https://digidb.io/digimon-search/?request=307', 680, 85, 101, 60, 91, 115, 1850, 173, 228, 148, 169, 232),
	(244, 244, 308, 'Goldramon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot048.png', 1680, 99, 193, 149, 134, 138, 'https://digidb.io/digimon-search/?request=308', 1100, 55, 130, 105, 95, 80, 2270, 143, 257, 193, 173, 197),
	(249, 249, 246, 'ShineGreymon BM', 'Mega', 'Vaccine', 'Fire', '/assets/digimon/dot776.png', 1980, 114, 228, 104, 84, 168, 'https://digidb.io/digimon-search/?request=246', 1400, 70, 165, 60, 45, 110, 2570, 158, 292, 148, 123, 227),
	(253, 253, 191, 'Seraphimon', 'Mega', 'Vaccine', 'Light', '/assets/digimon/dot315.png', 1480, 162, 94, 144, 198, 135, 'https://digidb.io/digimon-search/?request=191', 950, 104, 55, 95, 135, 91, 2020, 221, 133, 193, 262, 179),
	(257, 257, 194, 'Titamon', 'Mega', 'Virus', 'Earth', '/assets/digimon/dot440.png', 1930, 99, 183, 128, 114, 129, 'https://digidb.io/digimon-search/?request=194', 1300, 55, 130, 75, 65, 85, 2570, 143, 237, 182, 163, 173),
	(261, 261, 197, 'Creepymon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot038.png', 1440, 133, 183, 114, 183, 140, 'https://digidb.io/digimon-search/?request=197', 950, 84, 125, 70, 125, 91, 1930, 182, 242, 158, 242, 189),
	(266, 266, 201, 'Leopardmon LM', 'Mega', 'Data', 'Earth', '/assets/digimon/dot743.png', 1290, 153, 159, 129, 139, 218, 'https://digidb.io/digimon-search/?request=201', 850, 100, 110, 80, 90, 155, 1730, 207, 208, 178, 188, 282),
	(270, 270, 314, 'PileVolcamon', 'Mega', 'Data', 'Fire', '/assets/digimon/dot060.png', 1330, 109, 173, 163, 111, 137, 'https://digidb.io/digimon-search/?request=314', 750, 70, 110, 105, 72, 88, 1920, 148, 237, 222, 150, 186),
	(274, 274, 206, 'Puppetmon', 'Mega', 'Virus', 'Plant', '/assets/digimon/dot428.png', 1140, 114, 163, 163, 148, 124, 'https://digidb.io/digimon-search/?request=206', 650, 65, 110, 100, 95, 85, 1630, 163, 217, 227, 202, 163),
	(278, 278, 315, 'Breakdramon', 'Mega', 'Virus', 'Earth', '/assets/digimon/dot214.png', 1880, 89, 213, 168, 94, 129, 'https://digidb.io/digimon-search/?request=315', 1300, 50, 150, 110, 55, 80, 2470, 128, 277, 227, 133, 178),
	(281, 281, 212, 'Beelzemon', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot035.png', 1680, 114, 228, 119, 99, 168, 'https://digidb.io/digimon-search/?request=212', 1100, 70, 165, 75, 60, 110, 2270, 158, 292, 163, 138, 227),
	(282, 282, 242, 'Beelzemon BM', 'Mega', 'Virus', 'Dark', '/assets/digimon/dot775.png', 1680, 114, 238, 124, 104, 178, 'https://digidb.io/digimon-search/?request=242', 1100, 70, 175, 80, 65, 120, 2270, 158, 302, 168, 143, 237),
	(287, 287, 316, 'MagnaGarurumon', 'Mega', 'Free', 'Light', '/assets/digimon/dot678.png', 1480, 122, 175, 104, 114, 183, 'https://digidb.io/digimon-search/?request=316', 900, 78, 112, 60, 75, 125, 2070, 166, 239, 148, 153, 242),
	(291, 291, 219, 'Minervamon', 'Mega', 'Virus', 'Neutral', '/assets/digimon/dot747.png', 1580, 114, 208, 114, 119, 168, 'https://digidb.io/digimon-search/?request=219', 1000, 70, 145, 70, 80, 110, 2170, 158, 272, 158, 158, 227),
	(295, 295, 318, 'Megidramon', 'Mega', 'Virus', 'Fire', '/assets/digimon/dot047.png', 1690, 120, 199, 132, 109, 153, 'https://digidb.io/digimon-search/?request=318', 1250, 67, 150, 83, 60, 90, 2130, 174, 248, 181, 158, 217),
	(299, 299, 225, 'MetalSeadramon', 'Mega', 'Data', 'Water', '/assets/digimon/dot434.png', 1430, 148, 99, 139, 168, 129, 'https://digidb.io/digimon-search/?request=225', 900, 90, 60, 90, 105, 85, 1970, 207, 138, 188, 232, 173),
	(304, 304, 229, 'Ravemon', 'Mega', 'Vaccine', 'Wind', '/assets/digimon/dot740.png', 1040, 143, 139, 119, 139, 203, 'https://digidb.io/digimon-search/?request=229', 600, 90, 90, 70, 90, 140, 1480, 197, 188, 168, 188, 267),
	(308, 308, 249, 'Rosemon BM', 'Mega', 'Data', 'Plant', '/assets/digimon/dot779.png', 1480, 143, 149, 139, 159, 143, 'https://digidb.io/digimon-search/?request=249', 950, 90, 100, 90, 110, 90, 2020, 197, 198, 188, 208, 197),
	(312, 312, 322, 'Alphamon Ouryuken', 'Ultra', 'Vaccine', 'Neutral', '/assets/digimon/dot766.png', 1530, 133, 179, 149, 159, 153, 'https://digidb.io/digimon-search/?request=322', 1000, 80, 130, 100, 110, 100, 2070, 187, 228, 198, 208, 207),
	(316, 316, 235, 'Omnimon Zwart', 'Ultra', 'Vaccine', 'Dark', '/assets/digimon/dot757.png', 1490, 139, 153, 193, 158, 134, 'https://digidb.io/digimon-search/?request=235', 1000, 90, 100, 130, 105, 95, 1980, 188, 207, 257, 212, 173),
	(321, 321, 236, 'Belphemon RM', 'Ultra', 'Virus', 'Dark', '/assets/digimon/dot040.png', 1780, 84, 247, 168, 109, 140, 'https://digidb.io/digimon-search/?request=236', 1200, 45, 184, 110, 70, 91, 2370, 123, 311, 227, 148, 189),
	(325, 325, 240, 'Rapidmon (Armor)', 'Armor', 'Vaccine', 'Light', '/assets/digimon/dot751.png', 1140, 114, 158, 178, 158, 124, 'https://digidb.io/digimon-search/?request=240', 650, 65, 105, 115, 105, 85, 1630, 163, 212, 242, 212, 163),
	(328, 328, 337, 'Ryudamon', 'Rookie', 'Vaccine', 'Neutral', '/assets/digimon/dot190.png', 790, 73, 123, 97, 57, 102, 'https://digidb.io/digimon-search/?request=337', 210, 29, 60, 53, 18, 44, 1380, 117, 187, 141, 96, 161),
	(332, 332, 341, 'Apocalymon', 'Ultra', 'Free', 'Neutral', '/assets/digimon/dot328.png', 1890, 173, 89, 104, 183, 188, 'https://digidb.io/digimon-search/?request=341', 1500, 110, 50, 60, 120, 130, 2280, 237, 128, 148, 247, 247),
	(336, 336, 331, 'Sistermon C (Awake.)', 'Champion', 'Virus', 'Light', '/assets/digimon/dot784.png', 1550, 114, 188, 102, 114, 173, 'https://digidb.io/digimon-search/?request=331', 970, 70, 125, 58, 75, 115, 2140, 158, 252, 146, 153, 232),
	(341, 341, 336, 'Gallantmon NX', 'Mega', 'Virus', 'Light', '/assets/digimon/dot905.png', 1070, 93, 122, 109, 111, 108, 'https://digidb.io/digimon-search/?request=336', 390, 25, 51, 38, 40, 37, 1760, 162, 193, 180, 182, 179),
	(342, 342, 342, 'BlitzGreymon', 'Mega', 'Virus', 'Electric', '/assets/digimon/blitzgreymon.png', 1712, 103, 216, 187, 109, 126, 'https://digidb.io/digimon-search/?request=174', 1103, 62, 146, 121, 66, 82, 2331, 144, 288, 255, 152, 170),
	(343, 343, 343, 'CresGarurumon', 'Mega', 'Virus', 'Wind', '/assets/digimon/cresgarurumon.png', 1254, 157, 177, 135, 135, 160, 'https://digidb.io/digimon-search/?request=223', 770, 99, 121, 84, 84, 104, 1738, 217, 233, 187, 187, 218),
	(344, 344, 344, 'Omnimon Alter-S', 'Ultra', 'Virus', 'Light', '/assets/digimon/omnimonalters.png', 1764, 114, 218, 181, 143, 130, 'https://digidb.io/digimon-search/?request=234', 1155, 71, 152, 119, 102, 86, 2384, 157, 286, 245, 185, 174),
	(345, 345, 345, 'Agumon X', 'Rookie', 'Vaccine', 'Fire', '/assets/animated_digimon/Agumon X/idle1.png', 1133, 65, 144, 113, 59, 95, 'https://digidb.io/digimon-search/?request=17https://digidb.io/digimon-search/?request=17', 495, 22, 75, 50, 17, 41, 1782, 108, 215, 178, 102, 149),
	(346, 346, 346, 'Greymon X', 'Champion', 'Vaccine', 'Fire', '/assets/animated_digimon/Greymon X/idle1.png', 1353, 81, 163, 130, 70, 114, 'https://digidb.io/digimon-search/?request=74', 715, 39, 94, 66, 28, 61, 2002, 124, 233, 195, 113, 168),
	(347, 347, 347, 'MetalGreymon X', 'Ultimate', 'Vaccine', 'Fire', '/assets/animated_digimon/MetalGreymon X/idle1.png', 1683, 92, 185, 163, 88, 124, 'https://digidb.io/digimon-search/?request=152', 1045, 50, 115, 99, 45, 70, 2332, 135, 255, 227, 131, 178),
	(348, 348, 348, 'WarGreymon X', 'Mega', 'Vaccine', 'Fire', '/assets/animated_digimon/WarGreymon X/idle1.png', 1790, 109, 212, 179, 109, 154, 'https://digidb.io/digimon-search/?request=174', 1155, 65, 143, 115, 66, 100, 2442, 151, 273, 244, 152, 208),
	(349, 349, 349, 'Gabumon X', 'Rookie', 'Data', 'Fire', '/assets/animated_digimon/Gabumon X/idle1.png', 1078, 97, 103, 89, 87, 100, 'https://digidb.io/digimon-search/?request=25', 495, 39, 50, 35, 33, 42, 1672, 156, 157, 143, 141, 160),
	(350, 350, 350, 'WereGarurumon X', 'Ultimate', 'Vaccine', 'Earth', '/assets/animated_digimon/WereGarurumon X/idle1.png', 1573, 98, 196, 98, 87, 168, 'https://digidb.io/digimon-search/?request=164', 935, 50, 127, 50, 44, 105, 2222, 146, 266, 146, 130, 233),
	(351, 351, 351, 'MetalGarurumon X', 'Mega', 'Data', 'Water', '/assets/animated_digimon/MetalGarurumon X/idle1.png', 1254, 157, 169, 142, 142, 196, 'https://digidb.io/digimon-search/?request=223', 770, 99, 116, 88, 88, 127, 1738, 217, 223, 196, 196, 266),
	(353, 353, 353, 'Guilmon X', 'Rookie', 'Virus', 'Fire', '/assets/animated_digimon/Guilmon X/idle1.png', 1155, 76, 146, 81, 59, 111, 'https://digidb.io/digimon-search/?request=27', 517, 28, 77, 33, 17, 47, 1804, 124, 217, 130, 102, 176),
	(352, 352, 352, 'Omnimon X', 'Ultra', 'Vaccine', 'Light', '/assets/animated_digimon/Omnimon X/idle1.png', 1848, 114, 229, 185, 147, 158, 'https://digidb.io/digimon-search/?request=234', 1210, 72, 160, 121, 105, 105, 2497, 157, 299, 250, 190, 212),
	(354, 354, 354, 'Growlmon X', 'Champion', 'Virus', 'Fire', '/assets/animated_digimon/Growlmon X/idle1.png', 1298, 87, 157, 124, 76, 120, 'https://digidb.io/digimon-search/?request=72', 660, 44, 88, 61, 33, 66, 1947, 130, 228, 189, 119, 174),
	(355, 355, 355, 'WarGrowlmon X', 'Ultimate', 'Virus', 'Fire', '/assets/animated_digimon/WarGrowlmon X/idle1.png', 1573, 92, 196, 152, 96, 128, 'https://digidb.io/digimon-search/?request=151', 935, 50, 127, 88, 53, 74, 2222, 135, 266, 217, 139, 182),
	(356, 356, 356, 'Megidramon X', 'Mega', 'Virus', 'Fire', '/assets/animated_digimon/Megidramon X/idle1.png', 1859, 132, 219, 145, 120, 168, 'https://digidb.io/digimon-search/?request=318', 1375, 74, 165, 91, 66, 99, 2343, 191, 273, 199, 174, 239),
	(357, 357, 357, 'Gallantmon X', 'Mega', 'Virus', 'Light', '/assets/animated_digimon/Gallantmon X/idle1.png', 1628, 163, 164, 169, 164, 163, 'https://digidb.io/digimon-search/?request=198', 1045, 105, 110, 116, 110, 105, 2222, 222, 218, 223, 218, 222),
	(358, 358, 358, 'Dracomon X', 'Rookie', 'Data', 'Fire', '/assets/animated_digimon/Dracomon X/idle1.png', 1078, 76, 145, 98, 54, 109, 'https://digidb.io/digimon-search/?request=255', 440, 33, 76, 34, 11, 55, 1727, 119, 216, 163, 97, 163),
	(359, 359, 359, 'LadyDevimon X', 'Ultimate', 'Virus', 'Dark', '/assets/animated_digimon/LadyDevimon X/idle1.png', 979, 179, 109, 103, 174, 157, 'https://digidb.io/digimon-search/?request=163', 550, 110, 66, 55, 105, 94, 1408, 250, 152, 152, 244, 222),
	(360, 360, 360, 'BeelStarmon', 'Mega', 'Virus', 'Dark', '/assets/digimon/beelstarmon.png', 1620, 114, 99, 100, 228, 160, 'https://digidb.io/digimon-search/?request=212', 1050, 70, 60, 70, 165, 104, 2200, 158, 138, 150, 292, 210),
	(361, 361, 361, 'BeelStarmon X', 'Mega', 'Virus', 'Dark', '/assets/animated_digimon/BeelStarmon X/idle1.png', 1804, 125, 109, 110, 251, 176, 'https://digidb.io/digimon-search/?request=212', 1155, 77, 66, 77, 182, 114, 2420, 174, 152, 165, 321, 231),
	(362, 362, 362, 'Beelzemon X', 'Mega', 'Virus', 'Dark', '/assets/animated_digimon/Beelzemon X/idle1.png', 1848, 125, 251, 131, 109, 185, 'https://digidb.io/digimon-search/?request=212', 1210, 77, 182, 83, 66, 121, 2497, 174, 321, 179, 152, 250),
	(363, 363, 363, 'Coronamon', 'Rookie', 'Vaccine', 'Fire', '/assets/animated_digimon/Coronamon/idle1.png', 1208, 91, 111, 95, 75, 74, 'https://digidb.io/digimon-search/?request=259', 314, 45, 40, 24, 38, 34, 1847, 126, 158, 136, 110, 115),
	(364, 364, 364, 'Firamon', 'Champion', 'Vaccine', 'Fire', '/assets/animated_digimon/Firamon/idle1.png', 1375, 83, 116, 97, 72, 132, 'https://digidb.io/digimon-search/?request=281', 398, 54, 56, 40, 36, 74, 1400, 152, 177, 154, 107, 191),
	(365, 365, 365, 'Flaremon', 'Ultimate', 'Vaccine', 'Fire', '/assets/animated_digimon/Flaremon/idle1.png', 1307, 119, 152, 114, 107, 101, 'https://digidb.io/digimon-search/?request=289', 609, 71, 98, 44, 73, 68, 2017, 167, 206, 186, 140, 136),
	(366, 366, 366, 'Apollomon', 'Mega', 'Vaccine', 'Fire', '/assets/animated_digimon/Apollomon/idle1.png', 1407, 134, 177, 129, 126, 128, 'https://digidb.io/digimon-search/?request=289', 709, 86, 123, 60, 92, 95, 2117, 182, 231, 200, 159, 165),
	(367, 367, 367, 'GraceNovamon', 'Ultra', 'Vaccine', 'Light', '/assets/animated_digimon/GraceNovamon/idle1.png', 1628, 133, 196, 155, 159, 144, 'https://digidb.io/digimon-search/?request=289', 1067, 62, 141, 102, 118, 96, 2200, 180, 265, 210, 215, 195),
	(368, 368, 368, 'Angewomon X', 'Ultimate', 'Vaccine', 'Light', 'assets/animated_digimon/Angewomon X/idle1.png', 979, 179, 76, 103, 207, 157, '', 550, 110, 33, 55, 138, 94, 1408, 250, 118, 152, 277, 222),
	(369, 369, 369, 'Rosemon X', 'Mega', 'Data', 'Plant', 'assets/animated_digimon/Rosemon X/idle1.png', 1463, 162, 158, 142, 164, 158, '', 880, 103, 104, 88, 110, 100, 2057, 221, 212, 196, 218, 218),
	(370, 370, 370, 'Gankoomon X', 'Mega', 'Data', 'Fire', '/assets/animated_digimon/Gankoomon X/idle1.png', 2288, 99, 207, 179, 120, 152, '', 1650, 56, 138, 115, 77, 98, 2937, 142, 277, 244, 163, 206),
	(371, 371, 371, 'Dynasmon X', 'Mega', 'Data', 'Wind', '/assets/animated_digimon/Dynasmon X/idle1.png', 1848, 125, 234, 142, 103, 196, '', 1210, 77, 165, 94, 61, 132, 2497, 174, 305, 190, 146, 261),
	(372, 372, 372, 'Jesmon X', 'Mega', 'Data', 'Neutral', '/assets/animated_digimon/Jesmon X/idle1.png', 1628, 131, 218, 164, 125, 185, '', 990, 83, 149, 115, 93, 121, 2277, 179, 288, 212, 168, 250),
	(373, 373, 373, 'Crusadermon X', 'Mega', 'Virus', 'Dark', '/assets/animated_digimon/Crusadermon X/idle1.png', 1364, 169, 158, 153, 158, 212, '', 880, 110, 105, 99, 105, 143, 1848, 227, 212, 207, 212, 283),
	(374, 374, 374, 'Leopardmon X', 'Mega', 'Data', 'Light', '/assets/animated_digimon/Leopardmon X/idle1.png', 1364, 168, 158, 153, 158, 210, '', 880, 110, 105, 99, 105, 143, 1848, 228, 212, 207, 212, 283),
	(375, 375, 375, 'Examon X', 'Ultra', 'Data', 'Wind', '/assets/animated_digimon/Examon X/idle1.png', 1903, 163, 197, 153, 147, 168, '', 1320, 105, 143, 99, 95, 110, 2497, 222, 250, 207, 201, 228),
	(376, 376, 376, 'Kentaurosmon X', 'Mega', 'Vaccine', 'Light', '/assets/animated_digimon/Kentauros X/idle1.png', 1254, 168, 153, 169, 169, 201, '', 770, 110, 99, 115, 115, 132, 1738, 227, 207, 223, 223, 272),
	(377, 377, 377, 'Magnamon X', 'Mega', 'Vaccine', 'Light', '/assets/animated_digimon/Magnamon X/idle1.png', 1364, 136, 185, 229, 163, 134, '', 825, 83, 126, 160, 105, 94, 1903, 190, 244, 299, 222, 179),
	(378, 378, 378, 'UlforceVeedramon X', 'Mega', 'Vaccine', 'Wind', '/assets/animated_digimon/UlforceVeedramon X/idle1.png', 1848, 142, 207, 120, 114, 218, '', 1210, 94, 138, 72, 72, 154, 2497, 190, 277, 168, 157, 283),
	(379, 379, 379, 'Salamon X', 'Rookie', 'Vaccine', 'Light', 'assets/animated_digimon/Salamon X/idle1.png', 594, 130, 65, 76, 130, 107, '', 165, 61, 22, 28, 62, 33, 1023, 200, 108, 124, 201, 172),
	(380, 380, 380, 'Gatomon X', 'Champion', 'Vaccine', 'Light', 'assets/animated_digimon/Gatomon X/idle1.png', 704, 157, 76, 87, 157, 135, '', 275, 88, 33, 39, 88, 72, 1133, 228, 119, 135, 228, 200),
	(381, 381, 381, 'Ophanimon X', 'Mega', 'Vaccine', 'Light', '/assets/animated_digimon/Ophanimon X/idle1.png', 924, 201, 114, 180, 212, 168, '', 495, 132, 71, 132, 143, 105, 1353, 272, 157, 229, 283, 233),
	(382, 382, 382, 'Lilithmon X', 'Mega', 'Virus', 'Dark', '/assets/animated_digimon/Lilithmon X/idle1.png', 1034, 223, 109, 114, 245, 190, '', 605, 154, 66, 66, 176, 127, 1463, 294, 152, 163, 316, 255),
	(383, 383, 383, 'Palmon X', 'Rookie', 'Data', 'Plant', '/assets/animated_digimon/Palmon X/idle1.png', 1254, 72, 113, 99, 88, 87, '', 561, 23, 55, 41, 34, 38, 1958, 120, 173, 158, 142, 135),
	(384, 384, 384, 'Togemon X', 'Champion', 'Data', 'Plant', '/assets/animated_digimon/Togemon X/idle1.png', 1463, 92, 119, 124, 102, 99, '', 770, 44, 60, 66, 48, 51, 2167, 141, 178, 184, 156, 147),
	(385, 385, 385, 'Lillymon X', 'Ultimate', 'Data', 'Plant', '/assets/animated_digimon/Lillymon X/idle1.png', 979, 168, 81, 103, 179, 174, '', 550, 99, 39, 55, 110, 110, 1408, 239, 124, 152, 250, 239),
	(386, 386, 386, 'Numemon X', 'Champion', 'Virus', 'Earth', '/assets/animated_digimon/Numemon X/idle1.png', 1518, 109, 92, 152, 76, 91, '', 825, 51, 44, 82, 28, 48, 2222, 168, 141, 222, 124, 134),
	(387, 387, 387, 'Ogremon X', 'Champion', 'Virus', 'Earth', '/assets/animated_digimon/Ogremon X/idle1.png', 1353, 70, 171, 130, 70, 107, '', 715, 28, 101, 66, 28, 53, 2002, 113, 241, 195, 113, 161),
	(388, 388, 388, 'Craniamon X', 'Mega', 'Vaccine', 'Earth', '/assets/animated_digimon/Craniamon X/idle1.png', 1793, 157, 136, 229, 147, 136, '', 1100, 99, 88, 160, 99, 94, 2497, 217, 185, 299, 196, 179),
	(389, 389, 389, 'Cyberdramon X', 'Ultimate', 'Vaccine', 'Dark', '/assets/animated_digimon/Cyberdramon X/idle1.png', 1628, 89, 190, 157, 88, 134, '', 990, 46, 121, 94, 44, 80, 2277, 132, 261, 222, 130, 188),
	(391, 391, 391, 'Sakuyamon X', 'Mega', 'Data', 'Light', '/assets/animated_digimon/Sakuyamon X/idle1.png', 1089, 196, 103, 125, 207, 189, '', 660, 127, 61, 77, 138, 127, 1518, 266, 146, 174, 277, 255),
	(392, 392, 392, 'Barbamon X', 'Mega', 'Virus', 'Dark', '/assets/animated_digimon/Barbamon X/idle1.png', 1463, 202, 92, 142, 256, 146, '', 880, 139, 50, 88, 187, 98, 2057, 267, 135, 196, 327, 195),
	(393, 393, 393, 'Belphemon X', 'Ultra', 'Virus', 'Dark', '/assets/animated_digimon/Belphemon X/idle1.png', 1958, 92, 272, 185, 120, 154, '', 1320, 50, 202, 121, 77, 100, 2607, 135, 342, 250, 163, 208),
	(394, 394, 394, 'Creepymon X', 'Mega', 'Virus', 'Dark', '/assets/animated_digimon/Creepymon X/idle1.png', 1584, 146, 201, 125, 201, 154, '', 1045, 92, 138, 77, 138, 100, 2123, 200, 266, 174, 266, 208),
	(395, 395, 395, 'Leviamon X', 'Mega', 'Virus', 'Water', '/assets/animated_digimon/Leviamon X/idle1.png', 1903, 132, 185, 174, 158, 146, '', 1210, 84, 127, 116, 105, 98, 2607, 180, 244, 233, 212, 195),
	(396, 396, 396, 'Lucemon X', 'Ultimate', 'Virus', 'Neutral', '/assets/animated_digimon/Lucemon X/idle1.png', 1529, 153, 179, 125, 223, 153, '', 990, 99, 116, 77, 160, 99, 2068, 207, 244, 174, 288, 207),
	(398, 398, 398, 'Pegasusmon X', 'Armor', 'Vaccine', 'Light', '/assets/animated_digimon/Pegasusmon X/idle1.png', 1250, 120, 100, 105, 120, 155, '', 660, 50, 60, 52, 70, 103, 1840, 175, 138, 155, 170, 224),
	(399, 399, 399, 'Nefertimon X', 'Armor', 'Vaccine', 'Light', '/assets/animated_digimon/Nefertimon X/idle1.png', 1272, 128, 83, 118, 132, 111, '', 672, 53, 50, 58, 75, 74, 1873, 186, 114, 173, 190, 160),
	(397, 397, 397, 'Submarimon', 'Armor', 'Vaccine', 'Water', '/assets/animated_digimon/Submarimon/idle1.png', 1187, 102, 95, 115, 98, 110, '', 693, 44, 56, 58, 44, 68, 1755, 162, 118, 170, 138, 154),
	(400, 400, 400, 'Justimon X', 'Mega', 'Vaccine', 'Light', '/assets/animated_digimon/Justimon X/idle1.png', 1683, 109, 212, 174, 109, 158, '', 1045, 66, 143, 110, 66, 105, 2332, 152, 283, 239, 152, 201),
	(401, 401, 401, 'Rapidmon X', 'Ultimate', 'Vaccine', 'Light', '/assets/animated_digimon/Rapidmon X/idle1.png', 1254, 125, 174, 196, 174, 136, '', 715, 72, 116, 127, 116, 93, 1793, 179, 233, 266, 233, 179),
	(402, 402, 402, 'AncientGreymon', 'Mega', 'Vaccine', 'Fire', '/assets/animated_digimon/AncientGreymon/idle1.png', 1000, 100, 100, 100, 100, 100, '', 1000, 100, 100, 100, 100, 100, 1000, 100, 100, 100, 100, 100),
	(403, 403, 403, 'AncientGarurumon', 'Mega', 'Data', 'Light', '/assets/animated_digimon/AncientGarurumon/idle1.png', 1000, 100, 100, 100, 100, 100, '', 1000, 100, 100, 100, 100, 100, 1000, 100, 100, 100, 100, 100),
	(404, 404, 404, 'AncientBeetlemon', 'Mega', 'Vaccine', 'Electric', '/assets/animated_digimon/AncientBeetlemon/idle1.png', 1000, 100, 100, 100, 100, 100, '', 1000, 100, 100, 100, 100, 100, 1000, 100, 100, 100, 100, 100),
	(405, 405, 405, 'AncientMegatheriummon', 'Mega', 'Data', 'Water', 'assets/animated_digimon/AncientMegatheriummon/idle1.png', 1000, 100, 100, 100, 100, 100, '', 1000, 100, 100, 100, 100, 100, 1000, 100, 100, 100, 100, 100),
	(407, 407, 407, 'AncientSphinxmon', 'Mega', 'Virus', 'Dark', 'assets/animated_digimon/AncientSphinxmon/idle1.png', 1000, 100, 100, 100, 100, 100, '', 1000, 100, 100, 100, 100, 100, 1000, 100, 100, 100, 100, 100),
	(408, 408, 408, 'Ebonwumon', 'Mega', 'Vaccine', 'Plant', 'assets/animated_digimon/Ebonwumon/idle1.png', 1000, 100, 100, 100, 100, 100, '', 1000, 100, 100, 100, 100, 100, 1000, 100, 100, 100, 100, 100),
	(409, 409, 409, 'Zhuqiaomon', 'Mega', 'Virus', 'Fire', 'assets/animated_digimon/Zhuqiaomon/idle1.png', 100, 100, 100, 100, 100, 100, '', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100),
	(410, 410, 410, 'Azulongmon', 'Mega', 'Data', 'Electric', '/assets/animated_digimon/Azulongmon/idle1.png', 100, 100, 100, 100, 100, 100, '', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100),
	(411, 411, 411, 'Baihumon', 'Mega', 'Data', 'Light', '/assets/animated_digimon/Baihumon/idle1.png', 100, 100, 100, 100, 100, 100, '', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100),
	(406, 406, 406, 'AncientMermaidmon', 'Mega', 'Data', 'Water', 'assets/animated_digimon/AncientMermaidmon/idle1.png', 1000, 100, 100, 100, 100, 100, '', 1000, 100, 100, 100, 100, 100, 1000, 100, 100, 100, 100, 100);


--
-- Data for Name: digimon_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."digimon_forms" ("id", "base_digimon_id", "form_digimon_id", "form_type", "unlock_condition") VALUES
	(3, 18, 345, 'X-Antibody', NULL),
	(4, 345, 18, 'Base', NULL),
	(5, 90, 346, 'X-Antibody', NULL),
	(6, 346, 90, 'Base', NULL),
	(7, 203, 347, 'X-Antibody', NULL),
	(8, 347, 203, 'Base', NULL),
	(9, 228, 348, 'X-Antibody', NULL),
	(10, 348, 228, 'Base', NULL),
	(11, 27, 349, 'X-Antibody', NULL),
	(12, 349, 27, 'Base', NULL),
	(13, 215, 350, 'X-Antibody', NULL),
	(14, 297, 351, 'X-Antibody', NULL),
	(15, 351, 297, 'Base', NULL),
	(16, 350, 215, 'Base', NULL),
	(17, 315, 352, 'X-Antibody', NULL),
	(18, 352, 315, 'Base', NULL),
	(19, 29, 353, 'X-Antibody', NULL),
	(20, 353, 29, 'Base', NULL),
	(21, 88, 354, 'X-Antibody', NULL),
	(22, 354, 88, 'Base', NULL),
	(23, 202, 355, 'X-Antibody', NULL),
	(24, 355, 202, 'Base', NULL),
	(25, 295, 356, 'X-Antibody', NULL),
	(26, 356, 295, 'Base', NULL),
	(27, 262, 357, 'X-Antibody', NULL),
	(28, 357, 262, 'Base', NULL),
	(29, 43, 358, 'X-Antibody', NULL),
	(30, 358, 43, 'Base', NULL),
	(31, 214, 359, 'X-Antibody', NULL),
	(32, 359, 214, 'Base', NULL),
	(33, 360, 361, 'X-Antibody', NULL),
	(34, 361, 360, 'Base', NULL),
	(35, 281, 362, 'X-Antibody', NULL),
	(36, 362, 281, 'Base', NULL),
	(38, 152, 368, 'X-Antibody', NULL),
	(39, 368, 152, 'Base', NULL),
	(40, 307, 369, 'X-Antibody', NULL),
	(41, 369, 307, 'Base', NULL),
	(42, 234, 370, 'X-Antibody', NULL),
	(43, 370, 234, 'Base', NULL),
	(44, 263, 371, 'X-Antibody', NULL),
	(45, 371, 263, 'Base', NULL),
	(46, 247, 372, 'X-Antibody', NULL),
	(47, 372, 247, 'Base', NULL),
	(48, 306, 373, 'X-Antibody', NULL),
	(49, 373, 306, 'X-Antibody', NULL),
	(50, 265, 374, 'X-Antibody', NULL),
	(51, 374, 265, 'Base', NULL),
	(52, 314, 375, 'X-Antibody', NULL),
	(53, 375, 314, 'Base', NULL),
	(54, 251, 376, 'X-Antibody', NULL),
	(55, 376, 251, 'Base', NULL),
	(56, 324, 377, 'X-Antibody', NULL),
	(57, 377, 324, 'Base', NULL),
	(58, 220, 378, 'X-Antibody', NULL),
	(59, 378, 220, 'Base', NULL),
	(60, 54, 379, 'X-Antibody', NULL),
	(61, 379, 54, 'Base', NULL),
	(62, 115, 380, 'X-Antibody', NULL),
	(63, 380, 115, 'Base', NULL),
	(64, 229, 381, 'X-Antibody', NULL),
	(65, 381, 229, 'Base', NULL),
	(66, 303, 382, 'X-Antibody', NULL),
	(67, 382, 303, 'Base', NULL),
	(68, 48, 383, 'X-Antibody', NULL),
	(69, 383, 48, 'Base', NULL),
	(70, 118, 384, 'X-Antibody', NULL),
	(71, 384, 118, 'Base', NULL),
	(72, 212, 385, 'X-Antibody', NULL),
	(73, 385, 212, 'Base', NULL),
	(74, 121, 386, 'X-Antibody', NULL),
	(75, 386, 121, 'Base', NULL),
	(76, 78, 387, 'X-Antibody', NULL),
	(77, 387, 78, 'Base', NULL),
	(78, 241, 388, 'X-Antibody', NULL),
	(79, 388, 241, 'Base', NULL),
	(80, 163, 389, 'X-Antibody', NULL),
	(81, 389, 163, 'Base', NULL),
	(82, 260, 390, 'X-Antibody', NULL),
	(83, 390, 260, 'Base', NULL),
	(84, 246, 391, 'X-Antibody', NULL),
	(85, 391, 246, 'Base', NULL),
	(86, 271, 392, 'X-Antibody', NULL),
	(87, 392, 271, 'Base', NULL),
	(88, 321, 393, 'X-Antibody', NULL),
	(89, 393, 321, 'Base', NULL),
	(90, 261, 394, 'X-Antibody', NULL),
	(92, 302, 395, 'X-Antibody', NULL),
	(93, 395, 302, 'Base', NULL),
	(91, 394, 261, 'Base', NULL),
	(94, 213, 396, 'X-Antibody', NULL),
	(95, 396, 213, 'Base', NULL),
	(98, 325, 401, 'X-Antibody', NULL),
	(99, 401, 325, 'Base', NULL),
	(96, 250, 400, 'X-Antibody', NULL),
	(97, 400, 250, 'Base', NULL);


--
-- Data for Name: evolution_paths; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."evolution_paths" ("id", "from_digimon_id", "to_digimon_id", "level_required", "stat_requirements", "dna_requirement", "item_requirement") VALUES
	(157, 35, 94, 14, '{"sp": 40, "int": 40}', NULL, NULL),
	(161, 37, 95, 12, '{"hp": 130, "sp": 25, "def": 40}', NULL, NULL),
	(165, 37, 99, 14, '{"hp": 150, "def": 60}', NULL, NULL),
	(173, 40, 102, 14, '{"hp": 150, "int": 40}', NULL, NULL),
	(9, 4, 7, 3, '{"atk": 15}', NULL, NULL),
	(177, 41, 79, 14, '{"def": 55}', NULL, NULL),
	(181, 41, 80, 14, '{"hp": 130, "def": 60}', NULL, NULL),
	(185, 44, 140, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(912, 342, 344, 60, '{"abi": 50, "atk": 220, "int": 160, "spd": 135}', 343, NULL),
	(938, 364, 207, 26, '{"hp": 600, "atk": 60}', NULL, NULL),
	(13, 7, 18, 9, '{"atk": 30}', NULL, NULL),
	(17, 7, 43, 6, '{"atk": 50, "def": 20}', NULL, NULL),
	(21, 8, 62, 7, '{"atk": 20, "int": 20, "spd": 20}', NULL, NULL),
	(25, 9, 33, 7, '{"atk": 40}', NULL, NULL),
	(29, 10, 19, 8, '{"atk": 30}', NULL, NULL),
	(34, 11, 51, 9, '{"spd": 30}', NULL, NULL),
	(38, 12, 21, 7, '{"hp": 75, "def": 20}', NULL, NULL),
	(42, 13, 22, 7, '{"sp": 20, "int": 30}', NULL, NULL),
	(46, 14, 23, 7, '{"hp": 75, "sp": 20, "spd": 20}', NULL, NULL),
	(50, 15, 24, 7, '{"int": 20}', NULL, NULL),
	(54, 16, 32, 8, '{"def": 30}', NULL, NULL),
	(58, 17, 25, 9, '{"atk": 20, "spd": 20}', NULL, NULL),
	(62, 18, 90, 16, '{"atk": 55}', NULL, NULL),
	(66, 18, 131, 14, '{"atk": 40}', NULL, NULL),
	(70, 19, 100, 14, '{"atk": 30, "def": 40}', NULL, NULL),
	(75, 21, 95, 12, '{"hp": 130, "sp": 25, "def": 40}', NULL, NULL),
	(79, 21, 99, 14, '{"hp": 150, "def": 60}', NULL, NULL),
	(83, 22, 111, 16, '{"sp": 40, "int": 40}', NULL, NULL),
	(87, 23, 86, 15, '{"atk": 35, "spd": 50}', NULL, NULL),
	(91, 23, 137, 16, '{"atk": 55}', NULL, NULL),
	(95, 24, 121, 12, '{"hp": 150, "def": 40}', NULL, NULL),
	(99, 25, 81, 15, '{"spd": 55}', NULL, NULL),
	(103, 25, 101, 15, '{"atk": 50, "spd": 55}', NULL, NULL),
	(107, 26, 119, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(111, 27, 119, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(116, 28, 86, 15, '{"atk": 35, "spd": 50}', NULL, NULL),
	(120, 28, 136, 12, '{"hp": 500}', NULL, NULL),
	(124, 29, 114, 14, '{"hp": 150, "atk": 40}', NULL, NULL),
	(128, 30, 98, 18, '{"abi": 5}', NULL, NULL),
	(132, 31, 72, 14, '{"sp": 35, "int": 55}', NULL, NULL),
	(136, 31, 69, 16, '{"atk": 50, "int": 40}', NULL, NULL),
	(140, 32, 112, 14, '{"def": 55}', NULL, NULL),
	(144, 33, 81, 15, '{"spd": 55}', NULL, NULL),
	(148, 33, 97, 14, '{"atk": 40, "def": 25, "spd": 40}', NULL, NULL),
	(152, 34, 133, 14, '{"hp": 250, "atk": 30}', NULL, NULL),
	(325, 83, 200, 30, '{"hp": 400, "sp": 70, "int": 70}', NULL, NULL),
	(329, 85, 170, 30, '{"hp": 800, "atk": 75}', NULL, NULL),
	(333, 86, 192, 28, '{"hp": 400, "atk": 80, "int": 70}', NULL, NULL),
	(337, 87, 172, 30, '{"sp": 60, "int": 75, "spd": 60}', NULL, NULL),
	(194, 46, 115, 16, '{"int": 40}', NULL, NULL),
	(342, 88, 203, 30, '{"hp": 350, "atk": 100}', NULL, NULL),
	(346, 89, 163, 28, '{"hp": 400, "atk": 75, "spd": 75}', NULL, NULL),
	(350, 90, 201, 26, '{"hp": 400, "atk": 95, "spd": 75}', NULL, NULL),
	(354, 91, 182, 30, '{"atk": 75, "def": 75}', NULL, NULL),
	(358, 92, 182, 30, '{"atk": 75, "def": 75}', NULL, NULL),
	(362, 93, 158, 28, '{"def": 75, "spd": 75}', NULL, NULL),
	(366, 94, 200, 30, '{"hp": 400, "sp": 70, "int": 70}', NULL, NULL),
	(370, 98, 191, 32, '{}', NULL, NULL),
	(913, 343, 344, 60, '{"abi": 50, "atk": 220, "int": 160, "spd": 135}', 342, NULL),
	(939, 365, 366, 55, '{"abi": 20, "atk": 130, "def": 130, "spd": 120}', NULL, NULL),
	(227, 53, 324, 60, '{"abi": 80, "atk": 120, "def": 145}', NULL, 'digi_egg_of_miracles'),
	(198, 47, 90, 16, '{"atk": 55}', NULL, NULL),
	(202, 47, 123, 16, '{"atk": 55, "spd": 50}', NULL, NULL),
	(206, 48, 102, 14, '{"hp": 150, "int": 40}', NULL, NULL),
	(210, 49, 65, 15, '{"atk": 40, "int": 40}', NULL, NULL),
	(214, 49, 124, 13, '{"sp": 40, "int": 30}', NULL, NULL),
	(219, 50, 75, 14, '{"atk": 35, "spd": 45}', NULL, NULL),
	(223, 51, 130, 14, '{"spd": 50}', NULL, NULL),
	(231, 54, 115, 16, '{"int": 40}', NULL, NULL),
	(235, 54, 123, 16, '{"atk": 55, "spd": 50}', NULL, NULL),
	(239, 55, 121, 12, '{"hp": 150, "def": 40}', NULL, NULL),
	(247, 59, 74, 14, '{"hp": 500}', NULL, NULL),
	(251, 60, 77, 16, '{"abi": 5, "int": 40}', NULL, NULL),
	(255, 62, 85, 15, '{"spd": 50}', NULL, NULL),
	(260, 63, 72, 14, '{"sp": 35, "int": 55}', NULL, NULL),
	(264, 63, 113, 14, '{"hp": 150, "def": 40}', NULL, NULL),
	(268, 64, 93, 14, '{"atk": 55}', NULL, NULL),
	(272, 65, 147, 30, '{"abi": 10, "atk": 70, "int": 90}', NULL, NULL),
	(276, 65, 173, 28, '{"sp": 70, "int": 85}', NULL, NULL),
	(280, 67, 208, 30, '{"sp": 75, "spd": 90}', NULL, NULL),
	(284, 70, 168, 28, '{"atk": 120, "def": 85, "spd": 70}', NULL, NULL),
	(288, 71, 194, 28, '{"hp": 850, "def": 75, "int": 75}', NULL, NULL),
	(292, 72, 177, 28, '{"hp": 500, "atk": 95}', NULL, NULL),
	(296, 74, 172, 30, '{"sp": 60, "int": 75, "spd": 60}', NULL, NULL),
	(301, 76, 148, 30, '{"abi": 10, "atk": 80, "spd": 95}', NULL, NULL),
	(305, 77, 195, 30, '{"sp": 80, "abi": 10, "int": 80}', NULL, NULL),
	(309, 78, 177, 28, '{"hp": 500, "atk": 95}', NULL, NULL),
	(313, 79, 160, 26, '{"hp": 400, "atk": 95}', NULL, NULL),
	(317, 81, 160, 26, '{"hp": 400, "atk": 95}', NULL, NULL),
	(321, 82, 165, 28, '{"hp": 800, "def": 70}', NULL, NULL),
	(473, 137, 145, 26, '{"def": 110}', NULL, NULL),
	(477, 137, 161, 30, '{"hp": 400, "atk": 80, "spd": 70}', NULL, NULL),
	(481, 140, 141, 28, '{"hp": 400, "def": 95}', NULL, NULL),
	(499, 146, 260, 55, '{"hp": 1100, "abi": 20, "atk": 180, "spd": 130}', NULL, NULL),
	(379, 103, 179, 26, '{"hp": 900}', NULL, NULL),
	(500, 146, 281, 60, '{"hp": 2000, "abi": 80, "atk": 250, "spd": 150}', NULL, NULL),
	(501, 146, 218, 60, '{"sp": 130, "abi": 40, "atk": 200, "spd": 100}', NULL, NULL),
	(502, 147, 227, 55, '{"hp": 1200, "sp": 110, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(503, 147, 271, 60, '{"sp": 160, "abi": 80, "def": 120, "int": 200}', NULL, NULL),
	(506, 147, 238, 50, '{"hp": 1300, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(510, 150, 244, 55, '{"abi": 40, "atk": 130, "def": 120, "int": 120}', NULL, NULL),
	(518, 152, 289, 60, '{"sp": 120, "abi": 80, "atk": 120, "int": 120}', 214, NULL),
	(522, 153, 280, 50, '{"hp": 1100, "abi": 20, "def": 150, "int": 120}', NULL, NULL),
	(527, 154, 240, 50, '{"sp": 110, "abi": 20, "int": 140}', NULL, NULL),
	(531, 156, 255, 50, '{"abi": 20, "atk": 150, "def": 140}', NULL, NULL),
	(535, 158, 254, 50, '{"abi": 20, "def": 130, "spd": 130}', NULL, NULL),
	(539, 160, 272, 55, '{"abi": 20, "atk": 120, "def": 130}', NULL, NULL),
	(543, 163, 257, 55, '{"hp": 1400, "abi": 20, "atk": 150, "int": 120}', NULL, NULL),
	(914, 204, 342, 55, '{"hp": 1800, "abi": 25, "atk": 180, "def": 150}', NULL, NULL),
	(940, 160, 366, 55, '{"abi": 20, "atk": 130, "def": 130, "spd": 120}', NULL, NULL),
	(383, 105, 156, 26, '{"hp": 800, "atk": 75, "def": 95}', NULL, NULL),
	(387, 106, 151, 26, '{"sp": 75, "def": 75, "spd": 65}', NULL, NULL),
	(391, 107, 199, 26, '{"atk": 75, "def": 80}', NULL, NULL),
	(395, 108, 146, 30, '{"atk": 95, "spd": 80}', NULL, NULL),
	(399, 111, 143, 28, '{"atk": 65, "int": 75, "spd": 85}', NULL, NULL),
	(404, 112, 158, 28, '{"def": 75, "spd": 75}', NULL, NULL),
	(408, 114, 201, 26, '{"hp": 400, "atk": 95, "spd": 75}', NULL, NULL),
	(412, 115, 166, 30, '{"atk": 60, "int": 75, "spd": 75}', 67, NULL),
	(416, 116, 147, 30, '{"abi": 10, "atk": 70, "int": 90}', NULL, NULL),
	(420, 118, 187, 26, '{"hp": 850, "atk": 60, "int": 60}', NULL, NULL),
	(424, 119, 181, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(551, 166, 263, 60, '{"hp": 1200, "abi": 80, "atk": 140, "def": 120, "spd": 130}', NULL, NULL),
	(555, 167, 234, 60, '{"hp": 1700, "abi": 80, "atk": 145, "def": 120}', NULL, NULL),
	(428, 120, 167, 28, '{"sp": 70, "atk": 70, "def": 80}', NULL, NULL),
	(432, 121, 207, 26, '{"hp": 600, "atk": 60}', NULL, NULL),
	(436, 122, 208, 30, '{"sp": 75, "spd": 90}', NULL, NULL),
	(440, 124, 187, 26, '{"hp": 850, "atk": 60, "int": 60}', NULL, NULL),
	(445, 125, 150, 30, '{"atk": 75, "spd": 95}', NULL, NULL),
	(449, 127, 151, 26, '{"sp": 75, "def": 75, "spd": 65}', NULL, NULL),
	(453, 128, 163, 28, '{"hp": 400, "atk": 75, "spd": 75}', NULL, NULL),
	(457, 129, 141, 28, '{"hp": 400, "def": 95}', NULL, NULL),
	(461, 130, 188, 26, '{"sp": 75, "int": 80, "spd": 80}', NULL, NULL),
	(465, 131, 192, 28, '{"hp": 400, "atk": 80, "int": 70}', NULL, NULL),
	(654, 206, 277, 45, '{"abi": 20, "def": 150}', NULL, NULL),
	(658, 208, 236, 55, '{"sp": 120, "abi": 20, "int": 135, "spd": 120}', NULL, NULL),
	(662, 208, 331, 50, '{"hp": 1300, "abi": 20, "atk": 180}', NULL, NULL),
	(564, 170, 279, 50, '{"sp": 100, "abi": 20, "def": 120, "int": 145}', NULL, NULL),
	(671, 211, 298, 55, '{"abi": 20, "def": 135, "spd": 125}', NULL, NULL),
	(675, 213, 322, 70, '{"hp": 1400, "sp": 160, "abi": 100, "atk": 130, "int": 250, "spd": 170}', NULL, NULL),
	(679, 215, 292, 55, '{"abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(683, 216, 291, 55, '{"abi": 20, "atk": 150, "spd": 140}', NULL, NULL),
	(687, 217, 273, 50, '{"abi": 20, "atk": 130, "int": 160, "spd": 110}', NULL, NULL),
	(691, 222, 223, 0, '{}', NULL, NULL),
	(695, 260, 310, 70, '{"hp": 2000, "sp": 140, "abi": 100, "atk": 290}', NULL, NULL),
	(703, 276, 316, 60, '{"hp": 1500, "abi": 40, "atk": 150, "def": 200}', 298, NULL),
	(707, 292, 293, 60, '{"abi": 30, "atk": 200, "spd": 200}', NULL, NULL),
	(568, 174, 251, 60, '{"abi": 80, "def": 140, "int": 120, "spd": 150}', NULL, NULL),
	(712, 299, 332, 99, '{"abi": 120}', NULL, NULL),
	(716, 255, 317, 60, '{"abi": 40, "atk": 255}', 272, NULL),
	(720, 20, 137, 16, '{"atk": 55}', NULL, NULL),
	(915, 215, 343, 55, '{"abi": 25, "atk": 190, "def": 130, "int": 100}', NULL, NULL),
	(941, 196, 366, 55, '{"abi": 20, "atk": 130, "def": 130, "spd": 120}', NULL, NULL),
	(576, 177, 286, 50, '{"abi": 20, "atk": 145, "def": 100}', NULL, NULL),
	(580, 179, 235, 45, '{"abi": 20, "atk": 110, "def": 130, "spd": 100}', NULL, NULL),
	(584, 182, 241, 60, '{"sp": 110, "abi": 80, "def": 180, "int": 140}', NULL, NULL),
	(589, 183, 294, 50, '{"hp": 1300, "abi": 20, "atk": 130, "def": 130}', NULL, NULL),
	(593, 185, 272, 55, '{"abi": 20, "atk": 120, "def": 130}', NULL, NULL),
	(597, 187, 307, 55, '{"sp": 120, "abi": 20, "int": 120}', NULL, NULL),
	(605, 192, 271, 60, '{"sp": 160, "abi": 80, "def": 120, "int": 200}', NULL, NULL),
	(609, 193, 269, 55, '{"abi": 20, "atk": 100, "def": 130, "int": 100}', NULL, NULL),
	(613, 194, 299, 50, '{"sp": 120, "abi": 20, "def": 120, "int": 120}', NULL, NULL),
	(617, 195, 306, 60, '{"abi": 80, "atk": 120, "int": 135, "spd": 150}', NULL, NULL),
	(621, 198, 272, 55, '{"abi": 20, "atk": 120, "def": 130}', NULL, NULL),
	(625, 199, 274, 50, '{"abi": 20, "atk": 130, "def": 130, "int": 130}', NULL, NULL),
	(724, 36, 329, 14, '{"atk": 40, "def": 40}', NULL, NULL),
	(728, 38, 128, 16, '{"int": 40}', NULL, NULL),
	(732, 42, 335, 14, '{"sp": 40, "spd": 50}', NULL, NULL),
	(737, 43, 329, 14, '{"atk": 40, "def": 40}', NULL, NULL),
	(630, 200, 268, 55, '{"hp": 1000, "sp": 100, "abi": 20, "int": 130}', NULL, NULL),
	(638, 202, 301, 55, '{"hp": 1300, "abi": 20, "atk": 180, "def": 150}', NULL, NULL),
	(642, 203, 230, 50, '{"abi": 20, "atk": 120, "def": 100, "spd": 100}', NULL, NULL),
	(646, 204, 276, 55, '{"hp": 1800, "abi": 20, "atk": 140, "def": 140}', NULL, NULL),
	(650, 205, 301, 55, '{"hp": 1300, "abi": 20, "atk": 180, "def": 150}', NULL, NULL),
	(753, 61, 138, 15, '{"atk": 35, "spd": 40}', NULL, NULL),
	(770, 75, 200, 30, '{"hp": 400, "sp": 70, "int": 70}', NULL, NULL),
	(774, 80, 178, 40, '{"hp": 800, "atk": 80, "def": 80}', NULL, NULL),
	(860, 173, 221, 45, '{"sp": 120, "abi": 20, "int": 120}', NULL, NULL),
	(864, 178, 264, 60, '{"hp": 1500, "abi": 20, "atk": 140, "def": 120}', NULL, NULL),
	(868, 180, 237, 45, '{"hp": 1500, "abi": 20, "atk": 120, "def": 120}', NULL, NULL),
	(876, 190, 227, 55, '{"hp": 1200, "sp": 110, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(880, 196, 234, 60, '{"hp": 1700, "abi": 80, "atk": 145, "def": 120}', NULL, NULL),
	(884, 197, 273, 50, '{"abi": 20, "atk": 130, "int": 160, "spd": 110}', NULL, NULL),
	(888, 252, 314, 60, '{"hp": 1650, "abi": 100, "atk": 150, "spd": 150}', 278, NULL),
	(893, 326, 327, 60, '{"abi": 80, "atk": 130, "def": 130, "spd": 120}', NULL, NULL),
	(897, 333, 138, 15, '{"atk": 35, "spd": 40}', NULL, NULL),
	(901, 328, 329, 14, '{"atk": 40, "def": 40}', NULL, NULL),
	(905, 329, 158, 28, '{"def": 75, "spd": 75}', NULL, NULL),
	(909, 330, 244, 55, '{"abi": 40, "atk": 130, "def": 120, "int": 120}', NULL, NULL),
	(916, 345, 346, 16, '{"atk": 60}', NULL, NULL),
	(942, 365, 245, 50, '{"abi": 20, "atk": 145, "spd": 120}', NULL, NULL),
	(766, 73, 155, 30, '{"hp": 300, "atk": 100, "spd": 85}', NULL, 'beast_spirit_of_light'),
	(798, 110, 155, 30, '{"hp": 300, "atk": 100, "spd": 85}', NULL, 'beast_spirit_of_light'),
	(2, 1, 13, 5, '{}', NULL, NULL),
	(3, 1, 6, 8, '{"abi": 5, "atk": 55}', NULL, NULL),
	(742, 52, 118, 16, '{"hp": 300, "def": 30}', NULL, NULL),
	(746, 57, 129, 12, '{"hp": 300}', NULL, NULL),
	(750, 58, 89, 16, '{"hp": 150, "atk": 40}', NULL, NULL),
	(754, 61, 335, 14, '{"sp": 40, "spd": 50}', NULL, NULL),
	(758, 66, 170, 30, '{"hp": 800, "atk": 75}', NULL, NULL),
	(762, 68, 209, 30, '{"hp": 350, "atk": 100, "spd": 75}', NULL, NULL),
	(778, 96, 148, 30, '{"abi": 10, "atk": 80, "spd": 95}', NULL, NULL),
	(782, 97, 180, 28, '{"atk": 75, "def": 75}', NULL, NULL),
	(786, 99, 187, 26, '{"hp": 850, "atk": 60, "int": 60}', NULL, NULL),
	(790, 101, 216, 28, '{"hp": 400, "atk": 90, "spd": 70}', NULL, NULL),
	(794, 104, 330, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(802, 113, 145, 26, '{"def": 110}', NULL, NULL),
	(806, 117, 207, 26, '{"hp": 600, "atk": 60}', NULL, NULL),
	(811, 126, 158, 28, '{"def": 75, "spd": 75}', NULL, NULL),
	(815, 132, 205, 28, '{"atk": 75, "def": 95}', NULL, NULL),
	(819, 135, 161, 30, '{"hp": 400, "atk": 80, "spd": 70}', NULL, NULL),
	(823, 136, 169, 28, '{"atk": 80, "int": 70}', NULL, NULL),
	(827, 136, 204, 30, '{"hp": 450, "atk": 110}', NULL, NULL),
	(831, 142, 218, 60, '{"sp": 130, "abi": 40, "atk": 200, "spd": 100}', NULL, NULL),
	(835, 148, 220, 60, '{"abi": 80, "atk": 120, "spd": 145}', NULL, NULL),
	(839, 157, 250, 50, '{"hp": 1000, "abi": 20, "atk": 130, "def": 110}', NULL, NULL),
	(847, 161, 219, 60, '{"abi": 80, "atk": 150, "def": 170, "int": 135}', NULL, NULL),
	(852, 162, 259, 55, '{"abi": 20, "def": 120, "int": 130, "spd": 130}', NULL, NULL),
	(856, 171, 252, 55, '{"hp": 1300, "abi": 20, "atk": 130, "spd": 130}', NULL, NULL),
	(6, 2, 16, 3, '{"def": 15}', NULL, NULL),
	(8, 3, 12, 3, '{"int": 10}', NULL, NULL),
	(96, 24, 104, 14, '{"hp": 300, "spd": 30}', NULL, NULL),
	(98, 25, 78, 14, '{"atk": 55}', NULL, NULL),
	(100, 25, 84, 15, '{"hp": 150, "spd": 40}', NULL, NULL),
	(102, 25, 137, 16, '{"atk": 55}', NULL, NULL),
	(104, 26, 81, 15, '{"spd": 55}', NULL, NULL),
	(106, 26, 89, 16, '{"hp": 150, "atk": 40}', NULL, NULL),
	(108, 26, 120, 12, '{"atk": 40, "def": 40}', NULL, NULL),
	(110, 27, 85, 15, '{"spd": 50}', NULL, NULL),
	(112, 27, 121, 12, '{"hp": 150, "def": 40}', NULL, NULL),
	(114, 27, 133, 14, '{"hp": 250, "atk": 30}', NULL, NULL),
	(917, 346, 347, 30, '{"hp": 385, "atk": 110}', NULL, NULL),
	(943, 365, 292, 55, '{"abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(67, 18, 68, 15, '{"hp": 150, "atk": 50}', NULL, 'human_spirit_of_flame'),
	(10, 4, 17, 5, '{}', NULL, NULL),
	(11, 5, 11, 5, '{}', NULL, NULL),
	(15, 7, 41, 8, '{"hp": 75, "def": 20}', NULL, NULL),
	(19, 8, 59, 9, '{"hp": 75}', NULL, NULL),
	(23, 9, 27, 7, '{"hp": 75, "atk": 20, "spd": 20}', NULL, NULL),
	(27, 9, 36, 10, '{"atk": 20, "spd": 20}', NULL, NULL),
	(31, 10, 49, 8, '{"spd": 30}', NULL, NULL),
	(33, 11, 46, 7, '{"int": 20, "spd": 20}', NULL, NULL),
	(35, 11, 56, 7, '{"spd": 30}', NULL, NULL),
	(37, 11, 333, 7, '{"sp": 20, "int": 30}', NULL, NULL),
	(39, 12, 39, 8, '{"spd": 30}', NULL, NULL),
	(41, 12, 61, 8, '{"sp": 30, "int": 20}', NULL, NULL),
	(43, 13, 26, 9, '{"atk": 15, "spd": 20}', NULL, NULL),
	(45, 13, 38, 6, '{"spd": 30}', NULL, NULL),
	(47, 14, 50, 8, '{"int": 20, "spd": 20}', NULL, NULL),
	(49, 14, 57, 8, '{"hp": 75, "def": 10}', NULL, NULL),
	(51, 15, 34, 8, '{"hp": 100}', NULL, NULL),
	(53, 15, 55, 8, '{"int": 40}', NULL, NULL),
	(55, 16, 37, 6, '{"hp": 75, "def": 25}', NULL, NULL),
	(57, 16, 45, 7, '{"hp": 75, "def": 30}', NULL, NULL),
	(59, 17, 30, 8, '{"sp": 20, "int": 20}', NULL, NULL),
	(61, 17, 328, 8, '{"atk": 30, "def": 30}', NULL, NULL),
	(63, 18, 105, 15, '{"hp": 150, "atk": 50}', NULL, NULL),
	(65, 18, 114, 14, '{"hp": 150, "atk": 40}', NULL, NULL),
	(69, 19, 91, 16, '{"hp": 150, "atk": 50}', NULL, NULL),
	(71, 19, 112, 14, '{"def": 55}', NULL, NULL),
	(73, 19, 132, 14, '{"atk": 55, "def": 55}', NULL, NULL),
	(77, 21, 100, 14, '{"atk": 30, "def": 40}', NULL, NULL),
	(81, 22, 72, 14, '{"sp": 35, "int": 55}', NULL, NULL),
	(84, 22, 124, 13, '{"sp": 40, "int": 30}', NULL, NULL),
	(88, 23, 95, 12, '{"hp": 130, "sp": 25, "def": 40}', NULL, NULL),
	(90, 23, 120, 12, '{"atk": 40, "def": 40}', NULL, NULL),
	(92, 24, 83, 14, '{"hp": 150, "def": 55}', NULL, NULL),
	(94, 24, 103, 14, '{"def": 30, "int": 40}', NULL, NULL),
	(12, 5, 15, 3, '{"int": 15}', NULL, NULL),
	(14, 7, 29, 7, '{"atk": 30, "spd": 20}', NULL, NULL),
	(16, 7, 47, 9, '{"abi": 20, "atk": 20}', NULL, NULL),
	(123, 29, 91, 16, '{"hp": 150, "atk": 50}', NULL, NULL),
	(125, 29, 131, 14, '{"atk": 40}', NULL, NULL),
	(127, 30, 77, 16, '{"abi": 5, "int": 40}', NULL, NULL),
	(129, 30, 130, 14, '{"spd": 50}', NULL, NULL),
	(133, 31, 89, 16, '{"hp": 150, "atk": 40}', NULL, NULL),
	(137, 32, 70, 15, '{"hp": 150, "def": 40}', NULL, NULL),
	(139, 32, 107, 14, '{"hp": 150, "def": 35}', NULL, NULL),
	(141, 32, 66, 15, '{"hp": 110, "def": 50}', NULL, NULL),
	(918, 347, 348, 55, '{"hp": 1870, "abi": 20, "atk": 175, "def": 140}', NULL, NULL),
	(944, 366, 367, 60, '{"abi": 40, "atk": 180, "int": 180, "spd": 170}', 259, NULL),
	(115, 27, 73, 15, '{"hp": 45, "spd": 55}', NULL, 'human_spirit_of_light'),
	(131, 30, 73, 15, '{"hp": 45, "spd": 55}', NULL, 'human_spirit_of_light'),
	(18, 7, 326, 8, '{"atk": 30, "spd": 20}', NULL, NULL),
	(20, 8, 48, 8, '{"hp": 100}', NULL, NULL),
	(22, 8, 52, 6, '{"spd": 30}', NULL, NULL),
	(24, 9, 28, 6, '{"hp": 80, "atk": 30}', NULL, NULL),
	(26, 9, 53, 6, '{"atk": 20, "spd": 20}', NULL, NULL),
	(28, 9, 58, 8, '{"atk": 35}', NULL, NULL),
	(30, 10, 31, 9, '{"atk": 20, "spd": 20}', NULL, NULL),
	(32, 10, 42, 8, '{"atk": 30, "spd": 20}', NULL, NULL),
	(36, 11, 60, 30, '{"sp": 80, "abi": 80, "int": 130}', NULL, NULL),
	(40, 12, 54, 7, '{"sp": 20, "int": 20}', NULL, NULL),
	(44, 13, 63, 8, '{"atk": 15, "int": 20}', NULL, NULL),
	(48, 14, 64, 8, '{"def": 20}', NULL, NULL),
	(52, 15, 35, 7, '{"def": 15, "int": 20}', NULL, NULL),
	(56, 16, 40, 9, '{"def": 20}', NULL, NULL),
	(60, 17, 44, 8, '{"atk": 20, "spd": 30}', NULL, NULL),
	(64, 18, 106, 12, '{"hp": 150, "def": 40}', NULL, NULL),
	(68, 19, 88, 15, '{"atk": 50, "spd": 20}', NULL, NULL),
	(72, 19, 114, 14, '{"hp": 150, "atk": 40}', NULL, NULL),
	(76, 21, 98, 18, '{"abi": 5}', NULL, NULL),
	(78, 21, 112, 14, '{"def": 55}', NULL, NULL),
	(80, 22, 65, 15, '{"atk": 40, "int": 40}', NULL, NULL),
	(82, 22, 78, 14, '{"atk": 55}', NULL, NULL),
	(85, 22, 128, 16, '{"int": 40}', NULL, NULL),
	(89, 23, 106, 12, '{"hp": 150, "def": 40}', NULL, NULL),
	(93, 24, 94, 14, '{"sp": 40, "int": 40}', NULL, NULL),
	(97, 24, 136, 12, '{"hp": 500}', NULL, NULL),
	(101, 25, 118, 16, '{"hp": 300, "def": 30}', NULL, NULL),
	(105, 26, 86, 15, '{"atk": 35, "spd": 50}', NULL, NULL),
	(109, 26, 137, 16, '{"atk": 55}', NULL, NULL),
	(113, 27, 125, 16, '{"atk": 40, "spd": 35}', NULL, NULL),
	(117, 28, 129, 12, '{"hp": 300}', NULL, NULL),
	(119, 28, 139, 16, '{"abi": 5, "spd": 40}', NULL, NULL),
	(121, 29, 105, 15, '{"hp": 150, "atk": 50}', NULL, NULL),
	(122, 29, 88, 15, '{"atk": 50, "spd": 20}', NULL, NULL),
	(130, 30, 139, 16, '{"abi": 5, "spd": 40}', NULL, NULL),
	(134, 31, 124, 13, '{"sp": 40, "int": 30}', NULL, NULL),
	(237, 55, 94, 14, '{"sp": 40, "int": 40}', NULL, NULL),
	(238, 55, 103, 14, '{"def": 30, "int": 40}', NULL, NULL),
	(240, 55, 129, 12, '{"hp": 300}', NULL, NULL),
	(246, 56, 75, 14, '{"atk": 35, "spd": 45}', NULL, NULL),
	(248, 59, 102, 14, '{"hp": 150, "int": 40}', NULL, NULL),
	(250, 59, 129, 12, '{"hp": 300}', NULL, NULL),
	(252, 60, 116, 16, '{"abi": 5, "atk": 40}', NULL, NULL),
	(254, 62, 74, 14, '{"hp": 500}', NULL, NULL),
	(256, 62, 87, 14, '{"sp": 40, "int": 40, "spd": 40}', NULL, NULL),
	(919, 350, 351, 55, '{"abi": 20, "atk": 165, "def": 130, "spd": 165}', NULL, NULL),
	(945, 259, 367, 60, '{"abi": 40, "atk": 180, "int": 180, "spd": 170}', 366, NULL),
	(126, 29, 68, 15, '{"hp": 150, "atk": 50}', NULL, 'human_spirit_of_flame'),
	(138, 32, 92, 14, '{"int": 35}', NULL, NULL),
	(142, 32, 99, 14, '{"hp": 150, "def": 60}', NULL, NULL),
	(146, 33, 91, 16, '{"hp": 150, "atk": 50}', NULL, NULL),
	(150, 34, 71, 15, '{"hp": 300}', NULL, NULL),
	(154, 34, 109, 15, '{"atk": 45, "spd": 50}', NULL, NULL),
	(156, 35, 83, 14, '{"hp": 150, "def": 55}', NULL, NULL),
	(158, 35, 103, 14, '{"def": 30, "int": 40}', NULL, NULL),
	(163, 37, 131, 14, '{"atk": 40}', NULL, NULL),
	(167, 39, 71, 15, '{"hp": 300}', NULL, NULL),
	(171, 40, 82, 14, '{"def": 40, "int": 40}', NULL, NULL),
	(175, 40, 140, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(179, 41, 106, 12, '{"hp": 150, "def": 40}', NULL, NULL),
	(183, 44, 100, 14, '{"atk": 30, "def": 40}', NULL, NULL),
	(187, 45, 79, 14, '{"def": 55}', NULL, NULL),
	(189, 45, 98, 18, '{"abi": 5}', NULL, NULL),
	(191, 45, 127, 20, '{}', NULL, NULL),
	(195, 46, 122, 14, '{"hp": 40, "int": 40, "spd": 40}', NULL, NULL),
	(197, 46, 134, 13, '{"int": 40, "spd": 40}', NULL, NULL),
	(199, 47, 105, 15, '{"hp": 150, "atk": 50}', NULL, NULL),
	(201, 47, 110, 20, '{"atk": 50, "spd": 50}', NULL, NULL),
	(203, 47, 132, 14, '{"atk": 55, "def": 55}', NULL, NULL),
	(205, 48, 93, 14, '{"atk": 55}', NULL, NULL),
	(207, 48, 118, 16, '{"hp": 300, "def": 30}', NULL, NULL),
	(209, 48, 113, 14, '{"hp": 150, "def": 40}', NULL, NULL),
	(211, 49, 87, 14, '{"sp": 40, "int": 40, "spd": 40}', NULL, NULL),
	(213, 49, 116, 16, '{"abi": 5, "atk": 40}', NULL, NULL),
	(215, 50, 67, 14, '{"spd": 55}', NULL, NULL),
	(217, 50, 87, 14, '{"sp": 40, "int": 40, "spd": 40}', NULL, NULL),
	(221, 51, 76, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(225, 53, 125, 16, '{"atk": 40, "spd": 35}', NULL, NULL),
	(229, 53, 109, 15, '{"atk": 45, "spd": 50}', NULL, NULL),
	(233, 54, 133, 14, '{"hp": 250, "atk": 30}', NULL, NULL),
	(145, 33, 88, 15, '{"atk": 50, "spd": 20}', NULL, NULL),
	(147, 33, 120, 12, '{"atk": 40, "def": 40}', NULL, NULL),
	(234, 54, 139, 16, '{"abi": 5, "spd": 40}', NULL, NULL),
	(236, 55, 83, 14, '{"hp": 150, "def": 55}', NULL, NULL),
	(241, 55, 75, 14, '{"atk": 35, "spd": 45}', NULL, NULL),
	(245, 56, 131, 14, '{"atk": 40}', NULL, NULL),
	(249, 59, 118, 16, '{"hp": 300, "def": 30}', NULL, NULL),
	(253, 60, 213, 55, '{"abi": 80, "atk": 180, "int": 240, "spd": 180}', NULL, NULL),
	(257, 62, 128, 16, '{"int": 40}', NULL, NULL),
	(259, 62, 138, 15, '{"atk": 35, "spd": 40}', NULL, NULL),
	(261, 63, 84, 15, '{"hp": 150, "spd": 40}', NULL, NULL),
	(263, 63, 128, 16, '{"int": 40}', NULL, NULL),
	(265, 63, 117, 14, '{"atk": 45, "spd": 40}', NULL, NULL),
	(920, 348, 352, 60, '{"abi": 40, "atk": 220, "int": 165, "spd": 165}', 351, NULL),
	(946, 379, 380, 16, '{"int": 45}', NULL, NULL),
	(228, 53, 73, 15, '{"hp": 45, "spd": 55}', NULL, 'human_spirit_of_light'),
	(226, 53, 323, 14, '{"atk": 40, "spd": 40}', NULL, 'digi_egg_of_courage'),
	(149, 34, 70, 15, '{"hp": 150, "def": 40}', NULL, NULL),
	(151, 34, 111, 16, '{"sp": 40, "int": 40}', NULL, NULL),
	(153, 34, 66, 15, '{"hp": 110, "def": 50}', NULL, NULL),
	(155, 35, 71, 15, '{"hp": 300}', NULL, NULL),
	(159, 35, 104, 14, '{"hp": 300, "spd": 30}', NULL, NULL),
	(160, 37, 92, 14, '{"int": 35}', NULL, NULL),
	(162, 37, 107, 14, '{"hp": 150, "def": 35}', NULL, NULL),
	(164, 37, 80, 14, '{"hp": 130, "def": 60}', NULL, NULL),
	(166, 39, 84, 15, '{"hp": 150, "spd": 40}', NULL, NULL),
	(168, 39, 115, 16, '{"int": 40}', NULL, NULL),
	(170, 39, 134, 13, '{"int": 40, "spd": 40}', NULL, NULL),
	(172, 40, 93, 14, '{"atk": 55}', NULL, NULL),
	(174, 40, 108, 14, '{"atk": 40, "spd": 55}', NULL, NULL),
	(176, 41, 92, 14, '{"int": 35}', NULL, NULL),
	(178, 41, 90, 16, '{"atk": 55}', NULL, NULL),
	(180, 41, 107, 14, '{"hp": 150, "def": 35}', NULL, NULL),
	(182, 44, 79, 14, '{"def": 55}', NULL, NULL),
	(184, 44, 119, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(186, 44, 135, 15, '{"hp": 130, "atk": 50}', NULL, NULL),
	(188, 45, 92, 14, '{"int": 35}', NULL, NULL),
	(192, 46, 76, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(196, 46, 139, 16, '{"abi": 5, "spd": 40}', NULL, NULL),
	(200, 47, 127, 20, '{}', NULL, NULL),
	(204, 48, 74, 14, '{"hp": 500}', NULL, NULL),
	(208, 48, 129, 12, '{"hp": 300}', NULL, NULL),
	(216, 50, 82, 14, '{"def": 40, "int": 40}', NULL, NULL),
	(218, 50, 122, 14, '{"hp": 40, "int": 40, "spd": 40}', NULL, NULL),
	(220, 51, 67, 14, '{"spd": 55}', NULL, NULL),
	(222, 51, 108, 14, '{"atk": 40, "spd": 55}', NULL, NULL),
	(224, 53, 76, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(230, 54, 111, 16, '{"sp": 40, "int": 40}', NULL, NULL),
	(232, 54, 125, 16, '{"atk": 40, "spd": 35}', NULL, NULL),
	(262, 63, 116, 16, '{"abi": 5, "atk": 40}', NULL, NULL),
	(266, 64, 65, 15, '{"atk": 40, "int": 40}', NULL, NULL),
	(270, 64, 140, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(921, 351, 352, 60, '{"abi": 40, "atk": 220, "int": 165, "spd": 165}', 348, NULL),
	(356, 91, 180, 28, '{"atk": 75, "def": 75}', NULL, NULL),
	(360, 92, 217, 28, '{"sp": 75, "int": 100}', NULL, NULL),
	(364, 94, 179, 26, '{"hp": 900}', NULL, NULL),
	(368, 95, 167, 28, '{"sp": 70, "atk": 70, "def": 80}', NULL, NULL),
	(372, 98, 275, 65, '{"abi": 10}', NULL, NULL),
	(374, 100, 183, 28, '{"sp": 60, "int": 85}', NULL, NULL),
	(378, 102, 212, 30, '{"int": 75, "spd": 75}', NULL, NULL),
	(380, 103, 194, 28, '{"hp": 850, "def": 75, "int": 75}', NULL, NULL),
	(382, 103, 330, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(384, 105, 168, 28, '{"atk": 120, "def": 85, "spd": 70}', NULL, NULL),
	(386, 105, 159, 30, '{"hp": 400, "abi": 10, "atk": 125}', NULL, NULL),
	(388, 106, 167, 28, '{"sp": 70, "atk": 70, "def": 80}', NULL, NULL),
	(390, 107, 167, 28, '{"sp": 70, "atk": 70, "def": 80}', NULL, NULL),
	(392, 107, 206, 26, '{"def": 80, "int": 65}', NULL, NULL),
	(394, 107, 162, 30, '{"sp": 60, "atk": 70}', NULL, NULL),
	(396, 108, 153, 26, '{"atk": 95, "def": 90}', NULL, NULL),
	(398, 108, 175, 30, '{"hp": 400, "atk": 90, "spd": 75}', 76, NULL),
	(947, 380, 368, 30, '{"sp": 85, "abi": 10, "int": 110}', NULL, NULL),
	(948, 380, 385, 30, '{"int": 85, "spd": 85}', NULL, NULL),
	(951, 383, 384, 16, '{"hp": 330, "def": 35}', NULL, NULL),
	(952, 384, 385, 30, '{"int": 85, "spd": 85}', NULL, NULL),
	(953, 385, 369, 55, '{"sp": 130, "abi": 20, "int": 130}', NULL, NULL),
	(344, 88, 149, 30, '{"hp": 500, "atk": 120, "def": 60}', NULL, 'beast_spirit_of_flame'),
	(274, 65, 214, 30, '{"sp": 75, "abi": 10, "int": 95}', NULL, NULL),
	(278, 67, 154, 30, '{"atk": 75, "spd": 75}', NULL, NULL),
	(282, 70, 145, 26, '{"def": 110}', NULL, NULL),
	(286, 70, 159, 30, '{"hp": 400, "abi": 10, "atk": 125}', NULL, NULL),
	(291, 72, 147, 30, '{"abi": 10, "atk": 70, "int": 90}', NULL, NULL),
	(293, 72, 217, 28, '{"sp": 75, "int": 100}', NULL, NULL),
	(297, 74, 187, 26, '{"hp": 850, "atk": 60, "int": 60}', NULL, NULL),
	(299, 76, 195, 30, '{"sp": 80, "abi": 10, "int": 80}', NULL, NULL),
	(303, 77, 154, 30, '{"atk": 75, "spd": 75}', NULL, NULL),
	(307, 77, 189, 26, '{"sp": 65, "int": 65}', NULL, NULL),
	(311, 78, 169, 28, '{"atk": 80, "int": 70}', NULL, NULL),
	(315, 79, 206, 26, '{"def": 80, "int": 65}', NULL, NULL),
	(319, 81, 215, 28, '{"atk": 90, "spd": 85}', NULL, NULL),
	(322, 82, 210, 30, '{"sp": 75, "int": 75}', NULL, NULL),
	(324, 83, 191, 32, '{}', NULL, NULL),
	(326, 84, 143, 28, '{"atk": 65, "int": 75, "spd": 85}', NULL, NULL),
	(328, 84, 211, 28, '{"atk": 75, "spd": 75}', NULL, NULL),
	(330, 85, 181, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(332, 85, 215, 28, '{"atk": 90, "spd": 85}', NULL, NULL),
	(334, 86, 198, 26, '{"atk": 75, "spd": 80}', NULL, NULL),
	(336, 86, 186, 26, '{"atk": 65, "def": 65}', NULL, NULL),
	(338, 87, 207, 26, '{"hp": 600, "atk": 60}', NULL, NULL),
	(340, 88, 156, 26, '{"hp": 800, "atk": 75, "def": 95}', NULL, NULL),
	(348, 89, 142, 30, '{"atk": 110, "int": 85}', NULL, NULL),
	(352, 90, 204, 30, '{"hp": 450, "atk": 110}', NULL, NULL),
	(269, 64, 108, 14, '{"atk": 40, "spd": 55}', NULL, NULL),
	(922, 353, 354, 15, '{"atk": 55, "spd": 20}', NULL, NULL),
	(949, 368, 381, 55, '{"sp": 130, "abi": 40, "def": 130, "int": 160}', NULL, NULL),
	(950, 359, 382, 60, '{"sp": 220, "abi": 80, "int": 275, "spd": 145}', NULL, NULL),
	(271, 64, 126, 15, '{"sp": 40, "spd": 40}', NULL, NULL),
	(335, 86, 216, 28, '{"hp": 400, "atk": 90, "spd": 70}', NULL, NULL),
	(339, 87, 214, 30, '{"sp": 75, "abi": 10, "int": 95}', NULL, NULL),
	(341, 88, 202, 30, '{"atk": 105, "spd": 75}', NULL, NULL),
	(343, 88, 205, 28, '{"atk": 75, "def": 95}', NULL, NULL),
	(345, 89, 146, 30, '{"atk": 95, "spd": 80}', NULL, NULL),
	(347, 89, 172, 30, '{"sp": 60, "int": 75, "spd": 60}', NULL, NULL),
	(349, 90, 168, 28, '{"atk": 120, "def": 85, "spd": 70}', NULL, NULL),
	(351, 90, 203, 30, '{"hp": 350, "atk": 100}', NULL, NULL),
	(353, 91, 181, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(355, 91, 204, 30, '{"hp": 450, "atk": 110}', NULL, NULL),
	(357, 92, 144, 28, '{"atk": 75, "def": 75, "int": 75}', NULL, NULL),
	(359, 92, 183, 28, '{"sp": 60, "int": 85}', NULL, NULL),
	(361, 93, 153, 26, '{"atk": 95, "def": 90}', NULL, NULL),
	(363, 93, 165, 28, '{"hp": 800, "def": 70}', NULL, NULL),
	(365, 94, 194, 28, '{"hp": 850, "def": 75, "int": 75}', NULL, NULL),
	(367, 95, 151, 26, '{"sp": 75, "def": 75, "spd": 65}', NULL, NULL),
	(369, 95, 206, 26, '{"def": 80, "int": 65}', NULL, NULL),
	(371, 98, 193, 26, '{"sp": 85}', NULL, NULL),
	(373, 100, 181, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(377, 102, 210, 30, '{"sp": 75, "int": 75}', NULL, NULL),
	(273, 65, 165, 28, '{"hp": 800, "def": 70}', NULL, NULL),
	(275, 65, 142, 30, '{"atk": 110, "int": 85}', NULL, NULL),
	(277, 67, 150, 30, '{"atk": 75, "spd": 95}', NULL, NULL),
	(279, 67, 166, 30, '{"atk": 60, "int": 75, "spd": 75}', 115, NULL),
	(281, 67, 189, 26, '{"sp": 65, "int": 65}', NULL, NULL),
	(283, 70, 164, 30, '{"def": 75, "int": 65}', 77, NULL),
	(285, 70, 195, 30, '{"sp": 80, "abi": 10, "int": 80}', NULL, NULL),
	(287, 71, 170, 30, '{"hp": 800, "atk": 75}', NULL, NULL),
	(289, 71, 198, 26, '{"atk": 75, "spd": 80}', NULL, NULL),
	(290, 71, 180, 28, '{"atk": 75, "def": 75}', NULL, NULL),
	(294, 72, 190, 28, '{"sp": 80, "int": 80}', NULL, NULL),
	(298, 76, 184, 30, '{"atk": 90, "def": 60, "spd": 75}', 108, NULL),
	(300, 76, 209, 30, '{"hp": 350, "atk": 100, "spd": 75}', NULL, NULL),
	(302, 76, 175, 30, '{"hp": 400, "atk": 90, "spd": 75}', 108, NULL),
	(304, 77, 164, 30, '{"def": 75, "int": 65}', 70, NULL),
	(306, 77, 171, 30, '{"atk": 90, "spd": 80}', NULL, NULL),
	(308, 78, 176, 30, '{"hp": 700, "def": 75}', NULL, NULL),
	(310, 78, 215, 28, '{"atk": 90, "spd": 85}', NULL, NULL),
	(312, 79, 144, 28, '{"atk": 75, "def": 75, "int": 75}', NULL, NULL),
	(314, 79, 183, 28, '{"sp": 60, "int": 85}', NULL, NULL),
	(316, 79, 157, 26, '{"hp": 700, "def": 85}', NULL, NULL),
	(318, 81, 198, 26, '{"atk": 75, "spd": 80}', NULL, NULL),
	(320, 82, 141, 28, '{"hp": 400, "def": 95}', NULL, NULL),
	(323, 83, 179, 26, '{"hp": 900}', NULL, NULL),
	(327, 84, 202, 30, '{"atk": 105, "spd": 75}', NULL, NULL),
	(385, 105, 209, 30, '{"hp": 350, "atk": 100, "spd": 75}', NULL, NULL),
	(923, 354, 355, 30, '{"atk": 115, "spd": 80}', NULL, NULL),
	(389, 106, 193, 26, '{"sp": 85}', NULL, NULL),
	(393, 107, 157, 26, '{"hp": 700, "def": 85}', NULL, NULL),
	(397, 108, 184, 30, '{"atk": 90, "def": 60, "spd": 75}', 76, NULL),
	(468, 131, 196, 26, '{"atk": 80, "def": 75}', NULL, NULL),
	(470, 133, 170, 30, '{"hp": 800, "atk": 75}', NULL, NULL),
	(472, 133, 162, 30, '{"sp": 60, "atk": 70}', NULL, NULL),
	(474, 137, 160, 26, '{"hp": 400, "atk": 95}', NULL, NULL),
	(476, 137, 203, 30, '{"hp": 350, "atk": 100}', NULL, NULL),
	(478, 139, 174, 30, '{"sp": 75, "abi": 10, "spd": 100}', NULL, NULL),
	(480, 139, 211, 28, '{"atk": 75, "spd": 75}', NULL, NULL),
	(482, 140, 153, 26, '{"atk": 95, "def": 90}', NULL, NULL),
	(484, 140, 211, 28, '{"atk": 75, "spd": 75}', NULL, NULL),
	(487, 141, 285, 55, '{"hp": 900, "sp": 120, "abi": 20, "int": 145}', NULL, NULL),
	(489, 143, 259, 55, '{"abi": 20, "def": 120, "int": 130, "spd": 130}', NULL, NULL),
	(491, 143, 242, 55, '{"hp": 1100, "sp": 100, "abi": 40, "int": 100}', NULL, NULL),
	(495, 145, 221, 45, '{"sp": 120, "abi": 20, "int": 120}', NULL, NULL),
	(496, 145, 259, 55, '{"abi": 20, "def": 120, "int": 130, "spd": 130}', NULL, NULL),
	(505, 147, 218, 60, '{"sp": 130, "abi": 40, "atk": 200, "spd": 100}', NULL, NULL),
	(507, 150, 220, 60, '{"abi": 80, "atk": 120, "spd": 145}', NULL, NULL),
	(509, 150, 304, 55, '{"abi": 20, "atk": 130, "spd": 160}', NULL, NULL),
	(511, 151, 273, 50, '{"abi": 20, "atk": 130, "int": 160, "spd": 110}', NULL, NULL),
	(954, 21, 397, 14, '{"atk": 35, "spd": 35}', NULL, 'digi_egg_of_reliability'),
	(401, 111, 217, 28, '{"sp": 75, "int": 100}', NULL, NULL),
	(403, 112, 156, 26, '{"hp": 800, "atk": 75, "def": 95}', NULL, NULL),
	(406, 112, 196, 26, '{"atk": 80, "def": 75}', NULL, NULL),
	(410, 114, 205, 28, '{"atk": 75, "def": 95}', NULL, NULL),
	(414, 115, 186, 26, '{"atk": 65, "def": 65}', NULL, NULL),
	(418, 116, 204, 30, '{"hp": 450, "atk": 110}', NULL, NULL),
	(422, 118, 212, 30, '{"int": 75, "spd": 75}', NULL, NULL),
	(426, 119, 161, 30, '{"hp": 400, "atk": 80, "spd": 70}', NULL, NULL),
	(430, 121, 151, 26, '{"sp": 75, "def": 75, "spd": 65}', NULL, NULL),
	(434, 122, 154, 30, '{"atk": 75, "spd": 75}', NULL, NULL),
	(438, 122, 189, 26, '{"sp": 65, "int": 65}', NULL, NULL),
	(442, 124, 214, 30, '{"sp": 75, "abi": 10, "int": 95}', NULL, NULL),
	(444, 124, 197, 28, '{"atk": 75, "spd": 80}', NULL, NULL),
	(446, 125, 163, 28, '{"hp": 400, "atk": 75, "spd": 75}', NULL, NULL),
	(448, 125, 205, 28, '{"atk": 75, "def": 95}', NULL, NULL),
	(450, 127, 193, 26, '{"sp": 85}', NULL, NULL),
	(452, 127, 157, 26, '{"hp": 700, "def": 85}', NULL, NULL),
	(454, 128, 182, 30, '{"atk": 75, "def": 75}', NULL, NULL),
	(456, 128, 216, 28, '{"hp": 400, "atk": 90, "spd": 70}', NULL, NULL),
	(458, 129, 176, 30, '{"hp": 700, "def": 75}', NULL, NULL),
	(460, 130, 143, 28, '{"atk": 65, "int": 75, "spd": 85}', NULL, NULL),
	(462, 130, 208, 30, '{"sp": 75, "spd": 90}', NULL, NULL),
	(464, 131, 185, 28, '{"hp": 350, "atk": 75, "spd": 75}', NULL, NULL),
	(402, 112, 144, 28, '{"atk": 75, "def": 75, "int": 75}', NULL, NULL),
	(405, 112, 182, 30, '{"atk": 75, "def": 75}', NULL, NULL),
	(407, 114, 199, 26, '{"atk": 75, "def": 80}', NULL, NULL),
	(409, 114, 204, 30, '{"hp": 450, "atk": 110}', NULL, NULL),
	(411, 115, 152, 30, '{"sp": 75, "abi": 10, "int": 100}', NULL, NULL),
	(471, 133, 207, 26, '{"hp": 600, "atk": 60}', NULL, NULL),
	(475, 137, 185, 28, '{"hp": 350, "atk": 75, "spd": 75}', NULL, NULL),
	(479, 139, 188, 26, '{"sp": 75, "int": 80, "spd": 80}', NULL, NULL),
	(483, 140, 158, 28, '{"def": 75, "spd": 75}', NULL, NULL),
	(485, 141, 237, 45, '{"hp": 1500, "abi": 20, "atk": 120, "def": 120}', NULL, NULL),
	(486, 141, 280, 50, '{"hp": 1100, "abi": 20, "def": 150, "int": 120}', NULL, NULL),
	(490, 143, 260, 55, '{"hp": 1100, "abi": 20, "atk": 180, "spd": 130}', NULL, NULL),
	(492, 144, 241, 60, '{"sp": 110, "abi": 80, "def": 180, "int": 140}', NULL, NULL),
	(494, 144, 269, 55, '{"abi": 20, "atk": 100, "def": 130, "int": 100}', NULL, NULL),
	(497, 145, 296, 45, '{"sp": 100, "abi": 20, "atk": 120, "def": 140}', NULL, NULL),
	(498, 146, 227, 55, '{"hp": 1200, "sp": 110, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(504, 147, 273, 50, '{"abi": 20, "atk": 130, "int": 160, "spd": 110}', NULL, NULL),
	(512, 151, 275, 65, '{"abi": 10}', NULL, NULL),
	(516, 152, 229, 55, '{"sp": 120, "abi": 40, "def": 120, "int": 145}', NULL, NULL),
	(520, 153, 237, 45, '{"hp": 1500, "abi": 20, "atk": 120, "def": 120}', NULL, NULL),
	(524, 154, 284, 50, '{"abi": 20, "int": 130, "spd": 150}', NULL, NULL),
	(526, 154, 226, 55, '{"sp": 120, "abi": 40, "int": 145, "spd": 130}', NULL, NULL),
	(528, 156, 239, 50, '{"abi": 20, "def": 160, "spd": 120}', NULL, NULL),
	(924, 355, 356, 55, '{"hp": 1870, "abi": 40, "atk": 200}', NULL, NULL),
	(437, 122, 149, 30, '{"hp": 500, "atk": 120, "def": 60}', NULL, 'beast_spirit_of_flame'),
	(467, 131, 149, 30, '{"hp": 500, "atk": 120, "def": 60}', NULL, 'beast_spirit_of_flame'),
	(955, 46, 398, 14, '{"int": 40, "spd": 40}', NULL, 'digi_egg_of_hope'),
	(413, 115, 212, 30, '{"int": 75, "spd": 75}', NULL, NULL),
	(415, 116, 146, 30, '{"atk": 95, "spd": 80}', NULL, NULL),
	(417, 116, 192, 28, '{"hp": 400, "atk": 80, "int": 70}', NULL, NULL),
	(419, 116, 169, 28, '{"atk": 80, "int": 70}', NULL, NULL),
	(421, 118, 198, 26, '{"atk": 75, "spd": 80}', NULL, NULL),
	(423, 119, 174, 30, '{"sp": 75, "abi": 10, "spd": 100}', NULL, NULL),
	(425, 119, 209, 30, '{"hp": 350, "atk": 100, "spd": 75}', NULL, NULL),
	(427, 120, 145, 26, '{"def": 110}', NULL, NULL),
	(429, 120, 176, 30, '{"hp": 700, "def": 75}', NULL, NULL),
	(431, 121, 191, 32, '{}', NULL, NULL),
	(433, 122, 150, 30, '{"atk": 75, "spd": 95}', NULL, NULL),
	(439, 124, 147, 30, '{"abi": 10, "atk": 70, "int": 90}', NULL, NULL),
	(441, 124, 192, 28, '{"hp": 400, "atk": 80, "int": 70}', NULL, NULL),
	(443, 124, 190, 28, '{"sp": 80, "int": 80}', NULL, NULL),
	(447, 125, 202, 30, '{"atk": 105, "spd": 75}', NULL, NULL),
	(451, 127, 206, 26, '{"def": 80, "int": 65}', NULL, NULL),
	(455, 128, 214, 30, '{"sp": 75, "abi": 10, "int": 95}', NULL, NULL),
	(459, 129, 210, 30, '{"sp": 75, "int": 75}', NULL, NULL),
	(463, 131, 177, 28, '{"hp": 500, "atk": 95}', NULL, NULL),
	(517, 152, 285, 55, '{"hp": 900, "sp": 120, "abi": 20, "int": 145}', NULL, NULL),
	(519, 152, 225, 50, '{"abi": 20, "atk": 130, "int": 130, "spd": 160}', NULL, NULL),
	(521, 153, 260, 55, '{"hp": 1100, "abi": 20, "atk": 180, "spd": 130}', NULL, NULL),
	(523, 154, 250, 50, '{"hp": 1000, "abi": 20, "atk": 130, "def": 110}', NULL, NULL),
	(529, 156, 294, 50, '{"hp": 1300, "abi": 20, "atk": 130, "def": 130}', NULL, NULL),
	(533, 156, 295, 55, '{"hp": 1700, "abi": 40, "atk": 180}', NULL, NULL),
	(537, 160, 245, 50, '{"abi": 20, "atk": 145, "spd": 120}', NULL, NULL),
	(541, 163, 219, 60, '{"abi": 80, "atk": 150, "def": 170, "int": 135}', NULL, NULL),
	(578, 179, 279, 50, '{"sp": 100, "abi": 20, "def": 120, "int": 145}', NULL, NULL),
	(582, 181, 251, 60, '{"abi": 80, "def": 140, "int": 120, "spd": 150}', NULL, NULL),
	(586, 182, 306, 60, '{"abi": 80, "atk": 120, "int": 135, "spd": 150}', NULL, NULL),
	(588, 183, 239, 50, '{"abi": 20, "def": 160, "spd": 120}', NULL, NULL),
	(592, 185, 245, 50, '{"abi": 20, "atk": 145, "spd": 120}', NULL, NULL),
	(594, 185, 292, 55, '{"abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(596, 187, 286, 50, '{"abi": 20, "atk": 145, "def": 100}', NULL, NULL),
	(598, 188, 229, 55, '{"sp": 120, "abi": 40, "def": 120, "int": 145}', NULL, NULL),
	(600, 188, 290, 50, '{"sp": 110, "abi": 20, "int": 135}', NULL, NULL),
	(602, 191, 277, 45, '{"abi": 20, "def": 150}', NULL, NULL),
	(606, 192, 286, 50, '{"abi": 20, "atk": 145, "def": 100}', NULL, NULL),
	(608, 193, 221, 45, '{"sp": 120, "abi": 20, "int": 120}', NULL, NULL),
	(610, 193, 280, 50, '{"hp": 1100, "abi": 20, "def": 150, "int": 120}', NULL, NULL),
	(612, 194, 290, 50, '{"sp": 110, "abi": 20, "int": 135}', NULL, NULL),
	(614, 194, 268, 55, '{"hp": 1000, "sp": 100, "abi": 20, "int": 130}', NULL, NULL),
	(624, 199, 228, 55, '{"hp": 1700, "abi": 20, "atk": 160, "def": 130}', NULL, NULL),
	(626, 199, 277, 45, '{"abi": 20, "def": 150}', NULL, NULL),
	(628, 200, 299, 50, '{"sp": 120, "abi": 20, "def": 120, "int": 120}', NULL, NULL),
	(632, 201, 276, 55, '{"hp": 1800, "abi": 20, "atk": 140, "def": 140}', NULL, NULL),
	(640, 202, 295, 55, '{"hp": 1700, "abi": 40, "atk": 180}', NULL, NULL),
	(644, 204, 228, 55, '{"hp": 1700, "abi": 20, "atk": 160, "def": 130}', NULL, NULL),
	(925, 355, 357, 60, '{"abi": 80, "atk": 155, "def": 155, "int": 155}', NULL, NULL),
	(956, 380, 399, 24, '{"def": 65, "int": 65}', NULL, 'digi_egg_of_light'),
	(545, 164, 232, 60, '{"abi": 40, "atk": 130, "def": 130, "int": 130}', NULL, NULL),
	(549, 165, 274, 50, '{"abi": 20, "atk": 130, "def": 130, "int": 130}', NULL, NULL),
	(557, 167, 275, 65, '{"abi": 10}', NULL, NULL),
	(559, 168, 257, 55, '{"hp": 1400, "abi": 20, "atk": 150, "int": 120}', NULL, NULL),
	(561, 170, 224, 50, '{"hp": 1700, "abi": 20, "atk": 130, "def": 130, "int": 120}', NULL, NULL),
	(563, 170, 297, 55, '{"abi": 20, "atk": 130, "def": 120, "spd": 150}', NULL, NULL),
	(565, 172, 236, 55, '{"sp": 120, "abi": 20, "int": 135, "spd": 120}', NULL, NULL),
	(567, 172, 259, 55, '{"abi": 20, "def": 120, "int": 130, "spd": 130}', NULL, NULL),
	(574, 177, 234, 60, '{"hp": 1700, "abi": 80, "atk": 145, "def": 120}', NULL, NULL),
	(616, 195, 253, 55, '{"sp": 130, "abi": 40, "def": 130, "int": 150}', NULL, NULL),
	(620, 198, 254, 50, '{"abi": 20, "def": 130, "spd": 130}', NULL, NULL),
	(622, 198, 292, 55, '{"abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(534, 158, 239, 50, '{"abi": 20, "def": 160, "spd": 120}', NULL, NULL),
	(536, 158, 256, 50, '{"hp": 1000, "abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(538, 160, 265, 60, '{"sp": 100, "abi": 80, "int": 120, "spd": 140}', NULL, NULL),
	(540, 160, 270, 50, '{"abi": 20, "atk": 120, "def": 135}', NULL, NULL),
	(544, 164, 224, 50, '{"hp": 1700, "abi": 20, "atk": 130, "def": 130, "int": 120}', NULL, NULL),
	(546, 164, 243, 55, '{"sp": 120, "abi": 40, "int": 145, "spd": 100}', NULL, NULL),
	(548, 165, 237, 45, '{"hp": 1500, "abi": 20, "atk": 120, "def": 120}', NULL, NULL),
	(550, 166, 246, 55, '{"sp": 120, "abi": 20, "int": 120, "spd": 120}', NULL, NULL),
	(577, 179, 224, 50, '{"hp": 1700, "abi": 20, "atk": 130, "def": 130, "int": 120}', NULL, NULL),
	(579, 179, 302, 60, '{"hp": 2000, "sp": 140, "abi": 80, "atk": 140, "def": 140, "int": 140}', NULL, NULL),
	(581, 181, 219, 60, '{"abi": 80, "atk": 150, "def": 170, "int": 135}', NULL, NULL),
	(583, 181, 267, 50, '{"hp": 1600, "abi": 20, "atk": 160}', NULL, NULL),
	(585, 182, 265, 60, '{"sp": 100, "abi": 80, "int": 120, "spd": 140}', NULL, NULL),
	(591, 184, 222, 55, '{"hp": 1600, "abi": 20, "def": 150, "spd": 150}', NULL, NULL),
	(595, 187, 274, 50, '{"abi": 20, "atk": 130, "def": 130, "int": 130}', NULL, NULL),
	(599, 188, 284, 50, '{"abi": 20, "int": 130, "spd": 150}', NULL, NULL),
	(603, 191, 296, 45, '{"sp": 100, "abi": 20, "atk": 120, "def": 140}', NULL, NULL),
	(607, 192, 255, 50, '{"abi": 20, "atk": 150, "def": 140}', NULL, NULL),
	(611, 194, 279, 50, '{"sp": 100, "abi": 20, "def": 120, "int": 145}', NULL, NULL),
	(619, 195, 244, 55, '{"abi": 40, "atk": 130, "def": 120, "int": 120}', NULL, NULL),
	(623, 198, 300, 55, '{"abi": 20, "atk": 130, "int": 110, "spd": 160}', NULL, NULL),
	(631, 201, 220, 60, '{"abi": 80, "atk": 120, "spd": 145}', NULL, NULL),
	(633, 201, 294, 50, '{"hp": 1300, "abi": 20, "atk": 130, "def": 130}', NULL, NULL),
	(637, 202, 262, 60, '{"abi": 80, "atk": 140, "def": 140, "int": 140}', NULL, NULL),
	(639, 202, 255, 50, '{"abi": 20, "atk": 150, "def": 140}', NULL, NULL),
	(641, 203, 228, 55, '{"hp": 1700, "abi": 20, "atk": 160, "def": 130}', NULL, NULL),
	(643, 203, 301, 55, '{"hp": 1300, "abi": 20, "atk": 180, "def": 150}', NULL, NULL),
	(645, 204, 230, 50, '{"abi": 20, "atk": 120, "def": 100, "spd": 100}', NULL, NULL),
	(647, 204, 242, 55, '{"hp": 1100, "sp": 100, "abi": 40, "int": 100}', NULL, NULL),
	(652, 206, 221, 45, '{"sp": 120, "abi": 20, "int": 120}', NULL, NULL),
	(656, 207, 246, 55, '{"sp": 120, "abi": 20, "int": 120, "spd": 120}', NULL, NULL),
	(926, 214, 360, 60, '{"hp": 1900, "abi": 80, "int": 250, "spd": 140}', NULL, NULL),
	(552, 166, 284, 50, '{"abi": 20, "int": 130, "spd": 150}', NULL, NULL),
	(554, 166, 240, 50, '{"sp": 110, "abi": 20, "int": 140}', NULL, NULL),
	(558, 168, 248, 55, '{"abi": 20, "atk": 140, "spd": 130}', NULL, NULL),
	(562, 170, 290, 50, '{"sp": 110, "abi": 20, "int": 135}', NULL, NULL),
	(566, 172, 246, 55, '{"sp": 120, "abi": 20, "int": 120, "spd": 120}', NULL, NULL),
	(569, 174, 253, 55, '{"sp": 130, "abi": 40, "def": 130, "int": 150}', NULL, NULL),
	(571, 176, 257, 55, '{"hp": 1400, "abi": 20, "atk": 150, "int": 120}', NULL, NULL),
	(573, 176, 291, 55, '{"abi": 20, "atk": 150, "spd": 140}', NULL, NULL),
	(627, 200, 279, 50, '{"sp": 100, "abi": 20, "def": 120, "int": 145}', NULL, NULL),
	(629, 200, 302, 60, '{"hp": 2000, "sp": 140, "abi": 80, "atk": 140, "def": 140, "int": 140}', NULL, NULL),
	(651, 205, 278, 55, '{"hp": 1500, "abi": 20, "atk": 160, "def": 140}', NULL, NULL),
	(653, 206, 269, 55, '{"abi": 20, "atk": 100, "def": 130, "int": 100}', NULL, NULL),
	(655, 207, 245, 50, '{"abi": 20, "atk": 145, "spd": 120}', NULL, NULL),
	(927, 359, 361, 60, '{"hp": 2090, "abi": 80, "int": 275, "spd": 150}', NULL, NULL),
	(759, 68, 149, 30, '{"hp": 500, "atk": 120, "def": 60}', NULL, 'beast_spirit_of_flame'),
	(657, 207, 291, 55, '{"abi": 20, "atk": 150, "spd": 140}', NULL, NULL),
	(661, 208, 226, 55, '{"sp": 120, "abi": 40, "int": 145, "spd": 130}', NULL, NULL),
	(727, 38, 120, 12, '{"atk": 40, "def": 40}', NULL, NULL),
	(729, 42, 69, 16, '{"atk": 50, "int": 40}', NULL, NULL),
	(731, 42, 136, 12, '{"hp": 500}', NULL, NULL),
	(733, 42, 116, 16, '{"abi": 5, "atk": 40}', NULL, NULL),
	(736, 43, 125, 16, '{"atk": 40, "spd": 35}', NULL, NULL),
	(738, 52, 80, 14, '{"hp": 130, "def": 60}', NULL, NULL),
	(740, 52, 108, 14, '{"atk": 40, "spd": 55}', NULL, NULL),
	(744, 57, 74, 14, '{"hp": 500}', NULL, NULL),
	(752, 61, 101, 15, '{"atk": 50, "spd": 55}', NULL, NULL),
	(755, 61, 115, 16, '{"int": 40}', NULL, NULL),
	(757, 66, 185, 28, '{"hp": 350, "atk": 75, "spd": 75}', NULL, NULL),
	(761, 68, 177, 28, '{"hp": 500, "atk": 95}', NULL, NULL),
	(763, 69, 142, 30, '{"atk": 110, "int": 85}', NULL, NULL),
	(765, 69, 146, 30, '{"atk": 95, "spd": 80}', NULL, NULL),
	(767, 73, 182, 30, '{"atk": 75, "def": 75}', NULL, NULL),
	(769, 75, 148, 30, '{"abi": 10, "atk": 80, "spd": 95}', NULL, NULL),
	(771, 75, 201, 26, '{"hp": 400, "atk": 95, "spd": 75}', NULL, NULL),
	(663, 209, 230, 50, '{"abi": 20, "atk": 120, "def": 100, "spd": 100}', NULL, NULL),
	(665, 209, 252, 55, '{"hp": 1300, "abi": 20, "atk": 130, "spd": 130}', NULL, NULL),
	(667, 210, 307, 55, '{"sp": 120, "abi": 20, "int": 120}', NULL, NULL),
	(669, 211, 254, 50, '{"abi": 20, "def": 130, "spd": 130}', NULL, NULL),
	(673, 212, 307, 55, '{"sp": 120, "abi": 20, "int": 120}', NULL, NULL),
	(681, 215, 298, 55, '{"abi": 20, "def": 135, "spd": 125}', NULL, NULL),
	(685, 216, 300, 55, '{"abi": 20, "atk": 130, "int": 110, "spd": 160}', NULL, NULL),
	(689, 219, 312, 60, '{"abi": 80, "atk": 180, "def": 170, "int": 150}', 331, NULL),
	(693, 228, 315, 60, '{"abi": 40, "atk": 200, "int": 150, "spd": 150}', 297, NULL),
	(697, 265, 266, 0, '{}', NULL, NULL),
	(701, 273, 332, 99, '{"abi": 120}', NULL, NULL),
	(705, 281, 282, 80, '{"hp": 2100, "abi": 100, "atk": 300, "spd": 220}', NULL, NULL),
	(711, 298, 316, 60, '{"hp": 1500, "abi": 40, "atk": 150, "def": 200}', 276, NULL),
	(713, 304, 305, 60, '{"sp": 160, "abi": 30, "spd": 250}', NULL, NULL),
	(773, 80, 161, 30, '{"hp": 400, "atk": 80, "spd": 70}', NULL, NULL),
	(715, 321, 283, 0, '{}', NULL, NULL),
	(717, 6, 20, 6, '{"atk": 90, "spd": 20}', NULL, NULL),
	(719, 20, 89, 16, '{"hp": 150, "atk": 40}', NULL, NULL),
	(721, 36, 110, 20, '{"atk": 50, "spd": 50}', NULL, NULL),
	(723, 36, 98, 18, '{"abi": 5}', NULL, NULL),
	(725, 38, 136, 12, '{"hp": 500}', NULL, NULL),
	(664, 209, 248, 55, '{"abi": 20, "atk": 140, "spd": 130}', NULL, NULL),
	(668, 210, 309, 55, '{"abi": 20, "int": 170, "spd": 130}', NULL, NULL),
	(928, 15, 363, 8, '{"hp": 75, "atk": 20}', NULL, NULL),
	(670, 211, 256, 50, '{"hp": 1000, "abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(777, 80, 324, 60, '{"abi": 80, "atk": 120, "def": 145}', NULL, 'digi_egg_of_miracles'),
	(672, 212, 285, 55, '{"hp": 900, "sp": 120, "abi": 20, "int": 145}', NULL, NULL),
	(676, 214, 289, 60, '{"sp": 120, "abi": 80, "atk": 120, "int": 120}', 152, NULL),
	(730, 42, 101, 15, '{"atk": 50, "spd": 55}', NULL, NULL),
	(734, 43, 96, 14, '{"atk": 60, "spd": 25}', NULL, NULL),
	(735, 43, 97, 14, '{"atk": 40, "def": 25, "spd": 40}', NULL, NULL),
	(739, 52, 135, 15, '{"hp": 130, "atk": 50}', NULL, NULL),
	(741, 52, 140, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(743, 57, 113, 14, '{"hp": 150, "def": 40}', NULL, NULL),
	(745, 57, 102, 14, '{"hp": 150, "int": 40}', NULL, NULL),
	(747, 58, 96, 14, '{"atk": 60, "spd": 25}', NULL, NULL),
	(749, 58, 135, 15, '{"hp": 130, "atk": 50}', NULL, NULL),
	(751, 58, 119, 14, '{"atk": 40, "spd": 40}', NULL, NULL),
	(756, 66, 145, 26, '{"def": 110}', NULL, NULL),
	(760, 68, 197, 28, '{"atk": 75, "spd": 80}', NULL, NULL),
	(764, 69, 169, 28, '{"atk": 80, "int": 70}', NULL, NULL),
	(768, 73, 215, 28, '{"atk": 90, "spd": 85}', NULL, NULL),
	(772, 75, 203, 30, '{"hp": 350, "atk": 100}', NULL, NULL),
	(775, 80, 144, 28, '{"atk": 75, "def": 75, "int": 75}', NULL, NULL),
	(678, 214, 309, 55, '{"abi": 20, "int": 170, "spd": 130}', NULL, NULL),
	(680, 215, 297, 55, '{"abi": 20, "atk": 130, "def": 120, "spd": 150}', NULL, NULL),
	(682, 216, 272, 55, '{"abi": 20, "atk": 120, "def": 130}', NULL, NULL),
	(684, 216, 298, 55, '{"abi": 20, "def": 135, "spd": 125}', NULL, NULL),
	(686, 217, 227, 55, '{"hp": 1200, "sp": 110, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(690, 222, 313, 70, '{"abi": 100, "atk": 160, "def": 160, "int": 160, "spd": 160}', NULL, NULL),
	(692, 223, 222, 0, '{}', NULL, NULL),
	(694, 248, 249, 60, '{"hp": 2000, "abi": 30, "atk": 250}', NULL, NULL),
	(696, 262, 320, 80, '{"abi": 80, "atk": 185, "def": 185, "int": 185}', NULL, NULL),
	(698, 266, 265, 0, '{}', NULL, NULL),
	(700, 272, 318, 60, '{"abi": 40, "atk": 155, "int": 100}', 226, NULL),
	(702, 274, 332, 99, '{"abi": 120}', NULL, NULL),
	(706, 283, 321, 0, '{}', NULL, NULL),
	(779, 96, 150, 30, '{"atk": 75, "spd": 95}', NULL, NULL),
	(780, 96, 192, 28, '{"hp": 400, "atk": 80, "int": 70}', NULL, NULL),
	(781, 97, 159, 30, '{"hp": 400, "abi": 10, "atk": 125}', NULL, NULL),
	(708, 294, 233, 50, '{"hp": 1500, "abi": 20, "atk": 130, "def": 120}', NULL, NULL),
	(710, 297, 315, 60, '{"abi": 40, "atk": 200, "int": 150, "spd": 150}', 228, NULL),
	(714, 307, 308, 60, '{"sp": 170, "abi": 30, "int": 180}', NULL, NULL),
	(718, 20, 69, 16, '{"atk": 50, "int": 40}', NULL, NULL),
	(722, 36, 123, 16, '{"atk": 55, "spd": 50}', NULL, NULL),
	(726, 38, 106, 12, '{"hp": 150, "def": 40}', NULL, NULL),
	(896, 333, 84, 15, '{"hp": 150, "spd": 40}', NULL, NULL),
	(898, 335, 336, 60, '{"hp": 1150, "abi": 50, "atk": 130, "spd": 150}', NULL, NULL),
	(900, 335, 214, 30, '{"sp": 75, "abi": 10, "int": 95}', NULL, NULL),
	(903, 328, 139, 16, '{"abi": 5, "spd": 40}', NULL, NULL),
	(929, 363, 364, 15, '{"atk": 40, "spd": 35}', NULL, NULL),
	(907, 330, 331, 50, '{"hp": 1300, "abi": 20, "atk": 180}', NULL, NULL),
	(824, 136, 173, 28, '{"sp": 70, "int": 85}', NULL, NULL),
	(826, 136, 191, 32, '{}', NULL, NULL),
	(828, 138, 162, 30, '{"sp": 60, "atk": 70}', NULL, NULL),
	(830, 138, 198, 26, '{"atk": 75, "spd": 80}', NULL, NULL),
	(834, 148, 252, 55, '{"hp": 1300, "abi": 20, "atk": 130, "spd": 130}', NULL, NULL),
	(836, 148, 263, 60, '{"hp": 1200, "abi": 80, "atk": 140, "def": 120, "spd": 130}', NULL, NULL),
	(838, 155, 287, 50, '{"abi": 20, "atk": 130, "spd": 160}', NULL, NULL),
	(840, 157, 274, 50, '{"abi": 20, "atk": 130, "def": 130, "int": 130}', NULL, NULL),
	(842, 159, 278, 55, '{"hp": 1500, "abi": 20, "atk": 160, "def": 140}', NULL, NULL),
	(846, 161, 267, 50, '{"hp": 1600, "abi": 20, "atk": 160}', NULL, NULL),
	(848, 161, 256, 50, '{"hp": 1000, "abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(850, 162, 243, 55, '{"sp": 120, "abi": 40, "int": 145, "spd": 100}', NULL, NULL),
	(854, 169, 260, 55, '{"hp": 1100, "abi": 20, "atk": 180, "spd": 130}', NULL, NULL),
	(858, 171, 247, 60, '{"abi": 80, "atk": 180, "spd": 180}', NULL, NULL),
	(787, 101, 155, 30, '{"hp": 300, "atk": 100, "spd": 85}', NULL, 'beast_spirit_of_light'),
	(807, 123, 155, 30, '{"hp": 300, "atk": 100, "spd": 85}', NULL, 'beast_spirit_of_light'),
	(785, 99, 145, 26, '{"def": 110}', NULL, NULL),
	(789, 101, 147, 30, '{"abi": 10, "atk": 70, "int": 90}', NULL, NULL),
	(791, 104, 173, 28, '{"sp": 70, "int": 85}', NULL, NULL),
	(793, 104, 200, 30, '{"hp": 400, "sp": 70, "int": 70}', NULL, NULL),
	(795, 109, 171, 30, '{"atk": 90, "spd": 80}', NULL, NULL),
	(797, 109, 215, 28, '{"atk": 90, "spd": 85}', NULL, NULL),
	(799, 110, 178, 40, '{"hp": 800, "atk": 80, "def": 80}', NULL, NULL),
	(862, 175, 222, 55, '{"hp": 1600, "abi": 20, "def": 150, "spd": 150}', NULL, NULL),
	(870, 186, 235, 45, '{"abi": 20, "atk": 110, "def": 130, "spd": 100}', NULL, NULL),
	(874, 189, 240, 50, '{"sp": 110, "abi": 20, "int": 140}', NULL, NULL),
	(878, 190, 271, 60, '{"sp": 160, "abi": 80, "def": 120, "int": 200}', NULL, NULL),
	(882, 197, 238, 50, '{"hp": 1300, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(886, 226, 318, 60, '{"abi": 40, "atk": 155, "int": 100}', 272, NULL),
	(890, 287, 288, 0, '{}', NULL, NULL),
	(801, 113, 186, 26, '{"atk": 65, "def": 65}', NULL, NULL),
	(803, 113, 187, 26, '{"hp": 850, "atk": 60, "int": 60}', NULL, NULL),
	(805, 117, 163, 28, '{"hp": 400, "atk": 75, "spd": 75}', NULL, NULL),
	(809, 123, 209, 30, '{"hp": 350, "atk": 100, "spd": 75}', NULL, NULL),
	(813, 132, 180, 28, '{"atk": 75, "def": 75}', NULL, NULL),
	(818, 134, 195, 30, '{"sp": 80, "abi": 10, "int": 80}', NULL, NULL),
	(820, 135, 178, 40, '{"hp": 800, "atk": 80, "def": 80}', NULL, NULL),
	(822, 135, 181, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(892, 288, 287, 0, '{}', NULL, NULL),
	(881, 196, 296, 45, '{"sp": 100, "abi": 20, "atk": 120, "def": 140}', NULL, NULL),
	(883, 197, 227, 55, '{"hp": 1200, "sp": 110, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(887, 231, 319, 60, '{"hp": 1000, "abi": 100, "atk": 150, "int": 150}', 287, NULL),
	(889, 278, 314, 60, '{"hp": 1650, "abi": 100, "atk": 150, "spd": 150}', 252, NULL),
	(930, 25, 364, 15, '{"atk": 40, "spd": 35}', NULL, NULL),
	(837, 149, 231, 55, '{"hp": 1500, "abi": 20, "atk": 150, "def": 120}', NULL, NULL),
	(845, 161, 264, 60, '{"hp": 1500, "abi": 20, "atk": 140, "def": 120}', NULL, NULL),
	(849, 161, 331, 50, '{"hp": 1300, "abi": 20, "atk": 180}', NULL, NULL),
	(851, 162, 251, 60, '{"abi": 80, "def": 140, "int": 120, "spd": 150}', NULL, NULL),
	(853, 169, 238, 50, '{"hp": 1300, "abi": 40, "atk": 110, "int": 110}', NULL, NULL),
	(855, 169, 261, 60, '{"hp": 1600, "abi": 80, "atk": 230, "int": 160}', NULL, NULL),
	(857, 171, 225, 50, '{"abi": 20, "atk": 130, "int": 130, "spd": 160}', NULL, NULL),
	(861, 173, 302, 60, '{"hp": 2000, "sp": 140, "abi": 80, "atk": 140, "def": 140, "int": 140}', NULL, NULL),
	(863, 175, 237, 45, '{"hp": 1500, "abi": 20, "atk": 120, "def": 120}', NULL, NULL),
	(865, 178, 256, 50, '{"hp": 1000, "abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(867, 180, 278, 55, '{"hp": 1500, "abi": 20, "atk": 160, "def": 140}', NULL, NULL),
	(869, 180, 245, 50, '{"abi": 20, "atk": 145, "spd": 120}', NULL, NULL),
	(871, 186, 250, 50, '{"hp": 1000, "abi": 20, "atk": 130, "def": 110}', NULL, NULL),
	(875, 189, 253, 55, '{"sp": 130, "abi": 40, "def": 130, "int": 150}', NULL, NULL),
	(891, 287, 319, 60, '{"hp": 1000, "abi": 100, "atk": 150, "int": 150}', 231, NULL),
	(895, 333, 335, 14, '{"sp": 40, "spd": 50}', NULL, NULL),
	(899, 335, 186, 26, '{"atk": 65, "def": 65}', NULL, NULL),
	(902, 328, 135, 15, '{"hp": 130, "atk": 50}', NULL, NULL),
	(904, 329, 330, 30, '{"hp": 400, "atk": 95, "def": 75}', NULL, NULL),
	(906, 329, 200, 30, '{"hp": 400, "sp": 70, "int": 70}', NULL, NULL),
	(908, 330, 230, 50, '{"abi": 20, "atk": 120, "def": 100, "spd": 100}', NULL, NULL),
	(910, 330, 291, 55, '{"abi": 20, "atk": 150, "spd": 140}', NULL, NULL),
	(784, 99, 196, 26, '{"atk": 80, "def": 75}', NULL, NULL),
	(788, 101, 197, 28, '{"atk": 75, "spd": 80}', NULL, NULL),
	(792, 104, 144, 28, '{"atk": 75, "def": 75, "int": 75}', NULL, NULL),
	(796, 109, 163, 28, '{"hp": 400, "atk": 75, "spd": 75}', NULL, NULL),
	(800, 110, 190, 28, '{"sp": 80, "int": 80}', NULL, NULL),
	(804, 117, 143, 28, '{"atk": 65, "int": 75, "spd": 85}', NULL, NULL),
	(808, 123, 171, 30, '{"atk": 90, "spd": 80}', NULL, NULL),
	(810, 126, 212, 30, '{"int": 75, "spd": 75}', NULL, NULL),
	(812, 126, 210, 30, '{"sp": 75, "int": 75}', NULL, NULL),
	(877, 190, 257, 55, '{"hp": 1400, "abi": 20, "atk": 150, "int": 120}', NULL, NULL),
	(879, 196, 270, 50, '{"abi": 20, "atk": 120, "def": 135}', NULL, NULL),
	(814, 132, 168, 28, '{"atk": 120, "def": 85, "spd": 70}', NULL, NULL),
	(816, 134, 189, 26, '{"sp": 65, "int": 65}', NULL, NULL),
	(817, 134, 188, 26, '{"sp": 75, "int": 80, "spd": 80}', NULL, NULL),
	(821, 135, 156, 26, '{"hp": 800, "atk": 75, "def": 95}', NULL, NULL),
	(825, 136, 190, 28, '{"sp": 80, "int": 80}', NULL, NULL),
	(829, 138, 143, 28, '{"atk": 65, "int": 75, "spd": 85}', NULL, NULL),
	(833, 142, 261, 60, '{"hp": 1600, "abi": 80, "atk": 230, "int": 160}', NULL, NULL),
	(1, 1, 10, 5, '{}', NULL, NULL),
	(493, 144, 256, 50, '{"hp": 1000, "abi": 20, "atk": 120, "spd": 130}', NULL, NULL),
	(508, 150, 263, 60, '{"hp": 1200, "abi": 80, "atk": 140, "def": 120, "spd": 130}', NULL, NULL),
	(513, 151, 296, 45, '{"sp": 100, "abi": 20, "atk": 120, "def": 140}', NULL, NULL),
	(514, 151, 235, 45, '{"abi": 20, "atk": 110, "def": 130, "spd": 100}', NULL, NULL),
	(515, 151, 270, 50, '{"abi": 20, "atk": 120, "def": 135}', NULL, NULL),
	(525, 154, 304, 55, '{"abi": 20, "atk": 130, "spd": 160}', NULL, NULL),
	(530, 156, 299, 50, '{"sp": 120, "abi": 20, "def": 120, "int": 120}', NULL, NULL),
	(532, 156, 267, 50, '{"hp": 1600, "abi": 20, "atk": 160}', NULL, NULL),
	(542, 163, 250, 50, '{"hp": 1000, "abi": 20, "atk": 130, "def": 110}', NULL, NULL),
	(547, 165, 236, 55, '{"sp": 120, "abi": 20, "int": 135, "spd": 120}', NULL, NULL),
	(553, 166, 225, 50, '{"abi": 20, "atk": 130, "int": 130, "spd": 160}', NULL, NULL),
	(556, 167, 250, 50, '{"hp": 1000, "abi": 20, "atk": 130, "def": 110}', NULL, NULL),
	(560, 168, 261, 60, '{"hp": 1600, "abi": 80, "atk": 230, "int": 160}', NULL, NULL),
	(570, 174, 297, 55, '{"abi": 20, "atk": 130, "def": 120, "spd": 150}', NULL, NULL),
	(572, 176, 283, 60, '{"hp": 1700, "sp": 140, "abi": 80, "int": 180}', NULL, NULL),
	(575, 177, 281, 60, '{"hp": 2000, "abi": 80, "atk": 250, "spd": 150}', NULL, NULL),
	(587, 182, 264, 60, '{"hp": 1500, "abi": 20, "atk": 140, "def": 120}', NULL, NULL),
	(931, 37, 364, 15, '{"atk": 40, "spd": 35}', NULL, NULL),
	(169, 39, 325, 50, '{"abi": 40, "atk": 100, "def": 120, "int": 120}', NULL, 'digi_egg_of_destiny'),
	(4, 2, 8, 5, '{}', NULL, NULL),
	(5, 2, 14, 3, '{"hp": 50}', NULL, NULL),
	(7, 3, 9, 5, '{}', NULL, NULL),
	(74, 21, 70, 15, '{"hp": 150, "def": 40}', NULL, NULL),
	(86, 23, 85, 15, '{"spd": 50}', NULL, NULL),
	(118, 28, 133, 14, '{"hp": 250, "atk": 30}', NULL, NULL),
	(135, 31, 127, 20, '{}', NULL, NULL),
	(143, 33, 78, 14, '{"atk": 55}', NULL, NULL),
	(190, 45, 107, 14, '{"hp": 150, "def": 35}', NULL, NULL),
	(193, 46, 77, 16, '{"abi": 5, "int": 40}', NULL, NULL),
	(212, 49, 89, 16, '{"hp": 150, "atk": 40}', NULL, NULL),
	(242, 56, 67, 14, '{"spd": 55}', NULL, NULL),
	(243, 56, 122, 14, '{"hp": 40, "int": 40, "spd": 40}', NULL, NULL),
	(244, 56, 130, 14, '{"spd": 50}', NULL, NULL),
	(258, 62, 117, 14, '{"atk": 45, "spd": 40}', NULL, NULL),
	(267, 64, 82, 14, '{"def": 40, "int": 40}', NULL, NULL),
	(295, 74, 165, 28, '{"hp": 800, "def": 70}', NULL, NULL),
	(331, 85, 185, 28, '{"hp": 350, "atk": 75, "spd": 75}', NULL, NULL),
	(375, 100, 201, 26, '{"hp": 400, "atk": 95, "spd": 75}', NULL, NULL),
	(376, 102, 152, 30, '{"sp": 75, "abi": 10, "int": 100}', NULL, NULL),
	(381, 103, 200, 30, '{"hp": 400, "sp": 70, "int": 70}', NULL, NULL),
	(400, 111, 188, 26, '{"sp": 75, "int": 80, "spd": 80}', NULL, NULL),
	(435, 122, 174, 30, '{"sp": 75, "abi": 10, "spd": 100}', NULL, NULL),
	(466, 131, 199, 26, '{"atk": 75, "def": 80}', NULL, NULL),
	(469, 133, 152, 30, '{"sp": 75, "abi": 10, "int": 100}', NULL, NULL),
	(488, 143, 243, 55, '{"sp": 120, "abi": 40, "int": 145, "spd": 100}', NULL, NULL),
	(932, 364, 365, 30, '{"atk": 75, "spd": 55}', NULL, NULL),
	(590, 183, 298, 55, '{"abi": 20, "def": 135, "spd": 125}', NULL, NULL),
	(618, 195, 225, 50, '{"abi": 20, "atk": 130, "int": 130, "spd": 160}', NULL, NULL),
	(636, 202, 232, 60, '{"abi": 40, "atk": 130, "def": 130, "int": 130}', NULL, NULL),
	(648, 205, 276, 55, '{"hp": 1800, "abi": 20, "atk": 140, "def": 140}', NULL, NULL),
	(660, 208, 304, 55, '{"abi": 20, "atk": 130, "spd": 160}', NULL, NULL),
	(666, 210, 303, 60, '{"sp": 200, "abi": 80, "int": 250, "spd": 130}', NULL, NULL),
	(688, 217, 283, 60, '{"hp": 1700, "sp": 140, "abi": 80, "int": 180}', NULL, NULL),
	(933, 109, 365, 30, '{"atk": 75, "spd": 55}', NULL, NULL),
	(601, 191, 275, 65, '{"abi": 10}', NULL, NULL),
	(635, 201, 295, 55, '{"hp": 1700, "abi": 40, "atk": 180}', NULL, NULL),
	(659, 208, 291, 55, '{"abi": 20, "atk": 150, "spd": 140}', NULL, NULL),
	(677, 214, 303, 60, '{"sp": 200, "abi": 80, "int": 250, "spd": 130}', NULL, NULL),
	(699, 272, 317, 60, '{"abi": 40, "atk": 255}', 255, NULL),
	(934, 105, 365, 30, '{"atk": 75, "spd": 55}', NULL, NULL),
	(604, 192, 261, 60, '{"hp": 1600, "abi": 80, "atk": 230, "int": 160}', NULL, NULL),
	(615, 195, 248, 55, '{"abi": 20, "atk": 140, "spd": 130}', NULL, NULL),
	(704, 280, 258, 55, '{"hp": 1600, "abi": 40, "atk": 140, "def": 130}', NULL, NULL),
	(935, 363, 97, 14, '{"atk": 40, "def": 25, "spd": 40}', NULL, NULL),
	(634, 201, 244, 55, '{"abi": 40, "atk": 130, "def": 120, "int": 120}', NULL, NULL),
	(709, 294, 332, 99, '{"abi": 120}', NULL, NULL),
	(936, 363, 81, 15, '{"spd": 55}', NULL, NULL),
	(649, 205, 262, 60, '{"abi": 80, "atk": 140, "def": 140, "int": 140}', NULL, NULL),
	(937, 364, 160, 26, '{"hp": 400, "atk": 95}', NULL, NULL),
	(776, 80, 325, 50, '{"abi": 40, "atk": 100, "def": 120, "int": 120}', NULL, 'digi_egg_of_destiny'),
	(674, 212, 309, 55, '{"abi": 20, "int": 170, "spd": 130}', NULL, NULL),
	(748, 58, 109, 15, '{"atk": 45, "spd": 50}', NULL, NULL),
	(783, 97, 202, 30, '{"atk": 105, "spd": 75}', NULL, NULL),
	(832, 142, 260, 55, '{"hp": 1100, "abi": 20, "atk": 180, "spd": 130}', NULL, NULL),
	(841, 157, 277, 45, '{"abi": 20, "def": 150}', NULL, NULL),
	(843, 159, 295, 55, '{"hp": 1700, "abi": 40, "atk": 180}', NULL, NULL),
	(844, 159, 224, 50, '{"hp": 1700, "abi": 20, "atk": 130, "def": 130, "int": 120}', NULL, NULL),
	(859, 173, 268, 55, '{"hp": 1000, "sp": 100, "abi": 20, "int": 130}', NULL, NULL),
	(866, 178, 247, 60, '{"abi": 80, "atk": 180, "spd": 180}', NULL, NULL),
	(872, 186, 272, 55, '{"abi": 20, "atk": 120, "def": 130}', NULL, NULL),
	(873, 189, 226, 55, '{"sp": 120, "abi": 40, "int": 145, "spd": 130}', NULL, NULL),
	(885, 218, 311, 70, '{"sp": 150, "abi": 60, "atk": 250, "int": 150, "spd": 160}', NULL, NULL),
	(894, 333, 334, 60, '{"hp": 1150, "sp": 130, "abi": 50, "int": 150}', NULL, NULL),
	(911, 331, 312, 60, '{"abi": 80, "atk": 180, "def": 170, "int": 150}', 219, NULL);


--
-- Data for Name: titles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."titles" ("id", "name", "description", "category", "requirement_type", "requirement_value", "created_at") VALUES
	(1, 'Digital Rookie', 'Completed Stage 10 of the Campaign', 'campaign', 'campaign_stage', '10', '2025-05-12 01:40:51.065058+00'),
	(2, 'Island Explorer', 'Defeated Devimon and cleansed the File Island.', 'campaign', 'campaign_stage', '20', '2025-05-12 01:40:51.065058+00'),
	(3, 'Vampire Hunter', 'Defeated the resurrected Myotismon.', 'campaign', 'campaign_stage', '30', '2025-05-12 01:40:51.065058+00'),
	(4, 'Master of the Spiral', 'Conquered all four Dark Masters.', 'campaign', 'campaign_stage', '46', '2025-05-12 04:13:58.475548+00'),
	(5, 'DigiDestined', 'Defeated the final boss, Apocalymon.', 'campaign', 'campaign_stage', '60', '2025-05-12 04:13:58.475548+00'),
	(6, 'Seven Deadly Sins', 'Defeated all Seven Great Demon Lords.', 'campaign', 'campaign_stage', '70', '2025-05-15 09:28:49.731815+00'),
	(7, 'Royal Challenger', 'Defeated and gained the trust of the Royal Knights.', 'campaign', 'campaign_stage', '80', '2025-05-15 09:28:49.731815+00'),
	(101, 'Digimon Fan', 'Discovered 50 different Digimon', 'collection', 'digimon_count', '50', '2025-05-12 01:40:51.065058+00'),
	(105, 'Digimon Legend', 'Discovered every single Digimon', 'collection', 'digimon_count', '341', '2025-05-12 06:14:45.258239+00'),
	(400, 'Getting Started', 'Completed 1 Daily Quota.', 'streak', 'longest_streak', '1', '2025-05-22 03:49:33.35838+00'),
	(401, 'In Training', 'Maintained a 3 day streak.', 'streak', 'longest_streak', '3', '2025-05-22 03:49:33.35838+00'),
	(402, 'Routine Rookie', 'Maintained a 7 day streak.', 'streak', 'longest_streak', '7', '2025-05-22 03:49:33.35838+00'),
	(403, 'Champion Flow', 'Maintained a 14 day streak.', 'streak', 'longest_streak', '14', '2025-05-22 03:49:33.35838+00'),
	(404, 'Ultimate Bond', 'Maintained a 31 day streak.', 'streak', 'longest_streak', '31', '2025-05-22 03:49:33.35838+00'),
	(405, 'Crest Ignited', 'Maintained a 50 day streak.', 'streak', 'longest_streak', '50', '2025-05-22 03:49:33.35838+00'),
	(406, 'Digivolved', 'Maintained a 75 day streak.', 'streak', 'longest_streak', '75', '2025-05-22 03:49:33.35838+00'),
	(407, 'Perfect Partner', 'Maintained a 100 day streak.', 'streak', 'longest_streak', '100', '2025-05-22 03:49:33.35838+00'),
	(408, 'Digitask Adventure', 'Maintained a 365 day streak. One full year!', 'streak', 'longest_streak', '365', '2025-05-22 03:49:33.35838+00'),
	(8, 'Multiversal Tamer', 'Survived the Space Time Distortion.', 'campaign', 'campaign_stage', '56', '2025-05-15 09:39:04.902144+00'),
	(102, 'Digimon Researcher', 'Discovered 100 different Digimon', 'collection', 'digimon_count', '100', '2025-05-12 01:40:51.065058+00'),
	(103, 'Digimon Professor', 'Discovered 200 different Digimon', 'collection', 'digimon_count', '200', '2025-05-12 06:14:45.258239+00'),
	(104, 'Digimon Master', 'Discovered 300 different Digimon', 'collection', 'digimon_count', '300', '2025-05-12 06:33:57.872831+00'),
	(201, 'Ultimate Tamer', 'Evolved a Digimon to Ultimate stage', 'evolution', 'digimon_stage', 'Ultimate', '2025-05-12 01:40:51.065058+00'),
	(202, 'Mega Tamer', 'Evolved a Digimon to Mega stage', 'evolution', 'digimon_stage', 'Mega', '2025-05-12 01:40:51.065058+00'),
	(203, 'Ultra Tamer', 'Evolved a Digimon to Ultra stage', 'evolution', 'digimon_stage', 'Ultra', '2025-05-12 06:14:45.258239+00'),
	(301, 'Battle Novice', 'Won 10 arena battles.', 'battle', 'battle_wins', '10', '2025-05-12 01:40:51.065058+00'),
	(302, 'Battle Expert', 'Won 50 arena battles.', 'battle', 'battle_wins', '50', '2025-05-12 01:40:51.065058+00'),
	(303, 'Battle Master', 'Won 200 team battles.', 'battle', 'battle_wins', '200', '2025-05-12 06:14:45.258239+00'),
	(304, 'Battle Champion', 'Won 1000 arena battles.', 'battle', 'battle_wins', '1000', '2025-05-12 06:14:45.258239+00');


--
-- Name: digimon_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."digimon_forms_id_seq"', 99, true);


--
-- Name: digimon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."digimon_id_seq"', 348, true);


--
-- Name: evolution_paths_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."evolution_paths_id_seq"', 956, true);


--
-- Name: titles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."titles_id_seq"', 1, false);




--
-- PostgreSQL database dump complete
--

RESET ALL;
