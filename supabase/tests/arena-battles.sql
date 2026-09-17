-- Local-only fixtures; simulate a lost response by repeating the same settlement.
BEGIN;
INSERT INTO auth.users(id,email) VALUES
 ('00000000-0000-4000-8000-000000000021','arena-test@example.invalid'),
 ('00000000-0000-4000-8000-000000000022','arena-other@example.invalid');
INSERT INTO public.profiles(id,username,battle_energy) VALUES
 ('00000000-0000-4000-8000-000000000021','arena-test',3),
 ('00000000-0000-4000-8000-000000000022','arena-other',3);
INSERT INTO public.user_digimon(id,user_id,digimon_id,name,is_in_storage) VALUES
 ('00000000-0000-4000-8000-000000021001','00000000-0000-4000-8000-000000000021',1,'arena-pet',false),
 ('00000000-0000-4000-8000-000000021002','00000000-0000-4000-8000-000000000021',2,'stored-pet',true),
 ('00000000-0000-4000-8000-000000022001','00000000-0000-4000-8000-000000000022',1,'other-pet',false);
INSERT INTO public.arena_battle_offers(id,user_id,difficulty,opponent_name,opponent_team) VALUES
 ('00000000-0000-4000-8000-000000023001','00000000-0000-4000-8000-000000000021','easy','test-cpu','[{"digimon_id":1},{"digimon_id":2},{"digimon_id":3}]'),
 ('00000000-0000-4000-8000-000000023002','00000000-0000-4000-8000-000000000021','hard','test-cpu','[{"digimon_id":1},{"digimon_id":2},{"digimon_id":3}]');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000021',true);
DO $$ BEGIN
 IF has_function_privilege('authenticated','public.settle_arena_battle(uuid,uuid,jsonb)','EXECUTE') OR
    has_function_privilege('anon','public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[])','EXECUTE') OR
    has_function_privilege('authenticated','public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[])','EXECUTE') OR
    has_table_privilege('authenticated','public.arena_battle_requests','INSERT') OR
    has_table_privilege('authenticated','public.arena_battle_requests','UPDATE') THEN
    RAISE EXCEPTION 'Browser can forge an arena settlement'; END IF;
 BEGIN PERFORM public.settle_arena_battle(auth.uid(),gen_random_uuid(),'{}');
   RAISE EXCEPTION 'Browser settlement succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE service_role;
DO $$ DECLARE u uuid:='00000000-0000-4000-8000-000000000021';
  r uuid:='00000000-0000-4000-8000-000000024001';
  offer uuid:='00000000-0000-4000-8000-000000023001';
  pet uuid:='00000000-0000-4000-8000-000000021001';
  prepared jsonb; settled jsonb; replay jsonb;
BEGIN
 BEGIN PERFORM public.prepare_arena_battle(u,r,offer,ARRAY[pet,pet],ARRAY['balanced','balanced']);
   RAISE EXCEPTION 'Duplicate team accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.prepare_arena_battle(u,r,offer,ARRAY[pet],ARRAY['invalid']);
   RAISE EXCEPTION 'Invalid behavior accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.prepare_arena_battle(u,r,offer,ARRAY['00000000-0000-4000-8000-000000022001'::uuid],ARRAY['balanced']);
   RAISE EXCEPTION 'Other user pet accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.prepare_arena_battle(u,r,offer,ARRAY['00000000-0000-4000-8000-000000021002'::uuid],ARRAY['balanced']);
   RAISE EXCEPTION 'Stored pet accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 prepared:=public.prepare_arena_battle(u,r,offer,ARRAY[pet],ARRAY['balanced']);
 IF (SELECT battle_energy FROM public.profiles WHERE id=u)<>3 OR
   EXISTS(SELECT 1 FROM public.team_battles WHERE user_id=u) THEN RAISE EXCEPTION 'Preparation charged a ticket'; END IF;
 IF public.prepare_arena_battle(u,r,NULL,NULL,NULL) IS DISTINCT FROM prepared THEN
   RAISE EXCEPTION 'Retry changed saved seed/snapshot'; END IF;
 BEGIN PERFORM public.prepare_arena_battle('00000000-0000-4000-8000-000000000022',r,NULL,NULL,NULL);
   RAISE EXCEPTION 'Cross-user request accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.prepare_arena_battle(u,'00000000-0000-4000-8000-000000024002',offer,ARRAY[pet],ARRAY['balanced']);
   RAISE EXCEPTION 'Second pending request accepted'; EXCEPTION WHEN raise_exception THEN
     IF SQLERRM<>'Resume the existing battle request before starting another' THEN RAISE; END IF; END;
 BEGIN PERFORM public.settle_arena_battle(u,r,'{"winner":"other"}');
   RAISE EXCEPTION 'Invalid outcome accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 replay:=jsonb_build_object('version',1,'engineVersion',1,'seed',prepared->'seed',
   'winner','user','durationMs',16,'frames','[{}]'::jsonb);
 settled:=public.settle_arena_battle(u,r,replay);
 IF settled->>'status'<>'settled' OR (SELECT battle_energy FROM public.profiles WHERE id=u)<>2 OR
   (SELECT bits FROM public.user_currency WHERE user_id=u)<>2075 OR
   (SELECT count(*) FROM public.team_battles WHERE user_id=u)<>1 OR
   (SELECT battles_won FROM public.profiles WHERE id=u)<>1 OR
   (SELECT battles_completed FROM public.profiles WHERE id=u)<>1 THEN
   RAISE EXCEPTION 'Settlement did not commit ticket, currency, history and counters together'; END IF;
 IF public.settle_arena_battle(u,r,replay) IS DISTINCT FROM settled OR
   (SELECT battle_energy FROM public.profiles WHERE id=u)<>2 OR
   (SELECT bits FROM public.user_currency WHERE user_id=u)<>2075 THEN
   RAISE EXCEPTION 'Lost-response retry duplicated a charge or reward'; END IF;
 IF public.prepare_arena_battle(u,r,NULL,NULL,NULL) IS DISTINCT FROM settled THEN
   RAISE EXCEPTION 'Resume did not recover committed battle'; END IF;
