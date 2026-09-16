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
