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
