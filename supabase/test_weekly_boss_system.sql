-- Weekly Boss System Testing Script
-- Run this in your Supabase SQL Editor to set up and test all phases

-- =============================================================================
-- PART 1: TESTING FUNCTIONS - Create helper functions for testing
-- =============================================================================

-- Function to manually set event phase (for testing)
CREATE OR REPLACE FUNCTION set_event_phase
(p_phase INTEGER)
RETURNS VOID AS $$
DECLARE
  current_event_id UUID;
BEGIN
    -- Get current event
    SELECT event_id
    INTO current_event_id
    FROM get_current_weekly_boss_event()
  LIMIT
    1;

IF current_event_id IS NOT NULL THEN
UPDATE weekly_boss_events 
    SET phase = p_phase
    WHERE id = current_event_id;

RAISE NOTICE 'Event phase set to %', p_phase;
  ELSE
    RAISE NOTICE 'No current event found';
END
IF;
END;
$$ LANGUAGE plpgsql;

-- Function to reset boss HP (for testing battles)
CREATE OR REPLACE FUNCTION reset_boss_hp
()
RETURNS VOID AS $$
DECLARE
  current_event_id UUID;
BEGIN
    SELECT event_id
    INTO current_event_id
    FROM get_current_weekly_boss_event()
  LIMIT
    1;

IF current_event_id IS NOT NULL THEN
UPDATE weekly_boss_events 
    SET 
      boss_current_hp = boss_max_hp,
      is_defeated = false,
      total_damage_dealt = 0
    WHERE id = current_event_id;

RAISE NOTICE 'Boss HP reset to maximum';
END
IF;
END;
$$ LANGUAGE plpgsql;

-- Function to simulate task contribution (for testing Phase 1)
CREATE OR REPLACE FUNCTION test_contribute_tasks
(p_user_id UUID, p_points INTEGER DEFAULT 10)
RETURNS VOID AS $$
BEGIN
    -- Simulate multiple task contributions
    FOR i IN 1..p_points LOOP
    PERFORM contribute_boss_progress
    (p_user_id, 1, false);
END LOOP;
  
  -- Simulate daily quota completion (bonus points)
  PERFORM contribute_boss_progress
(p_user_id, 1, true);
  
  RAISE NOTICE 'Contributed % task points for user %', p_points + 1, p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to simulate boss battle (for testing Phase 2)
CREATE OR REPLACE FUNCTION test_boss_battle
(p_user_id UUID, p_damage INTEGER DEFAULT 5000)
RETURNS VOID AS $$
DECLARE
  current_event_id UUID;
  current_hp BIGINT;
  new_hp BIGINT;
BEGIN
    SELECT event_id
    INTO current_event_id
    FROM get_current_weekly_boss_event()
  LIMIT
    1;

IF current_event_id IS NULL THEN
    RAISE NOTICE 'No current event found';
RETURN;
END
IF;
  
  -- Get current boss HP
  SELECT boss_current_hp
INTO current_hp
FROM weekly_boss_events
WHERE id = current_event_id;

-- Calculate new HP
new_hp := GREATEST
(0, current_hp - p_damage);

-- Insert battle record
INSERT INTO weekly_boss_battles
    (
    event_id,
    user_id,
    damage_dealt,
    battle_duration,
    user_team,
    boss_hp_before,
    boss_hp_after,
    battle_turns
    )
VALUES
    (
        current_event_id,
        p_user_id,
        p_damage,
        30, -- 30 second battle
        '[]'
::jsonb, -- Empty team for testing
    current_hp,
    new_hp,
    '[]'::jsonb -- Empty turns for testing
  );

-- Update participation
INSERT INTO weekly_boss_participation
    (
    user_id,
    event_id,
    battle_attempts,
    total_damage_dealt,
    best_single_damage,
    participation_tier
    )
VALUES
    (
        p_user_id,
        current_event_id,
        1,
        p_damage,
        p_damage,
        2 -- Battler tier
  )
ON CONFLICT
(user_id, event_id)
  DO
UPDATE SET 
    battle_attempts = weekly_boss_participation.battle_attempts + 1,
    total_damage_dealt = weekly_boss_participation.total_damage_dealt + p_damage,
    best_single_damage = GREATEST(weekly_boss_participation.best_single_damage, p_damage),
    participation_tier = GREATEST(weekly_boss_participation.participation_tier, 2);

-- Update boss HP
UPDATE weekly_boss_events
  SET 
    boss_current_hp = new_hp,
    total_damage_dealt = total_damage_dealt + p_damage,
    is_defeated = (new_hp <= 0)
  WHERE id = current_event_id;

-- If boss is defeated, upgrade all participants to Victor tier
IF new_hp <= 0 THEN
UPDATE weekly_boss_participation
    SET participation_tier = GREATEST(participation_tier, 3)
    WHERE event_id = current_event_id AND participation_tier >= 2;

RAISE NOTICE 'Boss defeated! Damage: %, Remaining HP: 0', p_damage;
  ELSE
    RAISE NOTICE 'Battle completed! Damage: %, Remaining HP: %', p_damage, new_hp;
END
IF;
END;
$$ LANGUAGE plpgsql;

