-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

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
