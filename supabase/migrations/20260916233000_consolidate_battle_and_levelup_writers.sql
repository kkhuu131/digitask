-- Keep one authoritative counter trigger and one BEFORE level-up trigger.
-- Preserve historical rows; NOT VALID checks enforce correctness on new writes.
DROP TRIGGER update_battle_stats_trigger ON public.team_battles;
DROP TRIGGER user_digimon_level_up ON public.user_digimon;
ALTER TABLE public.team_battles ALTER COLUMN winner_id DROP NOT NULL;
DROP POLICY "Enable insert for authenticated users only" ON public.team_battles;
CREATE POLICY "Enable insert for authenticated users only" ON public.team_battles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE ONLY public.team_battles
  ADD CONSTRAINT team_battles_winner_is_participant CHECK (
    (winner_id IS NULL AND opponent_id IS NULL) OR
    (winner_id IS NOT NULL AND (winner_id = user_id OR (opponent_id IS NOT NULL AND winner_id = opponent_id)))
  ) NOT VALID;
ALTER TABLE ONLY public.team_battles
  ADD CONSTRAINT team_battles_distinct_opponent CHECK (opponent_id IS NULL OR opponent_id <> user_id) NOT VALID;

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

-- Counter columns belong to the battle trigger; old browser increments are rejected.
REVOKE INSERT, UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT INSERT (id, username, display_name, avatar_url, created_at, updated_at, saved_stats, highest_stage_cleared, has_completed_onboarding, battle_energy, max_battle_energy, last_arena_first_win), UPDATE (id, username, display_name, avatar_url, created_at, updated_at, saved_stats, highest_stage_cleared, has_completed_onboarding, battle_energy, max_battle_energy, last_arena_first_win) ON TABLE public.profiles TO authenticated;
REVOKE ALL ON FUNCTION public.update_battle_stats() FROM PUBLIC, anon, authenticated;
