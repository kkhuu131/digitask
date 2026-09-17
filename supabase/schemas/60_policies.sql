-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE POLICY "Admins can view all reports" ON "public"."reports" FOR SELECT USING (("auth"."uid"() IN ( SELECT "admin_users"."user_id"
   FROM "public"."admin_users")));

CREATE POLICY "Allow admins to manage digimon" ON "public"."digimon" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "Allow admins to manage digimon" ON "public"."digimon_forms" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "Allow admins to manage digimon" ON "public"."evolution_paths" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."team_battles" FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_milestones" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_currency" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_inventory" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_titles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable read access for all users" ON "public"."daily_quotas" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."digimon" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."digimon_forms" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."evolution_paths" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."task_history" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."team_battles" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."titles" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_digimon" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_discovered_digimon" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_milestones" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."user_titles" FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."user_milestones" FOR UPDATE TO "authenticated" USING (true);

CREATE POLICY "Only admins can delete reports" ON "public"."reports" FOR DELETE USING (("auth"."uid"() IN ( SELECT "admin_users"."user_id"
   FROM "public"."admin_users")));

CREATE POLICY "Only admins can update reports" ON "public"."reports" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "admin_users"."user_id"
   FROM "public"."admin_users")));

CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON "public"."reports" FOR INSERT WITH CHECK (("auth"."uid"() = "reporter_id"));

CREATE POLICY "Users can delete their own daily quotas" ON "public"."daily_quotas" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own digimon" ON "public"."user_digimon" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own tasks" ON "public"."tasks" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own battle limits" ON "public"."battle_limits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own daily quotas" ON "public"."daily_quotas" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own digimon" ON "public"."user_digimon" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own discovered Digimon" ON "public"."user_discovered_digimon" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Users can insert their own tasks" ON "public"."tasks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can only see their own tasks" ON "public"."tasks" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own battle limits" ON "public"."battle_limits" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own daily quotas" ON "public"."daily_quotas" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own digimon" ON "public"."user_digimon" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "Users can update their own tasks" ON "public"."tasks" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can view their own battle limits" ON "public"."battle_limits" FOR SELECT USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can view their own reports" ON "public"."reports" FOR SELECT USING (("auth"."uid"() = "reporter_id"));

CREATE POLICY "Users manage their own tournaments" ON "public"."user_tournaments" USING (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_policy" ON "public"."admin_users" FOR SELECT USING (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."battle_limits" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."daily_quotas" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."digimon" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."digimon_forms" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."evolution_paths" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_admin_delete_policy" ON "public"."reports" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "reports_admin_select_policy" ON "public"."reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "reports_admin_update_policy" ON "public"."reports" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."user_id" = "auth"."uid"()))));

CREATE POLICY "reports_insert_policy" ON "public"."reports" FOR INSERT WITH CHECK (("auth"."uid"() = "reporter_id"));

CREATE POLICY "reports_view_own_policy" ON "public"."reports" FOR SELECT USING (("reporter_id" = "auth"."uid"()));

CREATE POLICY "select_own_profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));

ALTER TABLE "public"."task_history" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."team_battles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."titles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "update_own_profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));

ALTER TABLE "public"."user_currency" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_digimon" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_discovered_digimon" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_inventory" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_milestones" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_titles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_titles_update" ON "public"."user_titles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."user_tournaments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.arena_battle_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_battle_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY arena_offers_read_own ON public.arena_battle_offers FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY arena_requests_read_own ON public.arena_battle_requests FOR SELECT TO authenticated USING (auth.uid()=user_id);
