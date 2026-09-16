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
