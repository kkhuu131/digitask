CREATE TABLE "public"."notification_preferences" (
  "user_id"              uuid                     NOT NULL,
  "enabled"              boolean                  NOT NULL DEFAULT false,
  "daily_quota"          boolean                  NOT NULL DEFAULT true,
  "scheduled_tasks"      boolean                  NOT NULL DEFAULT true,
  "tournaments"          boolean                  NOT NULL DEFAULT true,
  "reminder_time"        time without time zone   NOT NULL DEFAULT '18:00:00'::time WITHOUT time zone,
  "timezone"             text                     NOT NULL DEFAULT 'UTC'::text,
  "last_sent_local_date" date,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."notification_preferences"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."push_subscriptions" (
  "id"         uuid                     NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id"    uuid                     NOT NULL,
  "endpoint"   text                     NOT NULL,
  "p256dh"     text                     NOT NULL,
  "auth"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE (endpoint),
  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."push_subscriptions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notification_preferences"
  ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."push_subscriptions"
  ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions USING btree (user_id);

CREATE POLICY "Users manage their notification preferences" ON "public"."notification_preferences"
  FOR ALL
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users manage their push subscriptions" ON "public"."push_subscriptions"
  FOR ALL
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

REVOKE ALL ON TABLE "public"."notification_preferences" FROM PUBLIC, "anon";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."push_subscriptions" FROM PUBLIC, "anon";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "postgres", "service_role";
