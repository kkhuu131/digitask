-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision DEFAULT 0.5) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$begin
  -- Update active Digimon with full exp and increased happiness
  update public.user_digimon
  set 
    experience_points = experience_points + p_base_exp,
    happiness = least(happiness + 10, 100)
  where id = p_active_digimon_id;
  
  -- Update non-active Digimon with reduced exp
  update public.user_digimon
  set experience_points = experience_points + floor(p_base_exp * p_non_active_multiplier)
  where id != p_active_digimon_id
  and is_in_storage = false
  and user_id = (
    select user_id 
    from public.user_digimon 
    where id = p_active_digimon_id
  );
end;$$;

ALTER FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) OWNER TO "postgres";
