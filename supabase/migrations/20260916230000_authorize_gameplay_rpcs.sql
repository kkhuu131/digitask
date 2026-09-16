-- Authorization, serialized task rewards, and explicit browser execution grants.
-- Existing task/reward formulas are retained; the quota trigger is the sole counter writer.

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text" DEFAULT NULL::"text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = pg_catalog, public
    AS $$
DECLARE
  user_uuid TEXT;
  generated_username TEXT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  IF new_username IS NOT NULL AND (length(btrim(new_username)) < 1 OR length(new_username) > 50) THEN
    RAISE EXCEPTION 'Username must contain between 1 and 50 characters' USING ERRCODE = '22023';
  END IF;
  -- Get the first 5 characters of the user's UUID
  SELECT SUBSTRING(id::TEXT, 1, 5) INTO user_uuid
  FROM auth.users
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = '22023';
  END IF;
  
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

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."delete_user_and_data"("input_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = pg_catalog, public
    AS $$
begin
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
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

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_stat_field text;
  v_saved_stats jsonb;
  v_digimon public.user_digimon%ROWTYPE;
  v_available integer;
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'You may only allocate your own saved stats' USING ERRCODE = '42501';
  END IF;
  IF p_stat_type IS NULL OR p_stat_type NOT IN ('HP', 'SP', 'ATK', 'DEF', 'INT', 'SPD') THEN
    RAISE EXCEPTION 'Invalid stat type' USING ERRCODE = '22023';
  END IF;

  -- All stat/reward operations lock the profile first, avoiding lost saved points.
  SELECT saved_stats INTO v_saved_stats FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_digimon FROM public.user_digimon
  WHERE id = p_digimon_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Digimon not found or not owned by caller' USING ERRCODE = '42501';
  END IF;
  v_available := COALESCE((v_saved_stats->>p_stat_type)::integer, 0);
  IF v_available <= 0 OR
    v_digimon.hp_bonus + v_digimon.sp_bonus + v_digimon.atk_bonus +
    v_digimon.def_bonus + v_digimon.int_bonus + v_digimon.spd_bonus >= 20 + COALESCE(v_digimon.abi, 0) THEN
    RETURN false;
  END IF;
  v_stat_field := lower(p_stat_type) || '_bonus';
  EXECUTE format('UPDATE public.user_digimon SET %I = %I + 1 WHERE id = $1 AND user_id = $2', v_stat_field, v_stat_field)
  USING p_digimon_id, p_user_id;
  UPDATE public.profiles
  SET saved_stats = jsonb_set(COALESCE(v_saved_stats, '{}'::jsonb), ARRAY[p_stat_type], to_jsonb(v_available - 1))
  WHERE id = p_user_id;
  RETURN true;
END;
$$;
ALTER FUNCTION "public"."allocate_stat"(uuid, text, uuid) OWNER TO postgres;

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean DEFAULT false) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = pg_catalog, public
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
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'You may only complete your own tasks' USING ERRCODE = '42501';
  END IF;
  -- Serialize rewards and saved-stat writes for this user.
  PERFORM 1 FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = '22023';
  END IF;
  SELECT COALESCE(completed_today, 0) INTO v_old_completed_today
  FROM public.daily_quotas WHERE user_id = p_user_id FOR UPDATE;
  v_old_completed_today := COALESCE(v_old_completed_today, 0);
  -- STEP 1: Mark task as completed
  BEGIN
    SELECT * INTO v_task_record
    FROM tasks
    WHERE id = p_task_id AND user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Task not found or does not belong to user';
    END IF;

    IF v_task_record.is_completed THEN
      RAISE EXCEPTION 'Task is already completed' USING ERRCODE = '22023';
    END IF;

    v_task_category := v_task_record.category;

    UPDATE tasks
    SET is_completed = TRUE, completed_at = v_current_time
    WHERE id = p_task_id;
  END;

  -- The completion trigger owns the quota increment; do not write it twice.
  SELECT * INTO STRICT v_daily_quota
  FROM public.daily_quotas WHERE user_id = p_user_id;
  v_quota_completed := v_old_completed_today < v_quota_threshold
    AND v_daily_quota.completed_today >= v_quota_threshold;

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
      AND id IS DISTINCT FROM v_active_digimon_id
      AND COALESCE(is_in_storage, false) = false;

  END;

  -- STEP 3.5: Weekly boss (no-op stub kept for compatibility)
  BEGIN
    PERFORM contribute_boss_progress(p_user_id, 1, v_quota_completed);
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
  END;

  -- Award the ticket in the same transaction as the task, quota and EXP.
  UPDATE public.profiles
  SET battle_energy = LEAST(max_battle_energy, battle_energy + 1)
  WHERE id = p_user_id;

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

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."spend_energy"("p_user_id" "uuid", "p_amount" integer) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = pg_catalog, public
    AS $$
DECLARE
  v_energy integer;
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'You may only spend your own battle tickets' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;
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

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."spend_energy_self"("p_amount" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    SET search_path = pg_catalog, public
    AS $$
DECLARE
  v_energy integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;
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

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."grant_energy_self"("p_amount" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  -- Keep the existing connectivity probe compatible; rewards belong to task completion.
  IF p_amount IS DISTINCT FROM 0 THEN
    RAISE EXCEPTION 'Battle tickets are awarded by task completion' USING ERRCODE = '42501';
  END IF;
end;
$$;

ALTER FUNCTION "public"."grant_energy_self"("p_amount" integer) OWNER TO "postgres";

-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."update_completed_today"() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.is_completed AND NOT COALESCE(OLD.is_completed, false) THEN
    INSERT INTO public.daily_quotas (user_id, completed_today, consecutive_days_missed)
    VALUES (NEW.user_id, 1, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET completed_today = COALESCE(daily_quotas.completed_today, 0) + 1,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_completed_today"() OWNER TO postgres;

-- Mutating RPCs require authenticated callers and enforce authorization in their bodies.
REVOKE ALL ON FUNCTION public.admin_rename_user(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_rename_user(uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.delete_user_and_data(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_and_data(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.allocate_stat(uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.allocate_stat(uuid, text, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.complete_task_all_triggers(uuid, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_task_all_triggers(uuid, uuid, boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.spend_energy(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spend_energy(uuid, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.spend_energy_self(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spend_energy_self(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.grant_energy_self(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_energy_self(integer) TO authenticated, service_role;

-- New functions must opt into browser execution explicitly. Existing grants are unchanged.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
