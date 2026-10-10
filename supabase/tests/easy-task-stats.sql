-- Local-only easy-task stat rewards, allocation caps and rollback.
BEGIN;
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-4000-8000-000000000042', 'easy-stats@example.invalid');
INSERT INTO public.profiles (id, username) VALUES
  ('00000000-0000-4000-8000-000000000042', 'easy-stats-test');
INSERT INTO public.user_digimon (id, user_id, digimon_id, name, is_active, current_level)
VALUES ('00000000-0000-4000-8000-000000004201', '00000000-0000-4000-8000-000000000042', 1, 'easy-stats', true, 29);
INSERT INTO public.tasks (id, user_id, description, difficulty, priority, category)
SELECT ('00000000-0000-4000-8000-' || lpad((4200 + i)::text, 12, '0'))::uuid,
  '00000000-0000-4000-8000-000000000042', 'easy task', 'easy', 'low', category
FROM unnest(ARRAY['HP','SP','ATK','DEF','INT','SPD','HP','HP',NULL,'SP'])
  WITH ORDINALITY AS categories(category, i);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000042', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb; i integer;
BEGIN
  FOR i IN 4201..4206 LOOP
    r := public.complete_task_all_triggers(('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid, auth.uid(), true);
    IF (r->>'stat_points')::integer <> 1 OR NOT (r->>'auto_allocated')::boolean THEN
      RAISE EXCEPTION 'Easy task did not allocate one point: %', r;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM public.user_digimon WHERE user_id = auth.uid()
    AND (hp_bonus <> 1 OR sp_bonus <> 1 OR atk_bonus <> 1 OR def_bonus <> 1 OR int_bonus <> 1 OR spd_bonus <> 1)) THEN
    RAISE EXCEPTION 'Easy category reward was not allocated correctly';
  END IF;
  r := public.complete_task_all_triggers('00000000-0000-4000-8000-000000004207', auth.uid(), false);
  IF (r->>'auto_allocated')::boolean OR (r->>'stat_points')::integer <> 1
    OR (SELECT (saved_stats->>'HP')::integer FROM public.profiles WHERE id = auth.uid()) <> 1 THEN
    RAISE EXCEPTION 'Manual easy-task reward was not saved';
  END IF;
  UPDATE public.user_digimon SET hp_bonus = 15 WHERE user_id = auth.uid();
  r := public.complete_task_all_triggers('00000000-0000-4000-8000-000000004208', auth.uid(), true);
  IF (r->>'auto_allocated')::boolean
    OR (SELECT hp_bonus FROM public.user_digimon WHERE user_id = auth.uid()) <> 15
    OR (SELECT (saved_stats->>'HP')::integer FROM public.profiles WHERE id = auth.uid()) <> 2 THEN
    RAISE EXCEPTION 'Capped easy-task point was not saved instead';
  END IF;
  r := public.complete_task_all_triggers('00000000-0000-4000-8000-000000004209', auth.uid(), true);
  IF (r->>'stat_points')::integer <> 0 OR (r->>'auto_allocated')::boolean THEN
    RAISE EXCEPTION 'Uncategorized task invented a stat category';
  END IF;
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000004207', auth.uid(), false);
    RAISE EXCEPTION 'Repeated easy task accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  IF (SELECT (saved_stats->>'HP')::integer FROM public.profiles WHERE id = auth.uid()) <> 2 THEN
    RAISE EXCEPTION 'Repeated easy task duplicated stats';
  END IF;
END; $$;
RESET ROLE;

CREATE FUNCTION pg_temp.reject_easy_task_ticket() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.battle_energy > OLD.battle_energy THEN RAISE EXCEPTION 'Injected easy stat failure'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER reject_easy_task_ticket BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION pg_temp.reject_easy_task_ticket();
SET LOCAL ROLE authenticated;
DO $$
DECLARE before_stats jsonb;
BEGIN
  SELECT saved_stats INTO before_stats FROM public.profiles WHERE id = auth.uid();
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000004210', auth.uid(), false);
    RAISE EXCEPTION 'Easy stat failure swallowed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Injected easy stat failure' THEN RAISE; END IF;
  END;
  IF (SELECT saved_stats FROM public.profiles WHERE id = auth.uid()) IS DISTINCT FROM before_stats
    OR (SELECT is_completed FROM public.tasks WHERE id = '00000000-0000-4000-8000-000000004210')
    OR (SELECT completed_today FROM public.daily_quotas WHERE user_id = auth.uid()) <> 9 THEN
    RAISE EXCEPTION 'Failed easy task retained partial stats or completion';
  END IF;
END; $$;
RESET ROLE;
ROLLBACK;
SELECT 'Easy-task stat allocation, saved points, caps, retries and rollback passed' AS result;
