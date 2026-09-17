-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."allocate_stat"("p_digimon_id" "uuid", "p_stat_type" "text", "p_user_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."assign_personality_to_digimon"() TO "anon";

GRANT ALL ON FUNCTION "public"."assign_personality_to_digimon"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."assign_personality_to_digimon"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_all_overdue_tasks"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_all_overdue_tasks"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_all_overdue_tasks"() TO "service_role";







GRANT ALL ON FUNCTION "public"."check_and_set_first_win_self"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win_self"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_and_set_first_win_self"() TO "service_role";

GRANT ALL ON FUNCTION "public"."check_overdue_tasks"() TO "anon";

GRANT ALL ON FUNCTION "public"."check_overdue_tasks"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."check_overdue_tasks"() TO "service_role";

GRANT ALL ON FUNCTION "public"."cleanup_team_battles"() TO "anon";

GRANT ALL ON FUNCTION "public"."cleanup_team_battles"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."cleanup_team_battles"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) TO "anon";

GRANT ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) TO "authenticated";

GRANT ALL ON FUNCTION "public"."complete_task_all_triggers"("p_task_id" "uuid", "p_user_id" "uuid", "p_auto_allocate" boolean) TO "service_role";

GRANT ALL ON FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) TO "anon";

GRANT ALL ON FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) TO "authenticated";

GRANT ALL ON FUNCTION "public"."contribute_boss_progress"("p_user_id" "uuid", "p_task_points" integer, "p_is_daily_quota" boolean) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_add_dna_requirement_function"() TO "anon";

GRANT ALL ON FUNCTION "public"."create_add_dna_requirement_function"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."create_add_dna_requirement_function"() TO "service_role";




