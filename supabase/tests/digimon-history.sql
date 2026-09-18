-- Local-only evolution history and permission fixtures; every change rolls back.
BEGIN;
INSERT INTO auth.users (id,email) VALUES
 ('00000000-0000-4000-8000-000000930001','history@example.invalid');
INSERT INTO public.profiles (id,username) VALUES
 ('00000000-0000-4000-8000-000000930001','history-test');
INSERT INTO public.user_digimon (id,user_id,digimon_id,name,is_active) VALUES
 ('00000000-0000-4000-8000-000000930002','00000000-0000-4000-8000-000000930001',1,'history-test',false);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000930001',true);
UPDATE public.user_digimon SET digimon_id=2 WHERE id='00000000-0000-4000-8000-000000930002';
UPDATE public.user_digimon SET digimon_id=1 WHERE id='00000000-0000-4000-8000-000000930002';
UPDATE public.user_digimon SET digimon_id=3 WHERE id='00000000-0000-4000-8000-000000930002';
UPDATE public.user_digimon SET digimon_id=3, name='renamed', happiness=80
 WHERE id='00000000-0000-4000-8000-000000930002';
DO $$ BEGIN
 IF (SELECT array_agg(digimon_id ORDER BY id) FROM public.user_digimon_history
   WHERE user_digimon_id='00000000-0000-4000-8000-000000930002') <> ARRAY[1,2,1,3] THEN
   RAISE EXCEPTION 'History lost repeated species, order, or recorded a non-species change'; END IF;
 BEGIN
   INSERT INTO public.user_digimon_history (user_digimon_id,digimon_id)
   VALUES ('00000000-0000-4000-8000-000000930002',4);
   RAISE EXCEPTION 'Browser forged history';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   DELETE FROM public.user_digimon_history WHERE user_digimon_id='00000000-0000-4000-8000-000000930002';
   RAISE EXCEPTION 'Browser deleted history';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   UPDATE public.user_digimon_history SET digimon_id=4;
   RAISE EXCEPTION 'Browser modified history';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 -- Simulate a failure after the species/history writes: both must roll back.
 BEGIN
   UPDATE public.user_digimon SET digimon_id=4 WHERE id='00000000-0000-4000-8000-000000930002';
   RAISE EXCEPTION 'simulated failure' USING ERRCODE='P0002';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 IF (SELECT count(*) FROM public.user_digimon_history
   WHERE user_digimon_id='00000000-0000-4000-8000-000000930002') <> 4 OR
   (SELECT digimon_id FROM public.user_digimon WHERE id='00000000-0000-4000-8000-000000930002') <> 3 THEN
   RAISE EXCEPTION 'Failed species change retained history or changed species'; END IF;
END $$;
RESET ROLE;
-- Exercise the explicit backfill twice against a pet predating the history trigger.
DELETE FROM public.user_digimon_history WHERE user_digimon_id='00000000-0000-4000-8000-000000930002';
__DIGIMON_HISTORY_BACKFILL__
__DIGIMON_HISTORY_BACKFILL__
DO $$ BEGIN
 IF (SELECT count(*) FROM public.user_digimon_history
   WHERE user_digimon_id='00000000-0000-4000-8000-000000930002' AND digimon_id=3
     AND is_starting_point AND is_backfilled) <> 1 THEN
   RAISE EXCEPTION 'Backfill did not preserve current species once'; END IF;
 IF has_function_privilege('authenticated','public.record_digimon_history()','EXECUTE') OR
   has_function_privilege('anon','public.record_digimon_history()','EXECUTE') THEN
   RAISE EXCEPTION 'Browser can execute history trigger'; END IF;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.user_digimon_history
   WHERE user_digimon_id='00000000-0000-4000-8000-000000930002') <> 1 THEN
   RAISE EXCEPTION 'History visibility differs from public pet visibility'; END IF;
END $$;
RESET ROLE;
DELETE FROM public.user_digimon WHERE id='00000000-0000-4000-8000-000000930002';
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.user_digimon_history WHERE user_digimon_id='00000000-0000-4000-8000-000000930002') THEN
   RAISE EXCEPTION 'Pet deletion left orphan history'; END IF;
END $$;
ROLLBACK;
SELECT 'Digimon history order, repeats, rollback, backfill, visibility and write protection passed' AS result;