END $$;
RESET ROLE;
-- Force history insertion failure after ticket/currency writes: all must roll back.
CREATE FUNCTION pg_temp.fail_arena_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'injected arena history failure'; END $$;
CREATE TRIGGER arena_history_failure BEFORE INSERT ON public.team_battles FOR EACH ROW EXECUTE FUNCTION pg_temp.fail_arena_history();
SET LOCAL ROLE service_role;
DO $$ DECLARE u uuid:='00000000-0000-4000-8000-000000000021';
 r uuid:='00000000-0000-4000-8000-000000024002'; prepared jsonb; replay jsonb;
BEGIN
 prepared:=public.prepare_arena_battle(u,r,'00000000-0000-4000-8000-000000023002',
   ARRAY['00000000-0000-4000-8000-000000021001'::uuid],ARRAY['defensive']);
 replay:=jsonb_build_object('version',1,'engineVersion',1,'seed',prepared->'seed',
   'winner','opponent','durationMs',16,'frames','[{}]'::jsonb);
 BEGIN PERFORM public.settle_arena_battle(u,r,replay); RAISE EXCEPTION 'Injection did not fail';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'injected arena history failure' THEN RAISE; END IF; END;
 IF (SELECT battle_energy FROM public.profiles WHERE id=u)<>2 OR
   (SELECT bits FROM public.user_currency WHERE user_id=u)<>2075 OR
   (SELECT status FROM public.arena_battle_requests WHERE id=r)<>'prepared' OR
   (SELECT count(*) FROM public.team_battles WHERE user_id=u)<>1 THEN
   RAISE EXCEPTION 'Failed settlement left partial writes'; END IF;
END $$;
RESET ROLE;
DROP TRIGGER arena_history_failure ON public.team_battles;
SET LOCAL ROLE service_role;
DO $$ DECLARE u uuid:='00000000-0000-4000-8000-000000000021';
 r uuid:='00000000-0000-4000-8000-000000024002'; prepared jsonb;
BEGIN
 prepared:=public.prepare_arena_battle(u,r,NULL,NULL,NULL);
 PERFORM public.settle_arena_battle(u,r,jsonb_build_object('version',1,'engineVersion',1,'seed',prepared->'seed',
   'winner','opponent','durationMs',16,'frames','[{}]'::jsonb));
 IF (SELECT battle_energy FROM public.profiles WHERE id=u)<>1 OR
   (SELECT bits FROM public.user_currency WHERE user_id=u)<>2115 OR
   (SELECT battles_won FROM public.profiles WHERE id=u)<>1 OR
   (SELECT battles_completed FROM public.profiles WHERE id=u)<>2 THEN
   RAISE EXCEPTION 'Loss reward/counters or failed-request retry incorrect'; END IF;
END $$;
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000022',true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.arena_battle_requests) OR EXISTS(SELECT 1 FROM public.arena_battle_offers) THEN
   RAISE EXCEPTION 'Other user can read private arena requests/offers'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'Arena preparation, idempotency, role isolation and atomic win/loss rollback passed' AS result;
