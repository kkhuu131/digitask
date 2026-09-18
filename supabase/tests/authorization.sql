-- Local-only regression fixtures. All changes roll back, including injected triggers.
BEGIN;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-4000-8000-000000000001', 'db-test-user@example.invalid'),
  ('00000000-0000-4000-8000-000000000002', 'db-test-other@example.invalid'),
  ('00000000-0000-4000-8000-000000000003', 'db-test-admin@example.invalid');
INSERT INTO public.profiles (id, username, saved_stats) VALUES
  ('00000000-0000-4000-8000-000000000001', 'db-test-user', '{"HP": 2}'),
  ('00000000-0000-4000-8000-000000000002', 'db-test-other', '{"HP": 5}'),
  ('00000000-0000-4000-8000-000000000003', 'db-test-admin', '{}');
INSERT INTO public.admin_users (user_id) VALUES ('00000000-0000-4000-8000-000000000003');
INSERT INTO public.user_digimon (id, user_id, digimon_id, name, is_active) VALUES
  ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000001', 1, 'test-active', true),
  ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000002', 1, 'test-other', true);
INSERT INTO public.tasks (id, user_id, description, difficulty, priority)
SELECT ('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  '00000000-0000-4000-8000-000000000001', 'test task', 'easy', 'low'
FROM generate_series(2001, 2005) i;
INSERT INTO public.tasks (id, user_id, description) VALUES
  ('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000000002', 'other task');

DO $$
DECLARE f regprocedure;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.admin_rename_user(uuid,text)'::regprocedure,
    'public.allocate_stat(uuid,text,uuid)'::regprocedure,
    'public.complete_task_all_triggers(uuid,uuid,boolean)'::regprocedure,
    'public.spend_energy_self(integer)'::regprocedure,
    'public.grant_energy_self(integer)'::regprocedure
  ] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'Anonymous execution remains enabled for %', f;
    END IF;
    IF NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'Authenticated compatibility was lost for %', f;
    END IF;
  END LOOP;
END;
$$;

SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000002001', '00000000-0000-4000-8000-000000000001', false);
    RAISE EXCEPTION 'Anonymous task completion was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END; $$;
RESET ROLE;

SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN
    PERFORM public.spend_energy_self(1);
    RAISE EXCEPTION 'Missing JWT identity was accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END; $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb; i integer;
