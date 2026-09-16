-- The sole battle-counter writer; the insert policy verifies the initiating user.
CREATE OR REPLACE FUNCTION "public"."update_battle_stats"() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Lock both participants in a stable order for simultaneous opposite-side battles.
  PERFORM 1 FROM public.profiles
  WHERE id IN (NEW.user_id, NEW.opponent_id) ORDER BY id FOR UPDATE;
  UPDATE public.profiles
  SET battles_completed = COALESCE(battles_completed, 0) + 1,
      battles_won = COALESCE(battles_won, 0) + CASE WHEN id = NEW.winner_id THEN 1 ELSE 0 END
  WHERE id IN (NEW.user_id, NEW.opponent_id);
  RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_battle_stats"() OWNER TO postgres;
