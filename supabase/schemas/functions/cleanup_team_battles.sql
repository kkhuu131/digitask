-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

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
