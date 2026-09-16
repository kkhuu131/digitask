-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE TRIGGER "assign_personality_trigger" BEFORE INSERT ON "public"."user_digimon" FOR EACH ROW EXECUTE FUNCTION "public"."assign_personality_to_digimon"();

CREATE OR REPLACE TRIGGER "ensure_single_active_digimon_trigger" BEFORE INSERT OR UPDATE ON "public"."user_digimon" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_active_digimon"();

CREATE OR REPLACE TRIGGER "level_up_trigger" BEFORE UPDATE ON "public"."user_digimon" FOR EACH ROW EXECUTE FUNCTION "public"."level_up_digimon"();

CREATE OR REPLACE TRIGGER "task_completion_trigger" AFTER UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_completed_today"();

CREATE OR REPLACE TRIGGER "task_overdue_check" AFTER INSERT OR UPDATE OF "due_date" ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."check_overdue_tasks"();

CREATE OR REPLACE TRIGGER "trigger_update_milestone_on_daily_quota" AFTER UPDATE OF "completed_today" ON "public"."daily_quotas" FOR EACH ROW EXECUTE FUNCTION "public"."update_milestone_on_daily_quota"();

CREATE OR REPLACE TRIGGER "update_battle_stats_after_insert" AFTER INSERT ON "public"."team_battles" FOR EACH ROW EXECUTE FUNCTION "public"."update_battle_stats"();


CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_streak_trigger" BEFORE UPDATE ON "public"."daily_quotas" FOR EACH ROW EXECUTE FUNCTION "public"."update_streak_on_quota_completion"();


CREATE OR REPLACE TRIGGER record_digimon_discovery_trigger AFTER INSERT OR UPDATE OF digimon_id, user_id ON public.user_digimon FOR EACH ROW EXECUTE FUNCTION public.record_digimon_discovery();
