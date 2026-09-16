-- No code, function, trigger or cron callers remain for these explicit overloads.
-- User authorized retirement based on repository usage. No CASCADE or data deletion.

DROP FUNCTION public.check_and_increment_battle_limit();
DROP FUNCTION public.check_and_set_first_win(uuid);
DROP FUNCTION public.delete_user_and_data(uuid);
DROP FUNCTION public.generate_enemy_team(integer);
DROP FUNCTION public.get_opponents_with_digimon(integer, uuid);
DROP FUNCTION public.get_random_digimon(integer);
DROP FUNCTION public.get_random_digimon_by_stage(text);
DROP FUNCTION public.get_random_users(uuid);
DROP FUNCTION public.is_admin(uuid);
DROP FUNCTION public.keep_recent_team_battles();
DROP FUNCTION public.reset_user_tasks(uuid, text);
DROP FUNCTION public.spend_energy(uuid, integer);
DROP FUNCTION public.update_longest_streak();
DROP FUNCTION public.update_profiles_updated_at();
