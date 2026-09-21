-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "saved_stats" "jsonb" DEFAULT '{"HP": 0, "SP": 0, "ATK": 0, "DEF": 0, "INT": 0, "SPD": 0}'::"jsonb",
    "battles_won" integer DEFAULT 0,
    "battles_completed" integer DEFAULT 0,
    "highest_stage_cleared" integer DEFAULT 0,
    "has_completed_onboarding" boolean DEFAULT false,
    "battle_energy" integer DEFAULT 0 NOT NULL,
    "max_battle_energy" integer DEFAULT 10 NOT NULL,
    "last_arena_first_win" "date"
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

COMMENT ON COLUMN "public"."profiles"."highest_stage_cleared" IS 'Records the highest stage cleared in the Campaign';

CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reported_user_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone
);

ALTER TABLE "public"."reports" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."admin_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."battle_limits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "battles_used" integer DEFAULT 0,
    "last_reset_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "boss_battles_used" integer DEFAULT 0
);

ALTER TABLE "public"."battle_limits" OWNER TO "postgres";

COMMENT ON COLUMN "public"."battle_limits"."boss_battles_used" IS 'Number of weekly boss battles used today (max 5 per day during Phase 2)';

CREATE TABLE IF NOT EXISTS "public"."daily_quotas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "completed_today" integer DEFAULT 0,
    "consecutive_days_missed" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "penalized_tasks" "text"[] DEFAULT '{}'::"text"[],
    "current_streak" integer DEFAULT 0 NOT NULL,
    "longest_streak" integer DEFAULT 0
);

ALTER TABLE "public"."daily_quotas" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."digimon" (
    "id" integer NOT NULL,
    "digimon_id" integer NOT NULL,
    "request_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "stage" "text" NOT NULL,
    "type" "text",
    "attribute" "text",
    "sprite_url" "text",
    "hp" integer,
    "sp" integer,
    "atk" integer,
    "def" integer,
    "int" integer,
    "spd" integer,
    "detail_url" "text",
    "hp_level1" integer DEFAULT 0,
    "sp_level1" integer DEFAULT 0,
    "atk_level1" integer DEFAULT 0,
    "def_level1" integer DEFAULT 0,
    "int_level1" integer DEFAULT 0,
    "spd_level1" integer DEFAULT 0,
    "hp_level99" integer DEFAULT 0,
    "sp_level99" integer DEFAULT 0,
    "atk_level99" integer DEFAULT 0,
    "def_level99" integer DEFAULT 0,
    "int_level99" integer DEFAULT 0,
    "spd_level99" integer DEFAULT 0
);

ALTER TABLE "public"."digimon" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."digimon_forms" (
    "id" integer NOT NULL,
    "base_digimon_id" integer NOT NULL,
    "form_digimon_id" integer NOT NULL,
    "form_type" "text" NOT NULL,
    "unlock_condition" "text"
);

ALTER TABLE "public"."digimon_forms" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."digimon_forms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."digimon_forms_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."digimon_forms_id_seq" OWNED BY "public"."digimon_forms"."id";

CREATE SEQUENCE IF NOT EXISTS "public"."digimon_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."digimon_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."digimon_id_seq" OWNED BY "public"."digimon"."id";

CREATE TABLE IF NOT EXISTS "public"."evolution_paths" (
    "id" integer NOT NULL,
    "from_digimon_id" integer,
    "to_digimon_id" integer,
    "level_required" integer DEFAULT 0 NOT NULL,
    "stat_requirements" "jsonb" DEFAULT '{}'::"jsonb",
    "dna_requirement" integer,
    "item_requirement" "text"
);

ALTER TABLE "public"."evolution_paths" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."evolution_paths_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."evolution_paths_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."evolution_paths_id_seq" OWNED BY "public"."evolution_paths"."id";

CREATE TABLE IF NOT EXISTS "public"."task_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "tasks_completed" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."task_history" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "is_daily" boolean DEFAULT false NOT NULL,
    "due_date" timestamp with time zone,
    "is_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "category" "text",
    "notes" "text",
    "recurring_days" "text"[],
    "difficulty" "text" DEFAULT 'medium'::"text",
    "priority" "text" DEFAULT 'medium'::"text",
    CONSTRAINT "tasks_category_check" CHECK (("category" = ANY (ARRAY['HP'::"text", 'SP'::"text", 'ATK'::"text", 'DEF'::"text", 'INT'::"text", 'SPD'::"text"]))),
    CONSTRAINT "tasks_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text"]))),
    CONSTRAINT "tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);

ALTER TABLE "public"."tasks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "user_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "daily_quota" boolean DEFAULT true NOT NULL,
    "scheduled_tasks" boolean DEFAULT true NOT NULL,
    "tournaments" boolean DEFAULT true NOT NULL,
    "reminder_time" time without time zone DEFAULT '18:00:00'::time NOT NULL,
    "timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "last_sent_local_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."team_battles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "opponent_id" "uuid",
    "winner_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_team" "jsonb" NOT NULL,
    "opponent_team" "jsonb" NOT NULL,
    "turns" "jsonb"
);

