-- Batch allocation is additive, owner-scoped and atomic. The expected bonuses
-- prevent stale drafts and retries after an uncertain response from spending twice.
CREATE OR REPLACE FUNCTION public.allocate_stats(
  p_digimon_id uuid, p_allocations jsonb, p_expected_bonuses jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_saved_stats jsonb;
  v_digimon public.user_digimon%ROWTYPE;
  v_key text;
  v_value jsonb;
  v_amount integer;
  v_total bigint := 0;
  v_available integer;
  v_result jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(p_allocations) IS DISTINCT FROM 'object' OR
     jsonb_typeof(p_expected_bonuses) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Stat allocations and expected bonuses must be objects' USING ERRCODE = '22023';
  END IF;
  FOR v_key, v_value IN SELECT key, value FROM jsonb_each(p_allocations) LOOP
    IF v_key NOT IN ('HP', 'SP', 'ATK', 'DEF', 'INT', 'SPD') OR
       jsonb_typeof(v_value) IS DISTINCT FROM 'number' THEN
      RAISE EXCEPTION 'Invalid stat allocation' USING ERRCODE = '22023';
    END IF;
    IF (v_value::text)::numeric < 0 OR (v_value::text)::numeric > 2147483647 OR
       (v_value::text)::numeric <> trunc((v_value::text)::numeric) THEN
      RAISE EXCEPTION 'Stat allocations must be nonnegative integers' USING ERRCODE = '22023';
    END IF;
    v_total := v_total + (v_value::text)::integer;
  END LOOP;
  IF v_total = 0 THEN
    RAISE EXCEPTION 'Allocate at least one point' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(*) FROM jsonb_object_keys(p_expected_bonuses)) <> 6 THEN
    RAISE EXCEPTION 'Supply all six expected bonuses' USING ERRCODE = '22023';
  END IF;
  FOR v_key, v_value IN SELECT key, value FROM jsonb_each(p_expected_bonuses) LOOP
    IF v_key NOT IN ('HP', 'SP', 'ATK', 'DEF', 'INT', 'SPD') OR
       jsonb_typeof(v_value) IS DISTINCT FROM 'number' THEN
      RAISE EXCEPTION 'Invalid expected bonus' USING ERRCODE = '22023';
    END IF;
  END LOOP;

  -- Match the profile-first lock order of task rewards and single allocations.
  SELECT saved_stats INTO v_saved_stats FROM public.profiles
  WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_digimon FROM public.user_digimon
  WHERE id = p_digimon_id AND user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Digimon not found or not owned by caller' USING ERRCODE = '42501';
  END IF;
  v_saved_stats := COALESCE(v_saved_stats, '{}'::jsonb);
  v_result := jsonb_build_object('success', false, 'saved_stats', v_saved_stats,
    'digimon', to_jsonb(v_digimon));
  IF p_expected_bonuses IS DISTINCT FROM jsonb_build_object(
    'HP', v_digimon.hp_bonus, 'SP', v_digimon.sp_bonus, 'ATK', v_digimon.atk_bonus,
    'DEF', v_digimon.def_bonus, 'INT', v_digimon.int_bonus, 'SPD', v_digimon.spd_bonus
  ) THEN
    RETURN v_result || jsonb_build_object('reason', 'changed');
  END IF;
  IF v_total + v_digimon.hp_bonus::bigint + v_digimon.sp_bonus + v_digimon.atk_bonus +
     v_digimon.def_bonus + v_digimon.int_bonus + v_digimon.spd_bonus > 20::bigint + COALESCE(v_digimon.abi, 0) THEN
    RETURN v_result || jsonb_build_object('reason', 'cap');
  END IF;
  FOR v_key, v_value IN SELECT key, value FROM jsonb_each(p_allocations) LOOP
    v_amount := (v_value::text)::integer;
    v_available := COALESCE((v_saved_stats->>v_key)::integer, 0);
    IF v_amount > v_available THEN
      RETURN v_result || jsonb_build_object('reason', 'points');
    END IF;
    v_saved_stats := jsonb_set(v_saved_stats, ARRAY[v_key], to_jsonb(v_available - v_amount));
  END LOOP;

  UPDATE public.user_digimon SET
    hp_bonus = hp_bonus + COALESCE((p_allocations->>'HP')::integer, 0),
    sp_bonus = sp_bonus + COALESCE((p_allocations->>'SP')::integer, 0),
    atk_bonus = atk_bonus + COALESCE((p_allocations->>'ATK')::integer, 0),
    def_bonus = def_bonus + COALESCE((p_allocations->>'DEF')::integer, 0),
    int_bonus = int_bonus + COALESCE((p_allocations->>'INT')::integer, 0),
    spd_bonus = spd_bonus + COALESCE((p_allocations->>'SPD')::integer, 0)
  WHERE id = p_digimon_id AND user_id = v_user_id
  RETURNING * INTO v_digimon;
  UPDATE public.profiles SET saved_stats = v_saved_stats WHERE id = v_user_id;
  RETURN jsonb_build_object('success', true, 'saved_stats', v_saved_stats, 'digimon', to_jsonb(v_digimon));
END;
$$;
ALTER FUNCTION public.allocate_stats(uuid, jsonb, jsonb) OWNER TO postgres;
