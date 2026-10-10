-- Local-only; fixtures and the injected failure trigger roll back together.
BEGIN;
INSERT INTO auth.users (id, email) VALUES
 ('00000000-0000-4000-8000-000000000051', 'batch-stats@example.invalid'),
 ('00000000-0000-4000-8000-000000000052', 'batch-other@example.invalid');
INSERT INTO public.profiles (id, username, saved_stats) VALUES
 ('00000000-0000-4000-8000-000000000051', 'batch-stats', '{"HP":10,"SP":0,"ATK":8,"DEF":10,"INT":5,"SPD":5,"extra":7}'),
 ('00000000-0000-4000-8000-000000000052', 'batch-other', '{"HP":10}');
INSERT INTO public.user_digimon (id, user_id, digimon_id, name, abi) VALUES
 ('00000000-0000-4000-8000-000000001051', '00000000-0000-4000-8000-000000000051', 1, 'Batch test', 0),
 ('00000000-0000-4000-8000-000000001052', '00000000-0000-4000-8000-000000000052', 1, 'Other batch test', 0);

DO $$ BEGIN
 IF has_function_privilege('anon', 'public.allocate_stats(uuid,jsonb,jsonb)', 'EXECUTE') OR
    NOT has_function_privilege('authenticated', 'public.allocate_stats(uuid,jsonb,jsonb)', 'EXECUTE') THEN
   RAISE EXCEPTION 'Invalid batch allocation grants'; END IF;
 BEGIN
   PERFORM public.allocate_stats('00000000-0000-4000-8000-000000001051', '{"HP":1}', '{}');
   RAISE EXCEPTION 'Missing JWT accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN
   PERFORM public.allocate_stats('00000000-0000-4000-8000-000000001051', '{"HP":1}', '{}');
   RAISE EXCEPTION 'Anonymous execution allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000051', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE
 p uuid := '00000000-0000-4000-8000-000000001051';
 z jsonb := '{"HP":0,"SP":0,"ATK":0,"DEF":0,"INT":0,"SPD":0}';
 payload jsonb;
 r jsonb;
BEGIN
 BEGIN
   PERFORM public.allocate_stats('00000000-0000-4000-8000-000000001052', '{"HP":1}', z);
   RAISE EXCEPTION 'Cross-user allocation allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 FOR payload IN SELECT value FROM jsonb_array_elements(
   '[{},[],null,{"ABI":1},{"hp":1},{"HP":-1},{"HP":0.5},{"HP":"1"},{"HP":null},{"HP":2147483648}]'
 ) LOOP
   BEGIN
     PERFORM public.allocate_stats(p, payload, z);
     RAISE EXCEPTION 'Invalid allocation accepted: %', payload;
   EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 END LOOP;
 BEGIN
   PERFORM public.allocate_stats(p, '{"HP":1}', '{}');
   RAISE EXCEPTION 'Missing expected bonuses accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 r := public.allocate_stats(p, '{"HP":2,"ATK":3}', z);
 IF NOT (r->>'success')::boolean OR (r->'digimon'->>'hp_bonus')::integer <> 2 OR
    (r->'digimon'->>'atk_bonus')::integer <> 3 OR r->'saved_stats' <> '{"HP":8,"SP":0,"ATK":5,"DEF":10,"INT":5,"SPD":5,"extra":7}'::jsonb THEN
   RAISE EXCEPTION 'Batch did not transfer exactly the requested points: %', r; END IF;
 r := public.allocate_stats(p, '{"HP":2,"ATK":3}', z);
 IF r->>'reason' <> 'changed' OR (r->>'success')::boolean THEN
   RAISE EXCEPTION 'Stale retry accepted'; END IF;
 z := '{"HP":2,"SP":0,"ATK":3,"DEF":0,"INT":0,"SPD":0}';
 r := public.allocate_stats(p, '{"HP":1,"SP":1}', z);
 IF r->>'reason' <> 'points' OR (r->'saved_stats'->>'HP')::integer <> 8 THEN
   RAISE EXCEPTION 'Insufficient-stat failure changed another balance'; END IF;
 r := public.allocate_stats(p, '{"HP":8,"ATK":5,"DEF":3}', z);
 IF r->>'reason' <> 'cap' THEN RAISE EXCEPTION 'Combined cap not enforced'; END IF;
 IF (SELECT hp_bonus + atk_bonus FROM public.user_digimon WHERE id=p) <> 5 OR
    (SELECT (saved_stats->>'HP')::integer FROM public.profiles WHERE id=auth.uid()) <> 8 THEN
   RAISE EXCEPTION 'Rejected batch performed a partial write'; END IF;
END $$;
RESET ROLE;

CREATE FUNCTION public.batch_stat_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'injected stat balance failure'; END $$;
CREATE TRIGGER batch_stat_test_failure BEFORE UPDATE OF saved_stats ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.batch_stat_test_failure();
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN
   PERFORM public.allocate_stats('00000000-0000-4000-8000-000000001051', '{"HP":1,"ATK":1}',
     '{"HP":2,"SP":0,"ATK":3,"DEF":0,"INT":0,"SPD":0}');
   RAISE EXCEPTION 'Injected failure was swallowed';
 EXCEPTION WHEN raise_exception THEN
   IF SQLERRM <> 'injected stat balance failure' THEN RAISE; END IF;
 END;
 IF (SELECT hp_bonus + atk_bonus FROM public.user_digimon WHERE id='00000000-0000-4000-8000-000000001051') <> 5 OR
    (SELECT (saved_stats->>'HP')::integer FROM public.profiles WHERE id=auth.uid()) <> 8 THEN
   RAISE EXCEPTION 'Failure did not roll back the whole batch'; END IF;
END $$;
RESET ROLE;
DROP TRIGGER batch_stat_test_failure ON public.profiles;
SET LOCAL ROLE authenticated;
DO $$ DECLARE r jsonb; BEGIN
 r := public.allocate_stats('00000000-0000-4000-8000-000000001051', '{"HP":8,"ATK":5,"DEF":2}',
   '{"HP":2,"SP":0,"ATK":3,"DEF":0,"INT":0,"SPD":0}');
 IF NOT (r->>'success')::boolean OR (r->'digimon'->>'hp_bonus')::integer <> 10 OR
    (r->'digimon'->>'atk_bonus')::integer <> 8 OR (r->'digimon'->>'def_bonus')::integer <> 2 THEN
   RAISE EXCEPTION 'Exact-cap batch rejected'; END IF;
 r := public.allocate_stats('00000000-0000-4000-8000-000000001051', '{"DEF":1}',
   '{"HP":10,"SP":0,"ATK":8,"DEF":2,"INT":0,"SPD":0}');
 IF r->>'reason' <> 'cap' THEN RAISE EXCEPTION 'Already capped batch accepted'; END IF;
END $$;
RESET ROLE;
UPDATE public.user_digimon SET abi=3 WHERE id='00000000-0000-4000-8000-000000001051';
SET LOCAL ROLE authenticated;
DO $$ DECLARE r jsonb; BEGIN
 r := public.allocate_stats('00000000-0000-4000-8000-000000001051', '{"DEF":3}',
   '{"HP":10,"SP":0,"ATK":8,"DEF":2,"INT":0,"SPD":0}');
 IF NOT (r->>'success')::boolean THEN RAISE EXCEPTION 'ABI cap increase ignored'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'Atomic batch stats, caps, balances, invalid input, stale retries and authorization passed' AS result;
