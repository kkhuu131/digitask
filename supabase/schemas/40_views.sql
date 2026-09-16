-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE VIEW "public"."admin_reports" WITH ("security_invoker"='on') AS
 SELECT "r"."id",
    "r"."reporter_id",
    "r"."reported_user_id",
    "r"."reason",
    "r"."category",
    "r"."status",
    "r"."admin_notes",
    "r"."created_at",
    "r"."updated_at",
    "r"."resolved_at",
    "reporter"."username" AS "reporter_username",
    "reported"."username" AS "reported_username"
   FROM (("public"."reports" "r"
     JOIN "public"."profiles" "reporter" ON (("r"."reporter_id" = "reporter"."id")))
     JOIN "public"."profiles" "reported" ON (("r"."reported_user_id" = "reported"."id")));

ALTER TABLE "public"."admin_reports" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."user_digimon_profiles" WITH ("security_invoker"='on') AS
 SELECT "ud"."id" AS "user_digimon_id",
    "ud"."user_id",
    "p"."username",
    "ud"."digimon_id",
    "d"."name" AS "digimon_species",
    "ud"."name" AS "digimon_nickname",
    "d"."stage",
    "d"."type",
    "d"."attribute",
    "ud"."current_level",
    "ud"."experience_points",
    "ud"."abi",
    "ud"."personality",
    "ud"."is_active",
    "ud"."is_on_team",
    "d"."sprite_url",
    "ud"."created_at"
   FROM (("public"."user_digimon" "ud"
     JOIN "public"."profiles" "p" ON (("ud"."user_id" = "p"."id")))
     JOIN "public"."digimon" "d" ON (("ud"."digimon_id" = "d"."id")));

ALTER TABLE "public"."user_digimon_profiles" OWNER TO "postgres";
