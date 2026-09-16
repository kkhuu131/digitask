BEGIN;
INSERT INTO auth.users (id,email) VALUES
 ('00000000-0000-4000-8000-000000000011','claims@example.invalid'),
 ('00000000-0000-4000-8000-000000000012','claims-other@example.invalid');
INSERT INTO public.profiles (id,username) VALUES
 ('00000000-0000-4000-8000-000000000011','claims-test'),
 ('00000000-0000-4000-8000-000000000012','claims-other');
INSERT INTO public.user_titles (id,user_id,title_id) VALUES
 (900001,'00000000-0000-4000-8000-000000000011',2),
 (900002,'00000000-0000-4000-8000-000000000011',3),
 (900003,'00000000-0000-4000-8000-000000000011',4),
 (900004,'00000000-0000-4000-8000-000000000012',2);
DO $$ BEGIN
 IF has_function_privilege('anon','public.claim_achievement(integer,integer)','EXECUTE') THEN
   RAISE EXCEPTION 'Anonymous claim permission'; END IF;
 BEGIN PERFORM public.claim_achievement(900001); RAISE EXCEPTION 'Anonymous claim succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000011',true);
DO $$ DECLARE r jsonb; BEGIN
 BEGIN PERFORM public.claim_achievement(900004); RAISE EXCEPTION 'Cross-user claim succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.user_titles SET claimed_at=now() WHERE id=900001;
   RAISE EXCEPTION 'Browser claim timestamp write succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.claim_achievement(900001,1); RAISE EXCEPTION 'Unexpected egg accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 r:=public.claim_achievement(900001);
 IF NOT (r->>'claimed')::boolean OR (SELECT bits FROM public.user_currency WHERE user_id=auth.uid()) <> 2200 THEN
   RAISE EXCEPTION 'Bits claim failed to initialize currency'; END IF;
 r:=public.claim_achievement(900001);
 IF (r->>'claimed')::boolean OR (SELECT bits FROM public.user_currency WHERE user_id=auth.uid()) <> 2200 THEN
   RAISE EXCEPTION 'Repeat claim duplicated rewards'; END IF;
 BEGIN PERFORM public.claim_achievement(900002); RAISE EXCEPTION 'Missing egg accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.claim_achievement(900002,1); RAISE EXCEPTION 'Out-of-pool egg accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 r:=public.claim_achievement(900002,18);
 IF NOT (r->>'claimed')::boolean OR (r->>'is_in_storage')::boolean OR
    (SELECT bits FROM public.user_currency WHERE user_id=auth.uid()) <> 2700 OR
    NOT EXISTS (SELECT 1 FROM public.user_discovered_digimon WHERE user_id=auth.uid() AND digimon_id=18) THEN
   RAISE EXCEPTION 'Egg claim did not atomically grant currency, pet and discovery'; END IF;
 -- Tutorial inserts all three pets; duplicate species remain one discovery.
 INSERT INTO public.user_digimon (user_id,digimon_id,name,is_active,is_in_storage)
 SELECT auth.uid(),i,'starter',false,false FROM generate_series(1,3) i;
 INSERT INTO public.user_digimon (user_id,digimon_id,name,is_active,is_in_storage)
 SELECT auth.uid(),1,'duplicate',false,false FROM generate_series(1,5);
 IF (SELECT count(*) FROM public.user_discovered_digimon WHERE user_id=auth.uid())<>4 THEN
   RAISE EXCEPTION 'Starter discovery missing or duplicated'; END IF;
 r:=public.claim_achievement(900003,19);
 IF NOT (r->>'is_in_storage')::boolean THEN RAISE EXCEPTION 'Full party egg not stored'; END IF;
 UPDATE public.user_digimon SET digimon_id=4 WHERE user_id=auth.uid() AND name='starter' AND digimon_id=3;
 IF NOT EXISTS (SELECT 1 FROM public.user_discovered_digimon WHERE user_id=auth.uid() AND digimon_id=4) OR
    NOT EXISTS (SELECT 1 FROM public.user_discovered_digimon WHERE user_id=auth.uid() AND digimon_id=3) THEN
   RAISE EXCEPTION 'Evolution did not preserve and add discoveries'; END IF;
END $$;
RESET ROLE;
INSERT INTO public.user_titles (id,user_id,title_id) VALUES (900005,'00000000-0000-4000-8000-000000000011',5);
CREATE FUNCTION pg_temp.fail_reward() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'injected reward failure'; END $$;
CREATE TRIGGER claim_failure BEFORE INSERT ON public.user_digimon FOR EACH ROW EXECUTE FUNCTION pg_temp.fail_reward();
SET LOCAL ROLE authenticated;
DO $$ DECLARE v_bits integer; v_pets integer; BEGIN
 SELECT bits INTO v_bits FROM public.user_currency WHERE user_id=auth.uid();
 SELECT count(*) INTO v_pets FROM public.user_digimon WHERE user_id=auth.uid();
 BEGIN PERFORM public.claim_achievement(900005,18); RAISE EXCEPTION 'Failure injection missed';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'injected reward failure' THEN RAISE; END IF; END;
 IF (SELECT claimed_at FROM public.user_titles WHERE id=900005) IS NOT NULL OR
   (SELECT bits FROM public.user_currency WHERE user_id=auth.uid())<>v_bits OR
   (SELECT count(*) FROM public.user_digimon WHERE user_id=auth.uid())<>v_pets THEN
   RAISE EXCEPTION 'Failed reward left a partial claim'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'Atomic achievement, ownership, rollback, repeat claim and discovery tests passed' AS result;
