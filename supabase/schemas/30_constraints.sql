-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."battle_limits"
    ADD CONSTRAINT "battle_limits_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."battle_limits"
    ADD CONSTRAINT "battle_limits_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_base_digimon_id_form_digimon_id_key" UNIQUE ("base_digimon_id", "form_digimon_id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."digimon"
    ADD CONSTRAINT "digimon_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_from_digimon_id_to_digimon_id_key" UNIQUE ("from_digimon_id", "to_digimon_id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "task_history_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "task_history_user_id_date_key" UNIQUE ("user_id", "date");

ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."titles"
    ADD CONSTRAINT "titles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "unique_user_date" UNIQUE ("user_id", "date");

ALTER TABLE ONLY "public"."user_currency"
    ADD CONSTRAINT "user_currency_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_currency"
    ADD CONSTRAINT "user_currency_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_digimon"
    ADD CONSTRAINT "user_digimon_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_user_id_digimon_id_key" UNIQUE ("user_id", "digimon_id");

ALTER TABLE ONLY "public"."user_inventory"
    ADD CONSTRAINT "user_inventory_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_inventory"
    ADD CONSTRAINT "user_inventory_user_item_unique" UNIQUE ("user_id", "item_id");

ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_user_id_title_id_key" UNIQUE ("user_id", "title_id");

ALTER TABLE ONLY "public"."user_tournaments"
    ADD CONSTRAINT "user_tournaments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_tournaments"
    ADD CONSTRAINT "user_tournaments_user_id_week_start_key" UNIQUE ("user_id", "week_start");

CREATE INDEX "idx_battle_limits_user_id" ON "public"."battle_limits" USING "btree" ("user_id");

CREATE INDEX "idx_daily_quotas_user_id" ON "public"."daily_quotas" USING "btree" ("user_id");

CREATE INDEX "idx_evolution_paths_dna_requirement" ON "public"."evolution_paths" USING "btree" ("dna_requirement");

CREATE INDEX "idx_task_history_user_date" ON "public"."task_history" USING "btree" ("user_id", "date");

CREATE INDEX "idx_user_currency_user_id" ON "public"."user_currency" USING "btree" ("user_id");

CREATE INDEX "idx_user_digimon_storage" ON "public"."user_digimon" USING "btree" ("user_id", "is_in_storage");

CREATE INDEX "idx_user_inventory_user_id" ON "public"."user_inventory" USING "btree" ("user_id");

CREATE INDEX "idx_user_milestones_user_id" ON "public"."user_milestones" USING "btree" ("user_id");

CREATE INDEX "team_battles_opponent_id_idx" ON "public"."team_battles" USING "btree" ("opponent_id");

CREATE INDEX "team_battles_user_id_idx" ON "public"."team_battles" USING "btree" ("user_id");

ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."battle_limits"
    ADD CONSTRAINT "battle_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."daily_quotas"
    ADD CONSTRAINT "daily_quotas_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_base_digimon_id_fkey" FOREIGN KEY ("base_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."digimon_forms"
    ADD CONSTRAINT "digimon_forms_form_digimon_id_fkey" FOREIGN KEY ("form_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_dna_requirement_fkey" FOREIGN KEY ("dna_requirement") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_from_digimon_id_fkey" FOREIGN KEY ("from_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."evolution_paths"
    ADD CONSTRAINT "evolution_paths_to_digimon_id_fkey" FOREIGN KEY ("to_digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."task_history"
    ADD CONSTRAINT "task_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."team_battles"
    ADD CONSTRAINT "team_battles_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."user_currency"
    ADD CONSTRAINT "user_currency_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_digimon"
    ADD CONSTRAINT "user_digimon_digimon_id_fkey" FOREIGN KEY ("digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."user_digimon"
    ADD CONSTRAINT "user_digimon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_digimon_id_fkey" FOREIGN KEY ("digimon_id") REFERENCES "public"."digimon"("id");

ALTER TABLE ONLY "public"."user_discovered_digimon"
    ADD CONSTRAINT "user_discovered_digimon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_inventory"
    ADD CONSTRAINT "user_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_titles"
    ADD CONSTRAINT "user_titles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_tournaments"
    ADD CONSTRAINT "user_tournaments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY public.team_battles
  ADD CONSTRAINT team_battles_winner_is_participant CHECK (
    (winner_id IS NULL AND opponent_id IS NULL) OR
    (winner_id IS NOT NULL AND (winner_id = user_id OR (opponent_id IS NOT NULL AND winner_id = opponent_id)))
  ) NOT VALID;
ALTER TABLE ONLY public.team_battles
  ADD CONSTRAINT team_battles_distinct_opponent CHECK (opponent_id IS NULL OR opponent_id <> user_id) NOT VALID;

ALTER TABLE ONLY public.arena_battle_offers ADD CONSTRAINT arena_battle_offers_pkey PRIMARY KEY(id);
ALTER TABLE ONLY public.arena_battle_offers ADD CONSTRAINT arena_battle_offers_user_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.arena_battle_requests ADD CONSTRAINT arena_battle_requests_pkey PRIMARY KEY(id);
ALTER TABLE ONLY public.arena_battle_requests ADD CONSTRAINT arena_battle_requests_user_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.arena_battle_requests ADD CONSTRAINT arena_battle_requests_offer_fkey FOREIGN KEY(offer_id) REFERENCES public.arena_battle_offers(id);
CREATE INDEX arena_offers_user_expiry ON public.arena_battle_offers(user_id,expires_at);
CREATE INDEX arena_requests_user_settled ON public.arena_battle_requests(user_id,settled_at DESC);
CREATE UNIQUE INDEX arena_one_pending_per_user ON public.arena_battle_requests(user_id) WHERE status='prepared';
CREATE UNIQUE INDEX arena_offer_settled_once ON public.arena_battle_requests(offer_id) WHERE status='settled';
