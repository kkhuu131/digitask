-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

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
