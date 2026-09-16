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
