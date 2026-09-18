-- Data-only repair: recover lifetime completion evidence retained in daily history.
-- Historical days are disjoint; today's history/quota overlap, so take their max.
-- Do not add this lower bound to the stored counter, reduce it, or change claims.
-- BEGIN TASK HISTORY PROGRESS BACKFILL
DO $backfill$
BEGIN
  LOCK TABLE public.tasks, public.daily_quotas, public.task_history
    IN SHARE ROW EXCLUSIVE MODE;
  WITH history AS (
    SELECT user_id,
      COALESCE(sum(GREATEST(tasks_completed, 0)) FILTER (
        WHERE date < (now() AT TIME ZONE 'America/Los_Angeles')::date), 0) AS past,
      COALESCE(max(GREATEST(tasks_completed, 0)) FILTER (
        WHERE date = (now() AT TIME ZONE 'America/Los_Angeles')::date), 0) AS today
    FROM public.task_history GROUP BY user_id
  ), evidence AS (
    SELECT COALESCE(h.user_id, q.user_id) AS user_id,
      (COALESCE(h.past, 0) + GREATEST(COALESCE(h.today, 0),
        COALESCE(q.completed_today, 0), 0))::integer AS completed
    FROM history h FULL JOIN public.daily_quotas q USING (user_id)
  )
  INSERT INTO public.user_milestones (user_id, tasks_completed_count)
  SELECT user_id, completed FROM evidence WHERE completed > 0
  ON CONFLICT (user_id) DO UPDATE
  SET tasks_completed_count = GREATEST(user_milestones.tasks_completed_count,
      EXCLUDED.tasks_completed_count), updated_at = now()
  WHERE user_milestones.tasks_completed_count < EXCLUDED.tasks_completed_count;
END;
$backfill$;
-- END TASK HISTORY PROGRESS BACKFILL
