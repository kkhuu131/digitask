-- Snapshot of the five healthy live scheduled jobs after cleanup on 2026-09-16.
-- Operational reference only: not applied automatically by schema diff.
-- The failed reset-daily-stats job was removed by migration 20260916231000.

SELECT cron.schedule('check-overdue-tasks', '0 * * * *', 'SELECT check_all_overdue_tasks()');
SELECT cron.schedule('reset-battle-limits', '0 8 * * *', 'SELECT reset_all_battle_limits()');
SELECT cron.schedule('daily_team_battles_cleanup', '0 8 * * *', 'SELECT cleanup_team_battles()');
SELECT cron.schedule('daily_task_reset', '1 8 * * *', 'SELECT reset_daily_tasks()');
SELECT cron.schedule('daily_quota_processing', '0 8 * * *', 'SELECT process_daily_quotas()');
