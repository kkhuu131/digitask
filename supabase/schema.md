Here is the information regarding the schemas, functions, and relationships in your database:

Schemas and Tables
Public Schema

## battle_limits

Columns: id, user_id, battles_used, last_reset_date, created_at, updated_at
Primary Key: id
Foreign Key: user_id references auth.users(id)

## battles

Columns: id, user_digimon_id, opponent_digimon_id, winner_digimon_id, created_at, user_digimon_details, opponent_digimon_details
Primary Key: id
Foreign Keys: user_digimon_id, opponent_digimon_id, winner_digimon_id references user_digimon(id)

## daily_quotas

Columns: id, user_id, completed_today, consecutive_days_missed, created_at, updated_at, penalized_tasks, current_streak
Primary Key: id
Foreign Keys: user_id references auth.users(id) and profiles(id)

## digimon

Columns: id, digimon_id, request_id, name, stage, type, attribute, sprite_url, hp, sp, atk, def, int, spd, detail_url, hp_level1, sp_level1, atk_level1, def_level1, int_level1, spd_level1, hp_level99, sp_level99, atk_level99, def_level99, int_level99, spd_level99
Primary Key: id

## evolution_paths

Columns: id, from_digimon_id, to_digimon_id, level_required, stat_requirements
Primary Key: id
Foreign Keys: from_digimon_id, to_digimon_id references digimon(id)

## profiles

Columns: id, username, display_name, avatar_url, created_at, updated_at, saved_stats, daily_stat_gains, last_stat_reset, battles_won, battles_completed
Primary Key: id
Foreign Key: id references auth.users(id)

## tasks

Columns: id, user_id, description, is_daily, due_date, is_completed, created_at, completed_at, category
Primary Key: id
Foreign Key: user_id references auth.users(id)

## team_battles

Columns: id, user_id, opponent_id, winner_id, created_at, user_team, opponent_team, turns, is_wild_battle
Primary Key: id
Foreign Keys: user_id references auth.users(id) and profiles(id)

## user_digimon

Columns: id, user_id, digimon_id, name, current_level, experience_points, health, happiness, created_at, last_updated_at, last_fed_tasks_at, is_active, is_on_team, hp_bonus, sp_bonus, atk_bonus, def_bonus, int_bonus, spd_bonus, daily_stat_gains, last_stat_reset
Primary Key: id
Foreign Keys: digimon_id references digimon(id), user_id references auth.users(id)

## user_discovered_digimon

Columns: id, user_id, digimon_id, discovered_at
Primary Key: id
Foreign Keys: user_id references auth.users(id), digimon_id references digimon(id)

## user_milestones

Columns: id, user_id, daily_quota_streak, tasks_completed_count, last_digimon_claimed_at, created_at, updated_at
Primary Key: id
Foreign Key: user_id references auth.users(id)

Functions
reset_daily_stat_gains: Resets daily stat gains for profiles.
get_user_stat_limit: Returns the stat limit for a user based on their digimon count.
update_completed_today: Trigger function to update completed tasks for daily quotas.
update_battle_stats: Trigger function to update battle statistics after a battle.
update_updated_at_column: Trigger function to update the updated_at column.
update_streak_on_quota_completion: Trigger function to update streaks based on quota completion.

get_opponents_with_digimon: Returns a list of opponents with digimon.
swap_team_members: Swaps team members for a user.
get_random_digimon: Returns a random digimon.
check_and_increment_battle_limit: Checks and increments battle limits for users.
ensure_single_active_digimon: Ensures only one active digimon per user.
keep_recent_team_battles: Keeps only the 20 most recent team battles for a user.

reset_all_battle_limits: Resets all battle limits.
cleanup_team_battles: Cleans up team battles for users.
process_daily_quotas: Processes daily quotas for users.
reset_daily_tasks: Resets daily tasks for users.
check_digimon_health: Checks and deletes digimon if health is 0.
check_overdue_tasks: Checks for overdue tasks and applies penalties.
check_all_overdue_tasks: Checks all overdue tasks and applies penalties.
level_up_digimon: Levels up a digimon based on experience points.
