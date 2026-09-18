-- Local-only exact migration fixtures; all state rolls back.
BEGIN;
INSERT INTO auth.users(id,email)
SELECT ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,
  'history-progress-'||i||'@example.invalid' FROM generate_series(930001,930004) i;
INSERT INTO public.profiles(id,username)
SELECT ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,
  'history-progress-'||i FROM generate_series(930001,930004) i;
INSERT INTO public.user_milestones(user_id,tasks_completed_count,daily_quota_streak,updated_at) VALUES
 ('00000000-0000-4000-8000-000000930001',10,9,'2026-01-01'),
 ('00000000-0000-4000-8000-000000930002',500,7,'2026-01-01');
INSERT INTO public.daily_quotas(user_id,completed_today) VALUES
 ('00000000-0000-4000-8000-000000930001',5),
 ('00000000-0000-4000-8000-000000930003',3),
 ('00000000-0000-4000-8000-000000930004',12);
INSERT INTO public.task_history(user_id,date,tasks_completed) VALUES
 ('00000000-0000-4000-8000-000000930001',(now() AT TIME ZONE 'America/Los_Angeles')::date-400,80),
 ('00000000-0000-4000-8000-000000930001',(now() AT TIME ZONE 'America/Los_Angeles')::date-1,25),
 ('00000000-0000-4000-8000-000000930001',(now() AT TIME ZONE 'America/Los_Angeles')::date,3),
 ('00000000-0000-4000-8000-000000930001',(now() AT TIME ZONE 'America/Los_Angeles')::date+1,999),
 ('00000000-0000-4000-8000-000000930002',(now() AT TIME ZONE 'America/Los_Angeles')::date-1,110),
 ('00000000-0000-4000-8000-000000930003',(now() AT TIME ZONE 'America/Los_Angeles')::date-1,7),
 ('00000000-0000-4000-8000-000000930003',(now() AT TIME ZONE 'America/Los_Angeles')::date,8);
INSERT INTO public.user_titles(id,user_id,title_id,claimed_at,is_displayed) VALUES
 (930001,'00000000-0000-4000-8000-000000930001',503,'2026-01-01',true);
CREATE TEMP TABLE retained_quotas AS SELECT * FROM public.daily_quotas;
CREATE TEMP TABLE retained_titles AS SELECT * FROM public.user_titles;
__TASK_HISTORY_PROGRESS_BACKFILL__
CREATE TEMP TABLE reconciled_progress AS SELECT * FROM public.user_milestones;
__TASK_HISTORY_PROGRESS_BACKFILL__
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM (VALUES
  ('00000000-0000-4000-8000-000000930001'::uuid,110),
  ('00000000-0000-4000-8000-000000930002'::uuid,500),
  ('00000000-0000-4000-8000-000000930003'::uuid,15),
  ('00000000-0000-4000-8000-000000930004'::uuid,12)
 ) expected(user_id,total) LEFT JOIN public.user_milestones m USING(user_id)
 WHERE m.tasks_completed_count IS DISTINCT FROM expected.total) THEN
  RAISE EXCEPTION 'History repair failed lifetime, nondecreasing, today overlap or future exclusion';
 END IF;
 IF EXISTS (SELECT 1 FROM public.user_milestones m FULL JOIN reconciled_progress r USING(id)
 WHERE to_jsonb(m) IS DISTINCT FROM to_jsonb(r)) THEN RAISE EXCEPTION 'History repair not idempotent'; END IF;
 IF EXISTS (SELECT 1 FROM public.daily_quotas q FULL JOIN retained_quotas r USING(id)
 WHERE to_jsonb(q) IS DISTINCT FROM to_jsonb(r)) OR EXISTS (
 SELECT 1 FROM public.user_titles t FULL JOIN retained_titles r USING(id)
 WHERE to_jsonb(t) IS DISTINCT FROM to_jsonb(r)) THEN RAISE EXCEPTION 'History repair changed quotas or claims'; END IF;
 IF (SELECT daily_quota_streak FROM public.user_milestones WHERE user_id='00000000-0000-4000-8000-000000930001')<>9 OR
 (SELECT updated_at FROM public.user_milestones WHERE user_id='00000000-0000-4000-8000-000000930002')<>'2026-01-01'::timestamptz THEN
 RAISE EXCEPTION 'History repair changed streak metadata or higher counter'; END IF;
END; $$;
ROLLBACK;
SELECT 'Historical task recovery, today deduplication, higher totals, claims and repeat repair passed' AS result;
