-- ============================================================
-- Remove Deprecated Features Migration
-- Removes the weekly boss system (scrapped feature) and all
-- other deprecated DB functions/columns per CLAUDE.md.
-- ============================================================

-- ------------------------------------------------------------
-- STEP 1: Stub out contribute_boss_progress as a no-op FIRST.
-- complete_task_all_triggers calls this internally, so we
-- replace it with an empty function before dropping the tables
-- it depends on. This prevents task completion from breaking.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION contribute_boss_progress(
  p_user_id UUID,
  p_task_points INTEGER DEFAULT 1,
  p_is_daily_quota BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Weekly boss feature has been removed. No-op.
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- STEP 2: Drop weekly boss tables (in dependency order).
-- weekly_boss_battles and weekly_boss_participation both have
-- FKs to weekly_boss_events; weekly_boss_events has a FK to
-- preset_boss_configs.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS weekly_boss_battles CASCADE;
DROP TABLE IF EXISTS weekly_boss_participation CASCADE;
DROP TABLE IF EXISTS weekly_boss_events CASCADE;
DROP TABLE IF EXISTS preset_boss_configs CASCADE;

-- ------------------------------------------------------------
-- STEP 3: Drop weekly boss functions (no longer needed).
-- contribute_boss_progress is kept as a no-op stub above so
-- complete_task_all_triggers keeps working without modification.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS get_current_weekly_boss_event();
DROP FUNCTION IF EXISTS advance_boss_phases();
DROP FUNCTION IF EXISTS get_correct_phase_for_day();

-- Boss battle limit RPCs (boss battle limits table referenced
-- a 'boss_battles_used' column inside battle_limits).
DROP FUNCTION IF EXISTS check_and_increment_boss_battle_limit();
DROP FUNCTION IF EXISTS get_remaining_boss_battles();

-- ------------------------------------------------------------
-- STEP 4: Drop other deprecated DB functions per CLAUDE.md.
-- ------------------------------------------------------------

-- Older task completion function that bypasses triggers via
-- SET session_replication_role = 'replica' and references the
-- non-existent profiles.daily_stat_gains column.
DROP FUNCTION IF EXISTS direct_complete_task(UUID, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS direct_complete_task(UUID, UUID);

-- Old PvP matchmaking function, superseded by get_random_users.
DROP FUNCTION IF EXISTS get_opponents_with_digimon(UUID);
DROP FUNCTION IF EXISTS get_opponents_with_digimon();

-- Old stat cap formula (base 10 + 5 per Digimon). ABI-based
-- cap is now the standard.
DROP FUNCTION IF EXISTS get_user_stat_limit(UUID);
DROP FUNCTION IF EXISTS get_user_stat_limit();

-- References the non-existent profiles.daily_stat_gains column.
DROP FUNCTION IF EXISTS reset_daily_stat_gains();
DROP FUNCTION IF EXISTS reset_daily_stat_gains(UUID);

-- Dev/debug testing functions, never for production use.
DROP FUNCTION IF EXISTS test_boss_battle(UUID, INTEGER);
DROP FUNCTION IF EXISTS test_boss_battle(INTEGER);
DROP FUNCTION IF EXISTS test_contribute_tasks(UUID, INTEGER);
DROP FUNCTION IF EXISTS test_contribute_tasks(INTEGER);

-- 3-argument overload of check_and_increment_battle_limit.
-- References a 'date' column that no longer exists on
-- battle_limits. The no-arg version (uses auth.uid()) is current.
DROP FUNCTION IF EXISTS check_and_increment_battle_limit(UUID, DATE, INTEGER);
DROP FUNCTION IF EXISTS check_and_increment_battle_limit(UUID, TEXT, INTEGER);

-- ------------------------------------------------------------
-- STEP 5: Drop deprecated columns per CLAUDE.md.
-- ------------------------------------------------------------

-- user_digimon.health — not the same as HP stat; was never
-- surfaced in the UI and is distinct from the HP bonus system.
ALTER TABLE user_digimon DROP COLUMN IF EXISTS health;

-- profiles.daily_stat_gains — referenced by the old
-- direct_complete_task and reset_daily_stat_gains functions.
-- May not actually exist if a previous migration already removed it.
ALTER TABLE profiles DROP COLUMN IF EXISTS daily_stat_gains;

-- team_battles.is_wild_battle — opponent_id IS NULL already
-- signals a wild battle throughout the codebase.
ALTER TABLE team_battles DROP COLUMN IF EXISTS is_wild_battle;
