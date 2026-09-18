-- Inject the prepared data migration twice to verify backfill and retry preservation.
BEGIN;
INSERT INTO auth.users(id,email) VALUES
 ('00000000-0000-4000-8000-000000000031','tournament-champion@example.invalid'),
 ('00000000-0000-4000-8000-000000000032','tournament-contender@example.invalid');
INSERT INTO public.profiles(id,username,highest_stage_cleared) VALUES
 ('00000000-0000-4000-8000-000000000031','tournament-champion',30),
 ('00000000-0000-4000-8000-000000000032','tournament-contender',0);
INSERT INTO public.user_titles(user_id,title_id,earned_at,claimed_at,is_displayed) VALUES
 ('00000000-0000-4000-8000-000000000031',2,'2026-09-01','2026-09-02',true);
INSERT INTO public.user_tournaments(user_id,week_start,status,current_round,bracket,round_results,final_placement) VALUES
 ('00000000-0000-4000-8000-000000000031','2026-09-07','completed',3,'{}','[]','champion'),
 ('00000000-0000-4000-8000-000000000032','2026-09-07','active',2,'{}','[{"round":1,"result":"win","placement_bits":0}]',NULL);
-- APPLY CATALOG MIGRATION HERE
DO $$ BEGIN
 IF (SELECT count(*) FROM public.user_titles WHERE user_id='00000000-0000-4000-8000-000000000031' AND title_id IN (1,2,3))<>3 OR
    (SELECT count(*) FROM public.user_titles WHERE user_id='00000000-0000-4000-8000-000000000031' AND title_id IN (601,602,603))<>3 THEN
    RAISE EXCEPTION 'Campaign entitlement or historical champion backfill failed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.user_titles WHERE user_id='00000000-0000-4000-8000-000000000031' AND title_id=2
   AND claimed_at='2026-09-02' AND earned_at='2026-09-01' AND is_displayed) THEN
    RAISE EXCEPTION 'Existing campaign claim, earned date or pin was changed'; END IF;
 IF (SELECT count(*) FROM public.user_titles WHERE user_id='00000000-0000-4000-8000-000000000032')<>1 OR
    NOT EXISTS(SELECT 1 FROM public.user_titles WHERE user_id='00000000-0000-4000-8000-000000000032' AND title_id=601 AND claimed_at IS NULL) THEN
    RAISE EXCEPTION 'Active contender backfill awarded wrong titles'; END IF;
 IF EXISTS(SELECT 1 FROM public.user_titles WHERE user_id='00000000-0000-4000-8000-000000000031' AND title_id IN (1,3,601,602,603) AND claimed_at IS NOT NULL) OR
    EXISTS(SELECT 1 FROM public.user_currency WHERE user_id IN ('00000000-0000-4000-8000-000000000031','00000000-0000-4000-8000-000000000032')) THEN
    RAISE EXCEPTION 'Backfill auto-claimed or granted currency'; END IF;
END $$;
ROLLBACK;