ALTER TABLE "public"."team_battles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."titles" (
    "reward_bits" integer DEFAULT 0 NOT NULL CHECK (reward_bits >= 0),
    "reward_digimon_ids" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "requirement_type" "text" NOT NULL,
    "requirement_value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."titles" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."titles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."titles_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."titles_id_seq" OWNED BY "public"."titles"."id";

CREATE TABLE IF NOT EXISTS "public"."user_currency" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bits" integer DEFAULT 2000 NOT NULL,
    "digicoins" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_currency" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_digimon" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "digimon_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "current_level" integer DEFAULT 1 NOT NULL,
    "experience_points" integer DEFAULT 0 NOT NULL,
    "happiness" integer DEFAULT 100 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_updated_at" timestamp with time zone DEFAULT "now"(),
    "last_fed_tasks_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT false,
    "is_on_team" boolean DEFAULT false NOT NULL,
    "hp_bonus" integer DEFAULT 0 NOT NULL,
    "sp_bonus" integer DEFAULT 0 NOT NULL,
    "atk_bonus" integer DEFAULT 0 NOT NULL,
    "def_bonus" integer DEFAULT 0 NOT NULL,
    "int_bonus" integer DEFAULT 0 NOT NULL,
    "spd_bonus" integer DEFAULT 0 NOT NULL,
    "personality" "text",
    "abi" integer DEFAULT 0,
    "is_in_storage" boolean DEFAULT false,
    "has_x_antibody" boolean DEFAULT false
);

ALTER TABLE "public"."user_digimon" OWNER TO "postgres";

COMMENT ON COLUMN "public"."user_digimon"."hp_bonus" IS 'Bonus HP points earned from completing HP category tasks';

COMMENT ON COLUMN "public"."user_digimon"."sp_bonus" IS 'Bonus SP points earned from completing SP category tasks';

COMMENT ON COLUMN "public"."user_digimon"."atk_bonus" IS 'Bonus ATK points earned from completing ATK category tasks';

COMMENT ON COLUMN "public"."user_digimon"."def_bonus" IS 'Bonus DEF points earned from completing DEF category tasks';

COMMENT ON COLUMN "public"."user_digimon"."int_bonus" IS 'Bonus INT points earned from completing INT category tasks';

COMMENT ON COLUMN "public"."user_digimon"."spd_bonus" IS 'Bonus SPD points earned from completing SPD category tasks';

CREATE TABLE IF NOT EXISTS "public"."user_discovered_digimon" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "digimon_id" integer NOT NULL,
    "discovered_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_discovered_digimon" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_inventory" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" "text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "item_type" "text"
);

ALTER TABLE "public"."user_inventory" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_milestones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "daily_quota_streak" integer DEFAULT 0 NOT NULL,
    "tasks_completed_count" integer DEFAULT 0 NOT NULL,
    "last_digimon_claimed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."user_milestones" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_titles" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "title_id" integer,
    "earned_at" timestamp with time zone DEFAULT "now"(),
    "is_displayed" boolean DEFAULT false,
    "claimed_at" timestamp with time zone
);

ALTER TABLE "public"."user_titles" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."user_titles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."user_titles_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."user_titles_id_seq" OWNED BY "public"."user_titles"."id";

CREATE TABLE IF NOT EXISTS "public"."user_tournaments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "week_start" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "current_round" integer DEFAULT 1 NOT NULL,
    "bracket" "jsonb" NOT NULL,
    "round_results" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "final_placement" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."user_tournaments" OWNER TO "postgres";

ALTER TABLE ONLY "public"."digimon" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."digimon_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."digimon_forms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."digimon_forms_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."evolution_paths" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."evolution_paths_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."titles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."titles_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."user_titles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_titles_id_seq"'::"regclass");

CREATE TABLE IF NOT EXISTS "public"."arena_battle_offers" (
  "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  "user_id" uuid NOT NULL,
  "difficulty" text NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  "opponent_name" text NOT NULL,
  "opponent_team" jsonb NOT NULL CHECK (jsonb_typeof(opponent_team)='array' AND jsonb_array_length(opponent_team)=3),
  "expires_at" timestamptz NOT NULL DEFAULT (now()+interval '1 day'),
  "created_at" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.arena_battle_offers OWNER TO postgres;
CREATE TABLE IF NOT EXISTS "public"."arena_battle_requests" (
  "id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "offer_id" uuid NOT NULL,
  "seed" bigint NOT NULL CHECK (seed BETWEEN 0 AND 4294967295),
  "engine_version" integer NOT NULL DEFAULT 1,
  "snapshot" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared','settled')),
  "replay" jsonb,
  "bits_reward" integer,
  "battle_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "settled_at" timestamptz,
  CONSTRAINT arena_settlement_complete CHECK ((status='prepared' AND replay IS NULL AND bits_reward IS NULL AND battle_id IS NULL AND settled_at IS NULL)
    OR (status='settled' AND replay IS NOT NULL AND bits_reward IS NOT NULL AND battle_id IS NOT NULL AND settled_at IS NOT NULL))
);
ALTER TABLE public.arena_battle_requests OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.user_digimon_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_digimon_id uuid NOT NULL,
  digimon_id integer NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  is_starting_point boolean NOT NULL DEFAULT false,
  is_backfilled boolean NOT NULL DEFAULT false
);
ALTER TABLE public.user_digimon_history OWNER TO postgres;
