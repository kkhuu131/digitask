-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer DEFAULT 1, "p_is_daily_quota" boolean DEFAULT false) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Weekly boss feature has been removed. No-op.
  RETURN TRUE;
END;
$$;

ALTER FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) OWNER TO "postgres";