BEGIN
  BEGIN
    PERFORM public.admin_rename_user('00000000-0000-4000-8000-000000000002', 'stolen');
    RAISE EXCEPTION 'Non-admin rename was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.allocate_stat('00000000-0000-4000-8000-000000001002', 'HP', '00000000-0000-4000-8000-000000000002');
    RAISE EXCEPTION 'Spoofed allocation user was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.allocate_stat('00000000-0000-4000-8000-000000001002', 'HP', '00000000-0000-4000-8000-000000000001');
    RAISE EXCEPTION 'Allocation to another user pet was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.allocate_stat('00000000-0000-4000-8000-000000001001', 'ABI', '00000000-0000-4000-8000-000000000001');
    RAISE EXCEPTION 'Invalid stat was accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  IF NOT public.allocate_stat('00000000-0000-4000-8000-000000001001', 'HP', '00000000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'Valid saved-stat allocation failed';
  END IF;
  IF (SELECT hp_bonus FROM public.user_digimon WHERE id = '00000000-0000-4000-8000-000000001001') <> 1 OR
    (SELECT (saved_stats->>'HP')::integer FROM public.profiles WHERE id = auth.uid()) <> 1 THEN
    RAISE EXCEPTION 'Stat allocation did not transfer exactly one point';
  END IF;
  UPDATE public.user_digimon SET hp_bonus = 20 WHERE id = '00000000-0000-4000-8000-000000001001';
  IF public.allocate_stat('00000000-0000-4000-8000-000000001001', 'HP', auth.uid()) OR
    (SELECT (saved_stats->>'HP')::integer FROM public.profiles WHERE id = auth.uid()) <> 1 THEN
    RAISE EXCEPTION 'Capped allocation consumed a saved point or exceeded the cap';
  END IF;
  UPDATE public.user_digimon SET hp_bonus = 1 WHERE id = '00000000-0000-4000-8000-000000001001';
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000000002', false);
    RAISE EXCEPTION 'Spoofed task user was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000003001', '00000000-0000-4000-8000-000000000001', false);
    RAISE EXCEPTION 'Another user task was completed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Task not found or does not belong to user' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.grant_energy_self(1);
    RAISE EXCEPTION 'Standalone ticket minting was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM public.grant_energy_self(0);
  IF public.spend_energy_self(NULL) OR public.spend_energy_self(-1) THEN
    RAISE EXCEPTION 'Invalid ticket amount was accepted';
  END IF;

  FOR i IN 2001..2003 LOOP
    r := public.complete_task_all_triggers(('00000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid, auth.uid(), false);
    IF (r->'daily_quota'->>'completed_today')::integer <> i - 2000 THEN
      RAISE EXCEPTION 'Task completion incremented quota incorrectly: %', r;
    END IF;
    IF (SELECT tasks_completed_count FROM public.user_milestones WHERE user_id = auth.uid()) IS DISTINCT FROM i - 2000 THEN
      RAISE EXCEPTION 'Lifetime task count failed before or at the daily quota threshold';
    END IF;
    IF (r->'daily_quota'->>'quota_completed')::boolean IS DISTINCT FROM (i = 2003) THEN
      RAISE EXCEPTION 'Quota reward signaled incorrectly: %', r;
    END IF;
  END LOOP;
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000002001', auth.uid(), false);
    RAISE EXCEPTION 'Repeated task completion was allowed';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  IF (SELECT completed_today FROM public.daily_quotas WHERE user_id = auth.uid()) <> 3 OR
    (SELECT tasks_completed_count FROM public.user_milestones WHERE user_id = auth.uid()) IS DISTINCT FROM 3 OR
    (SELECT current_streak FROM public.daily_quotas WHERE user_id = auth.uid()) <> 1 OR
    (SELECT battle_energy FROM public.profiles WHERE id = auth.uid()) <> 3 OR
    (SELECT count(*) FROM public.daily_quotas WHERE user_id = auth.uid()) <> 1 THEN
    RAISE EXCEPTION 'Task rewards, quota or streak were duplicated';
  END IF;
  IF NOT public.spend_energy_self(1) OR NOT public.spend_energy_self(1) OR public.spend_energy_self(2) THEN
    RAISE EXCEPTION 'Valid spending or insufficient-funds behavior failed';
  END IF;
END;
$$;
RESET ROLE;

-- Inject a reward failure and verify the entire task transaction rolls back.
CREATE FUNCTION pg_temp.reject_ticket_reward() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.battle_energy > OLD.battle_energy THEN RAISE EXCEPTION 'Injected reward failure'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER test_reject_ticket_reward BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION pg_temp.reject_ticket_reward();
SET LOCAL ROLE authenticated;
DO $$
DECLARE before_xp integer;
BEGIN
  SELECT experience_points INTO before_xp FROM public.user_digimon WHERE id = '00000000-0000-4000-8000-000000001001';
  BEGIN
    PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000002004', auth.uid(), false);
    RAISE EXCEPTION 'Injected reward failure was swallowed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Injected reward failure' THEN RAISE; END IF;
  END;
  IF (SELECT is_completed FROM public.tasks WHERE id = '00000000-0000-4000-8000-000000002004') OR
    (SELECT completed_today FROM public.daily_quotas WHERE user_id = auth.uid()) <> 3 OR
    (SELECT tasks_completed_count FROM public.user_milestones WHERE user_id = auth.uid()) IS DISTINCT FROM 3 OR
    (SELECT experience_points FROM public.user_digimon WHERE id = '00000000-0000-4000-8000-000000001001') <> before_xp THEN
    RAISE EXCEPTION 'Task, quota or experience partially committed';
  END IF;
END; $$;
RESET ROLE;
DROP TRIGGER test_reject_ticket_reward ON public.profiles;

SET LOCAL ROLE authenticated;
DO $$
DECLARE before_xp integer; r jsonb;
BEGIN
  UPDATE public.user_digimon SET is_active = false WHERE id = '00000000-0000-4000-8000-000000001001';
  SELECT experience_points INTO before_xp FROM public.user_digimon WHERE id = '00000000-0000-4000-8000-000000001001';
  r := public.complete_task_all_triggers('00000000-0000-4000-8000-000000002005', auth.uid(), false);
  IF (SELECT experience_points FROM public.user_digimon WHERE id = '00000000-0000-4000-8000-000000001001')
    <> before_xp + (r->>'reserve_exp')::integer OR (r->'daily_quota'->>'quota_completed')::boolean THEN
    RAISE EXCEPTION 'Reserve EXP without an active pet or once-daily quota readiness failed';
  END IF;
  IF (SELECT tasks_completed_count FROM public.user_milestones WHERE user_id = auth.uid()) IS DISTINCT FROM 4 THEN
    RAISE EXCEPTION 'Tasks beyond the daily quota did not count';
  END IF;
  UPDATE public.tasks SET description = 'edited completed task'
    WHERE id = '00000000-0000-4000-8000-000000002005';
  UPDATE public.tasks SET is_completed = false, completed_at = NULL
    WHERE id = '00000000-0000-4000-8000-000000002005';
  UPDATE public.daily_quotas SET completed_today = 0 WHERE user_id = auth.uid();
  IF (SELECT tasks_completed_count FROM public.user_milestones WHERE user_id = auth.uid()) IS DISTINCT FROM 4 THEN
    RAISE EXCEPTION 'Edits or daily resets changed lifetime progress';
  END IF;
  PERFORM public.complete_task_all_triggers('00000000-0000-4000-8000-000000002005', auth.uid(), false);
  DELETE FROM public.tasks WHERE id = '00000000-0000-4000-8000-000000002005';
  IF (SELECT tasks_completed_count FROM public.user_milestones WHERE user_id = auth.uid()) IS DISTINCT FROM 5 THEN
    RAISE EXCEPTION 'Recurring completion or deletion lost lifetime progress';
  END IF;
END; $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  IF public.admin_rename_user('00000000-0000-4000-8000-000000000002', 'admin-renamed') <> 'admin-renamed' THEN
    RAISE EXCEPTION 'Authorized administrator rename failed';
  END IF;
END; $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
SET LOCAL ROLE authenticated;
DO $$
BEGIN
  BEGIN
    UPDATE public.profiles SET battles_won = 999 WHERE id = auth.uid();
    RAISE EXCEPTION 'Browser counter update was permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  UPDATE public.profiles SET display_name = 'Allowed profile edit' WHERE id = auth.uid();
  BEGIN
    INSERT INTO public.team_battles (user_id, opponent_id, winner_id, user_team, opponent_team)
    VALUES ('00000000-0000-4000-8000-000000000002', auth.uid(), auth.uid(), '[]', '[]');
    RAISE EXCEPTION 'Spoofed battle initiator was permitted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.team_battles (user_id, opponent_id, winner_id, user_team, opponent_team)
    VALUES (auth.uid(), '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', '[]', '[]');
    RAISE EXCEPTION 'Unrelated winner was permitted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  INSERT INTO public.team_battles (user_id, opponent_id, winner_id, user_team, opponent_team)
  VALUES (auth.uid(), '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', '[]', '[]');
  INSERT INTO public.team_battles (user_id, winner_id, user_team, opponent_team)
  VALUES (auth.uid(), NULL, '[]', '[]');
  INSERT INTO public.team_battles (user_id, opponent_id, winner_id, user_team, opponent_team)
  VALUES (auth.uid(), '00000000-0000-4000-8000-000000000002', auth.uid(), '[]', '[]');
  IF (SELECT battles_completed FROM public.profiles WHERE id = auth.uid()) <> 3 OR
    (SELECT battles_won FROM public.profiles WHERE id = auth.uid()) <> 1 OR
    (SELECT battles_completed FROM public.profiles WHERE id = '00000000-0000-4000-8000-000000000002') <> 2 OR
    (SELECT battles_won FROM public.profiles WHERE id = '00000000-0000-4000-8000-000000000002') <> 1 THEN
    RAISE EXCEPTION 'Battle counters were duplicated or opponent counters were not updated';
  END IF;
  UPDATE public.user_digimon SET current_level = 1, experience_points = 550
  WHERE id = '00000000-0000-4000-8000-000000001001';
  IF (SELECT current_level FROM public.user_digimon WHERE id = '00000000-0000-4000-8000-000000001001') <> 3 OR
    (SELECT experience_points FROM public.user_digimon WHERE id = '00000000-0000-4000-8000-000000001001') <> 200 THEN
    RAISE EXCEPTION 'Multi-level progression did not persist correctly';
  END IF;
END;
$$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM pg_trigger WHERE tgfoid = 'public.update_battle_stats()'::regprocedure AND NOT tgisinternal) <> 1 OR
    (SELECT count(*) FROM pg_trigger WHERE tgfoid = 'public.level_up_digimon()'::regprocedure AND NOT tgisinternal) <> 1 THEN
    RAISE EXCEPTION 'Duplicate battle or progression writers remain';
  END IF;
END; $$;

ROLLBACK;
SELECT 'Authorization and atomic-reward regressions passed; fixtures rolled back' AS result;
