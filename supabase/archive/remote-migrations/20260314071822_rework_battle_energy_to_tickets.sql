
-- Rework battle energy into battle tickets system
-- Max tickets = 10, earned 1 per task (not restored by cron)
-- Arena costs 1 ticket, Campaign is free

-- Update default for new users
ALTER TABLE profiles ALTER COLUMN max_battle_energy SET DEFAULT 10;

-- Update all existing users: cap tickets at 10, set max to 10
UPDATE profiles
SET
  max_battle_energy = 10,
  battle_energy = LEAST(COALESCE(battle_energy, 0), 10);

