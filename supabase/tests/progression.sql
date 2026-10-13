-- Local-only progression and atomic quota fixtures; preserve all real data.
BEGIN;
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-4000-8000-000000000041', 'progression@example.invalid');
INSERT INTO public.profiles (id, username) VALUES
  ('00000000-0000-4000-8000-000000000041', 'progression-test');
INSERT INTO public.daily_quotas (user_id, current_streak, longest_streak, completed_today)
VALUES ('00000000-0000-4000-8000-000000000041', 10, 10, 0);
INSERT INTO public.user_digimon (id, user_id, digimon_id, name, is_active, is_in_storage, current_level)
VALUES
  ('00000000-0000-4000-8000-000000004101', '00000000-0000-4000-8000-000000000041', 1, 'active', true, false, 29),
  ('00000000-0000-4000-8000-000000004102', '00000000-0000-4000-8000-000000000041', 1, 'reserve', false, false, 29),
  ('00000000-0000-4000-8000-000000004103', '00000000-0000-4000-8000-000000000041', 1, 'storage', false, true, 29);
INSERT INTO public.tasks (id, user_id, description, difficulty, priority)
SELECT ('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  '00000000-0000-4000-8000-000000000041', 'progression task', 'medium', 'medium'
FROM generate_series(4101, 4104) i;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000041', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb; i integer;
BEGIN
  FOR i IN 4101..4102 LOOP
    r := public.complete_task_all_triggers(('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid, auth.uid(), false);
    IF (r->>'exp_points')::integer <> 285 OR (r->>'reserve_exp')::integer <> 143
      OR (r->>'quota_bonus_exp')::integer <> 0 THEN
      RAISE EXCEPTION 'Pre-quota rewards or rounding are incorrect: %', r;
    END IF;
  END LOOP;
END; $$;
RESET ROLE;

-- A failure after the bonus write must roll back task, levels, quota and streak.
CREATE FUNCTION pg_temp.reject_progression_ticket() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.battle_energy > OLD.battle_energy THEN RAISE EXCEPTION 'Injected quota failure'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER reject_progression_ticket BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION pg_temp.reject_progression_ticket();
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000004103', auth.uid(), false);
    RAISE EXCEPTION 'Injected quota failure was swallowed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Injected quota failure' THEN RAISE; END IF;
  END;
  IF (SELECT is_completed FROM public.tasks WHERE id = '00000000-0000-4000-8000-000000004103')
    OR (SELECT completed_today FROM public.daily_quotas WHERE user_id = auth.uid()) <> 2
    OR (SELECT current_streak FROM public.daily_quotas WHERE user_id = auth.uid()) <> 10
    OR (SELECT current_level FROM public.user_digimon WHERE name = 'active' AND user_id = auth.uid()) <> 29
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'active' AND user_id = auth.uid()) <> 570
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'reserve' AND user_id = auth.uid()) <> 286
    OR (SELECT battle_energy FROM public.profiles WHERE id = auth.uid()) <> 2 THEN
    RAISE EXCEPTION 'Failed quota completion retained partial rewards';
  END IF;
END; $$;
RESET ROLE;
DROP TRIGGER reject_progression_ticket ON public.profiles;

SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb;
BEGIN
  r := public.complete_task_all_triggers('00000000-0000-4000-8000-000000004103', auth.uid(), false);
  IF (r->>'quota_bonus_exp')::integer <> 1000
    OR (r->>'exp_points')::integer <> 300
    OR (r->'daily_quota'->>'quota_completed')::boolean
    OR NOT (r->'daily_quota'->>'quota_rewarded')::boolean THEN
    RAISE EXCEPTION 'Quota bonus or legacy double-grant protection incorrect: %', r;
  END IF;
  IF (SELECT current_level FROM public.user_digimon WHERE name = 'active' AND user_id = auth.uid()) <> 30
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'active' AND user_id = auth.uid()) <> 870
    OR (SELECT current_level FROM public.user_digimon WHERE name = 'reserve' AND user_id = auth.uid()) <> 30
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'reserve' AND user_id = auth.uid()) <> 436
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'storage' AND user_id = auth.uid()) <> 0 THEN
    RAISE EXCEPTION 'Active/reserve quota levels or storage exclusion incorrect';
  END IF;
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000004103', auth.uid(), false);
    RAISE EXCEPTION 'Repeated third task accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  r := public.complete_task_all_triggers('00000000-0000-4000-8000-000000004104', auth.uid(), false);
  IF (r->>'quota_bonus_exp')::integer <> 0
    OR (SELECT current_level FROM public.user_digimon WHERE name = 'active' AND user_id = auth.uid()) <> 31
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'active' AND user_id = auth.uid()) <> 170 THEN
    RAISE EXCEPTION 'Fourth task granted another quota bonus';
  END IF;
END; $$;
RESET ROLE;

DO $$ BEGIN
  UPDATE public.user_digimon SET current_level = 17, experience_points = 949
    WHERE name = 'active' AND user_id = '00000000-0000-4000-8000-000000000041';
  UPDATE public.user_digimon SET experience_points = experience_points + 2001
    WHERE name = 'active' AND user_id = '00000000-0000-4000-8000-000000000041';
  IF (SELECT current_level FROM public.user_digimon WHERE name = 'active' AND user_id = '00000000-0000-4000-8000-000000000041') <> 20
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'active' AND user_id = '00000000-0000-4000-8000-000000000041') <> 0 THEN
    RAISE EXCEPTION 'Multi-level gain across cap boundary incorrect';
  END IF;
  UPDATE public.user_digimon SET current_level = 98, experience_points = 2500
    WHERE name = 'active' AND user_id = '00000000-0000-4000-8000-000000000041';
  IF (SELECT current_level FROM public.user_digimon WHERE name = 'active' AND user_id = '00000000-0000-4000-8000-000000000041') <> 99
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'active' AND user_id = '00000000-0000-4000-8000-000000000041') <> 1500 THEN
    RAISE EXCEPTION 'Maximum level or remaining EXP incorrect';
  END IF;
END; $$;
-- Verify the unmultiplied quota independently of difficulty and priority.
UPDATE public.daily_quotas SET completed_today = 2, current_streak = 0
  WHERE user_id = '00000000-0000-4000-8000-000000000041';
UPDATE public.user_digimon SET current_level = 29, experience_points = 0
  WHERE user_id = '00000000-0000-4000-8000-000000000041' AND is_active = true;
UPDATE public.user_digimon SET current_level = 29, experience_points = 0
  WHERE user_id = '00000000-0000-4000-8000-000000000041' AND is_active = false;
INSERT INTO public.tasks (id, user_id, description, difficulty, priority)
VALUES ('00000000-0000-4000-8000-000000004105',
  '00000000-0000-4000-8000-000000000041', 'base quota reward', 'easy', 'low');
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb;
BEGIN
  r := public.complete_task_all_triggers('00000000-0000-4000-8000-000000004105', auth.uid(), false);
  IF (r->>'quota_bonus_exp')::integer <> 500
    OR (r->>'exp_points')::integer <> 56
    OR (r->>'reserve_exp')::integer <> 28
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'active' AND user_id = auth.uid()) <> 556
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'reserve' AND user_id = auth.uid()) <> 528
    OR (SELECT experience_points FROM public.user_digimon WHERE name = 'storage' AND user_id = auth.uid()) <> 0 THEN
    RAISE EXCEPTION 'Base quota must award 500 EXP to active/reserve only, independent of task settings: %', r;
  END IF;
END; $$;
RESET ROLE;
ROLLBACK;
SELECT 'Progression cap and atomic quota rewards passed; fixtures rolled back' AS result;