-- Function to view current event status
CREATE OR REPLACE FUNCTION show_event_status
()
RETURNS TABLE
(
  phase INTEGER,
  boss_name TEXT,
  global_progress INTEGER,
  target_progress INTEGER,
  boss_current_hp BIGINT,
  boss_max_hp BIGINT,
  is_defeated BOOLEAN,
  participants_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wbe.phase,
        pbc.name as boss_name,
        wbe.global_progress,
        wbe.target_progress,
        wbe.boss_current_hp,
        wbe.boss_max_hp,
        wbe.is_defeated,
        wbe.participants_count
    FROM weekly_boss_events wbe
        JOIN preset_boss_configs pbc ON wbe.preset_boss_id = pbc.id
    WHERE wbe.week_start_date = DATE_TRUNC('week', CURRENT_DATE)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to view user participation
CREATE OR REPLACE FUNCTION show_user_participation
(p_user_id UUID)
RETURNS TABLE
(
  tasks_contributed INTEGER,
  battle_attempts INTEGER,
  total_damage_dealt BIGINT,
  best_single_damage INTEGER,
  participation_tier INTEGER,
  rewards_claimed BOOLEAN
) AS $$
DECLARE
  current_event_id UUID;
BEGIN
    SELECT event_id
    INTO current_event_id
    FROM get_current_weekly_boss_event()
  LIMIT
    1;

RETURN QUERY
SELECT
    wbp.tasks_contributed,
    wbp.battle_attempts,
    wbp.total_damage_dealt,
    wbp.best_single_damage,
    wbp.participation_tier,
    wbp.rewards_claimed
FROM weekly_boss_participation wbp
WHERE wbp.user_id = p_user_id AND wbp.event_id = current_event_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PART 2: GRANT PERMISSIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION set_event_phase
(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_boss_hp
() TO authenticated;
GRANT EXECUTE ON FUNCTION test_contribute_tasks
(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION test_boss_battle
(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION show_event_status
() TO authenticated;
GRANT EXECUTE ON FUNCTION show_user_participation
(UUID) TO authenticated;

-- =============================================================================
-- PART 3: TESTING SCENARIOS
-- =============================================================================

-- Show current status
SELECT 'Current Event Status:' as info;
SELECT *
FROM show_event_status();

-- Get your user ID (replace with actual user ID for testing)
-- You can get this from: SELECT auth.uid();
-- For this script, we'll use a placeholder
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get current user ID (or use a test user)
  test_user_id := auth.uid
();

IF test_user_id IS NULL THEN
    RAISE NOTICE 'No authenticated user found. Please run: SELECT auth.uid(); to get your user ID';
RETURN;
END
IF;
  
  RAISE NOTICE 'Testing with user ID: %', test_user_id;
  
  -- =============================================================================
  -- TEST SCENARIO 1: PHASE 1 - TASK CONTRIBUTION
  -- =============================================================================
  
  RAISE NOTICE '=== TESTING PHASE 1: TASK CONTRIBUTION ===';
  
  -- Set to Phase 1
  PERFORM set_event_phase
(1);
  
  -- Show initial status
  RAISE NOTICE 'Initial event status:';
  -- Note: RAISE NOTICE doesn't support table returns, so check manually
  
  -- Contribute tasks
  PERFORM test_contribute_tasks
(test_user_id, 15);
  
  -- Show user participation
  RAISE NOTICE 'User participation after task contribution:';
  
  -- =============================================================================
  -- TEST SCENARIO 2: PHASE 2 - BOSS BATTLES
  -- =============================================================================
  
  RAISE NOTICE '=== TESTING PHASE 2: BOSS BATTLES ===';
  
  -- Set to Phase 2
  PERFORM set_event_phase
(2);
  
  -- Reset boss HP for fresh testing
  PERFORM reset_boss_hp
();
  
  -- Do several battles
  PERFORM test_boss_battle
(test_user_id, 8000);
  PERFORM test_boss_battle
(test_user_id, 7500);
  PERFORM test_boss_battle
(test_user_id, 9000);
  
  -- =============================================================================
  -- TEST SCENARIO 3: PHASE 3 - REWARDS
  -- =============================================================================
  
  RAISE NOTICE '=== TESTING PHASE 3: REWARDS ===';
  
  -- Set to Phase 3
  PERFORM set_event_phase
(3);
  
  RAISE NOTICE 'Event moved to Phase 3. Rewards are now claimable in the UI!';

END $$;

-- =============================================================================
-- PART 4: MANUAL TESTING COMMANDS
-- =============================================================================

-- Use these commands individually for step-by-step testing:

-- Check current status:
-- SELECT * FROM show_event_status();

-- Check your participation (replace with your user ID):
-- SELECT * FROM show_user_participation(auth.uid());

-- Test Phase 1 (Task Contribution):
-- SELECT set_event_phase(1);
-- SELECT test_contribute_tasks(auth.uid(), 10);

-- Test Phase 2 (Boss Battles):
-- SELECT set_event_phase(2);
-- SELECT reset_boss_hp();
-- SELECT test_boss_battle(auth.uid(), 5000);

-- Test Phase 3 (Rewards):
-- SELECT set_event_phase(3);

-- Reset everything for fresh testing:
-- SELECT reset_boss_hp();
-- SELECT set_event_phase(1);
-- DELETE FROM weekly_boss_participation WHERE user_id = auth.uid();
-- DELETE FROM weekly_boss_battles WHERE user_id = auth.uid();

SELECT 'Weekly Boss Testing Functions Created Successfully!' as result;
SELECT 'Run the commands above to test different phases.' as instructions; 