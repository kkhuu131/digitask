-- Retire the removed weekly-boss system and its failed daily-stat job.
-- Explicit signatures and no CASCADE: unexpected catalog dependencies abort deployment.
-- The active contribute_boss_progress compatibility stub is deliberately retained.

DO $$
DECLARE v_job record;
BEGIN
  FOR v_job IN SELECT jobid, command FROM cron.job WHERE jobname = 'reset-daily-stats' LOOP
    IF regexp_replace(v_job.command, '\s', '', 'g') NOT IN
      ('SELECTreset_daily_stat_gains()', 'SELECTreset_daily_stat_gains();') THEN
      RAISE EXCEPTION 'The reset-daily-stats command changed; review before unscheduling';
    END IF;
    IF to_regprocedure('public.reset_daily_stat_gains()') IS NOT NULL THEN
      RAISE EXCEPTION 'reset_daily_stat_gains now exists; review before unscheduling';
    END IF;
    PERFORM cron.unschedule(v_job.jobid);
  END LOOP;
END;
$$;

DROP FUNCTION public.user_can_battle_boss(uuid);
DROP FUNCTION public.user_participated_in_phase1(uuid, uuid);
DROP FUNCTION public.reset_boss_hp();
DROP FUNCTION public.set_event_phase(integer);
DROP FUNCTION public.show_event_status();
DROP FUNCTION public.show_user_participation(uuid);