GRANT ALL ON FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."dna_evolve_digimon"("p_digimon_id" "uuid", "p_to_digimon_id" integer, "p_dna_partner_digimon_id" "uuid", "p_boost_points" integer, "p_abi_gain" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."ensure_single_active_digimon"() TO "anon";

GRANT ALL ON FUNCTION "public"."ensure_single_active_digimon"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."ensure_single_active_digimon"() TO "service_role";
















GRANT ALL ON FUNCTION "public"."grant_energy_self"("p_amount" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."grant_energy_self"("p_amount" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."grant_energy_self"("p_amount" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";







GRANT ALL ON FUNCTION "public"."level_up_digimon"() TO "anon";

GRANT ALL ON FUNCTION "public"."level_up_digimon"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."level_up_digimon"() TO "service_role";

GRANT ALL ON FUNCTION "public"."process_daily_quotas"() TO "anon";

GRANT ALL ON FUNCTION "public"."process_daily_quotas"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."process_daily_quotas"() TO "service_role";

GRANT ALL ON FUNCTION "public"."reset_all_battle_limits"() TO "anon";

GRANT ALL ON FUNCTION "public"."reset_all_battle_limits"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."reset_all_battle_limits"() TO "service_role";




GRANT ALL ON FUNCTION "public"."reset_daily_tasks"() TO "anon";

GRANT ALL ON FUNCTION "public"."reset_daily_tasks"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."reset_daily_tasks"() TO "service_role";
















GRANT ALL ON FUNCTION "public"."spend_energy_self"("p_amount" integer) TO "anon";

GRANT ALL ON FUNCTION "public"."spend_energy_self"("p_amount" integer) TO "authenticated";

GRANT ALL ON FUNCTION "public"."spend_energy_self"("p_amount" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."swap_team_members"("team_digimon_id" "uuid", "reserve_digimon_id" "uuid", "user_id_param" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_battle_stats"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_battle_stats"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_battle_stats"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_completed_today"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_completed_today"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_completed_today"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) TO "anon";

GRANT ALL ON FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_digimon_exp"("p_active_digimon_id" "uuid", "p_base_exp" integer, "p_non_active_multiplier" double precision) TO "service_role";




GRANT ALL ON FUNCTION "public"."update_milestone_on_daily_quota"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_milestone_on_daily_quota"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_milestone_on_daily_quota"() TO "service_role";




GRANT ALL ON FUNCTION "public"."update_streak_on_quota_completion"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_streak_on_quota_completion"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_streak_on_quota_completion"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";







GRANT ALL ON TABLE "public"."profiles" TO "anon";

GRANT ALL ON TABLE "public"."profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."reports" TO "anon";

GRANT ALL ON TABLE "public"."reports" TO "authenticated";

GRANT ALL ON TABLE "public"."reports" TO "service_role";

GRANT ALL ON TABLE "public"."admin_reports" TO "anon";

GRANT ALL ON TABLE "public"."admin_reports" TO "authenticated";

GRANT ALL ON TABLE "public"."admin_reports" TO "service_role";

GRANT ALL ON TABLE "public"."admin_users" TO "anon";

GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";

GRANT ALL ON TABLE "public"."admin_users" TO "service_role";

GRANT ALL ON TABLE "public"."battle_limits" TO "anon";

GRANT ALL ON TABLE "public"."battle_limits" TO "authenticated";

GRANT ALL ON TABLE "public"."battle_limits" TO "service_role";

GRANT ALL ON TABLE "public"."daily_quotas" TO "anon";

GRANT ALL ON TABLE "public"."daily_quotas" TO "authenticated";

GRANT ALL ON TABLE "public"."daily_quotas" TO "service_role";

GRANT ALL ON TABLE "public"."digimon" TO "anon";

GRANT ALL ON TABLE "public"."digimon" TO "authenticated";

GRANT ALL ON TABLE "public"."digimon" TO "service_role";

GRANT ALL ON TABLE "public"."digimon_forms" TO "anon";

GRANT ALL ON TABLE "public"."digimon_forms" TO "authenticated";

GRANT ALL ON TABLE "public"."digimon_forms" TO "service_role";

GRANT ALL ON SEQUENCE "public"."digimon_forms_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."digimon_forms_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."digimon_forms_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."digimon_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."digimon_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."digimon_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."evolution_paths" TO "anon";

GRANT ALL ON TABLE "public"."evolution_paths" TO "authenticated";

GRANT ALL ON TABLE "public"."evolution_paths" TO "service_role";

GRANT ALL ON SEQUENCE "public"."evolution_paths_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."evolution_paths_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."evolution_paths_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."task_history" TO "anon";

GRANT ALL ON TABLE "public"."task_history" TO "authenticated";

GRANT ALL ON TABLE "public"."task_history" TO "service_role";

GRANT ALL ON TABLE "public"."tasks" TO "anon";

GRANT ALL ON TABLE "public"."tasks" TO "authenticated";

GRANT ALL ON TABLE "public"."tasks" TO "service_role";

GRANT ALL ON TABLE "public"."team_battles" TO "anon";

GRANT ALL ON TABLE "public"."team_battles" TO "authenticated";

GRANT ALL ON TABLE "public"."team_battles" TO "service_role";

GRANT ALL ON TABLE "public"."titles" TO "anon";

GRANT ALL ON TABLE "public"."titles" TO "authenticated";

GRANT ALL ON TABLE "public"."titles" TO "service_role";

GRANT ALL ON SEQUENCE "public"."titles_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."titles_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."titles_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_currency" TO "anon";

GRANT ALL ON TABLE "public"."user_currency" TO "authenticated";

GRANT ALL ON TABLE "public"."user_currency" TO "service_role";

GRANT ALL ON TABLE "public"."user_digimon" TO "anon";

GRANT ALL ON TABLE "public"."user_digimon" TO "authenticated";

GRANT ALL ON TABLE "public"."user_digimon" TO "service_role";

GRANT ALL ON TABLE "public"."user_digimon_profiles" TO "anon";

GRANT ALL ON TABLE "public"."user_digimon_profiles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_digimon_profiles" TO "service_role";

GRANT ALL ON TABLE "public"."user_discovered_digimon" TO "anon";

GRANT ALL ON TABLE "public"."user_discovered_digimon" TO "authenticated";

GRANT ALL ON TABLE "public"."user_discovered_digimon" TO "service_role";

GRANT ALL ON TABLE "public"."user_inventory" TO "anon";

GRANT ALL ON TABLE "public"."user_inventory" TO "authenticated";

GRANT ALL ON TABLE "public"."user_inventory" TO "service_role";

GRANT ALL ON TABLE "public"."user_milestones" TO "anon";

GRANT ALL ON TABLE "public"."user_milestones" TO "authenticated";

GRANT ALL ON TABLE "public"."user_milestones" TO "service_role";

GRANT SELECT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE "public"."user_titles" TO "anon";

GRANT SELECT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE "public"."user_titles" TO "authenticated";

GRANT ALL ON TABLE "public"."user_titles" TO "service_role";

GRANT ALL ON SEQUENCE "public"."user_titles_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."user_titles_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."user_titles_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."user_tournaments" TO "anon";

GRANT ALL ON TABLE "public"."user_tournaments" TO "authenticated";

GRANT ALL ON TABLE "public"."user_tournaments" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

-- Mutating RPCs require authenticated callers and enforce authorization in their bodies.
REVOKE ALL ON FUNCTION public.admin_rename_user(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_rename_user(uuid, text) TO authenticated, service_role;


REVOKE ALL ON FUNCTION public.allocate_stat(uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.allocate_stat(uuid, text, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.complete_task_all_triggers(uuid, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_task_all_triggers(uuid, uuid, boolean) TO authenticated, service_role;


REVOKE ALL ON FUNCTION public.spend_energy_self(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spend_energy_self(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.grant_energy_self(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_energy_self(integer) TO authenticated, service_role;

-- New functions must opt into browser execution explicitly. Existing grants are unchanged.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

-- Counter columns belong to the battle trigger; old browser increments are rejected.
REVOKE INSERT, UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT INSERT (id, username, display_name, avatar_url, created_at, updated_at, saved_stats, highest_stage_cleared, has_completed_onboarding, battle_energy, max_battle_energy, last_arena_first_win), UPDATE (id, username, display_name, avatar_url, created_at, updated_at, saved_stats, highest_stage_cleared, has_completed_onboarding, battle_energy, max_battle_energy, last_arena_first_win) ON TABLE public.profiles TO authenticated;
REVOKE ALL ON FUNCTION public.update_battle_stats() FROM PUBLIC, anon, authenticated;

-- Tables used by active app subscriptions.
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_digimon, public.daily_quotas;

REVOKE ALL ON FUNCTION public.record_digimon_discovery() FROM PUBLIC, anon, authenticated;
GRANT ALL ON FUNCTION public.record_digimon_discovery() TO service_role;
REVOKE ALL ON FUNCTION public.claim_achievement(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_achievement(integer, integer) TO authenticated, service_role;
REVOKE INSERT, UPDATE ON public.user_titles FROM anon, authenticated;
GRANT INSERT (user_id, title_id) ON public.user_titles TO authenticated;
GRANT UPDATE (is_displayed) ON public.user_titles TO authenticated;

REVOKE ALL ON public.arena_battle_offers,public.arena_battle_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.arena_battle_offers,public.arena_battle_requests TO authenticated;
GRANT ALL ON public.arena_battle_offers,public.arena_battle_requests TO service_role;
REVOKE ALL ON FUNCTION public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[]) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.settle_arena_battle(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.arena_battle_context(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_arena_battle(uuid,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.arena_battle_context(uuid) TO service_role;
