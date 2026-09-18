-- Local-only backfill fixtures; exercise the migration's exact data repair twice.
BEGIN;
INSERT INTO auth.users (id,email)
SELECT ('00000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
  'task-progress-' || i || '@example.invalid' FROM generate_series(920001,920005) i;
INSERT INTO public.profiles (id,username)
SELECT ('00000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
  'task-progress-' || i FROM generate_series(920001,920005) i;
INSERT INTO public.user_milestones (user_id,tasks_completed_count,daily_quota_streak,updated_at) VALUES
  ('00000000-0000-4000-8000-000000920001',2,9,'2026-01-01'),
  ('00000000-0000-4000-8000-000000920002',100,7,'2026-01-01');
INSERT INTO public.tasks (user_id,description,is_completed,completed_at)
SELECT '00000000-0000-4000-8000-000000920001','retained task',true,now()
FROM generate_series(1,5);
INSERT INTO public.tasks (user_id,description,is_completed,completed_at) VALUES
  ('00000000-0000-4000-8000-000000920002','already counted',true,now()),
  ('00000000-0000-4000-8000-000000920003','reopened task',false,now());
INSERT INTO public.daily_quotas (user_id,completed_today) VALUES
  ('00000000-0000-4000-8000-000000920001',3),
  ('00000000-0000-4000-8000-000000920004',12),
  ('00000000-0000-4000-8000-000000920005',12);
INSERT INTO public.user_titles (id,user_id,title_id,claimed_at,is_displayed) VALUES
  (920001,'00000000-0000-4000-8000-000000920004',503,'2026-01-01',true);

__TASK_PROGRESS_BACKFILL__
CREATE TEMP TABLE repaired_progress AS
SELECT * FROM public.user_milestones;
__TASK_PROGRESS_BACKFILL__

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM (VALUES
    ('00000000-0000-4000-8000-000000920001'::uuid,5),
    ('00000000-0000-4000-8000-000000920002'::uuid,100),
    ('00000000-0000-4000-8000-000000920003'::uuid,1),
    ('00000000-0000-4000-8000-000000920004'::uuid,25),
    ('00000000-0000-4000-8000-000000920005'::uuid,12)
  ) expected(user_id,total) LEFT JOIN public.user_milestones m USING(user_id)
  WHERE m.tasks_completed_count IS DISTINCT FROM expected.total) THEN
    RAISE EXCEPTION 'Task backfill failed conservative recovery or counter preservation';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_milestones m FULL JOIN repaired_progress r USING(id)
    WHERE to_jsonb(m) IS DISTINCT FROM to_jsonb(r)) THEN
    RAISE EXCEPTION 'Task backfill was not idempotent';
  END IF;
  IF (SELECT daily_quota_streak FROM public.user_milestones
    WHERE user_id='00000000-0000-4000-8000-000000920001') <> 9 OR
    (SELECT updated_at FROM public.user_milestones
    WHERE user_id='00000000-0000-4000-8000-000000920002') <> '2026-01-01'::timestamptz OR
    NOT EXISTS (SELECT 1 FROM public.user_titles WHERE id=920001
      AND claimed_at='2026-01-01'::timestamptz AND is_displayed) THEN
    RAISE EXCEPTION 'Task backfill modified preserved streaks, higher totals or claims';
  END IF;
END; $$;
ROLLBACK;
SELECT 'Lifetime task recovery, existing counters, claims and repeat backfill passed' AS result;
