-- Tables in the public schema

CREATE TABLE public.battle_limits (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  battles_used integer NULL DEFAULT 0,
  last_reset_date date NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT battle_limits_pkey PRIMARY KEY (id),
  CONSTRAINT battle_limits_user_id_key UNIQUE (user_id),
  CONSTRAINT battle_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_battle_limits_user_id ON public.battle_limits USING btree (user_id);

CREATE TABLE public.battles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_digimon_id uuid NOT NULL,
  opponent_digimon_id uuid NOT NULL,
  winner_digimon_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_digimon_details jsonb NULL,
  opponent_digimon_details jsonb NULL,
  CONSTRAINT battles_pkey PRIMARY KEY (id),
  CONSTRAINT battles_opponent_digimon_id_fkey FOREIGN KEY (opponent_digimon_id) REFERENCES user_digimon(id) ON DELETE CASCADE,
  CONSTRAINT battles_user_digimon_id_fkey FOREIGN KEY (user_digimon_id) REFERENCES user_digimon(id) ON DELETE CASCADE,
  CONSTRAINT battles_winner_digimon_id_fkey FOREIGN KEY (winner_digimon_id) REFERENCES user_digimon(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS battles_user_digimon_id_idx ON public.battles USING btree (user_digimon_id);
CREATE INDEX IF NOT EXISTS battles_opponent_digimon_id_idx ON public.battles USING btree (opponent_digimon_id);
CREATE INDEX IF NOT EXISTS battles_winner_digimon_id_idx ON public.battles USING btree (winner_digimon_id);

CREATE TABLE public.daily_quotas (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  completed_today integer NULL DEFAULT 0,
  consecutive_days_missed integer NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  penalized_tasks text[] NULL DEFAULT '{}'::text[],
  CONSTRAINT daily_quotas_pkey PRIMARY KEY (id),
  CONSTRAINT daily_quotas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_daily_quotas_user_id ON public.daily_quotas USING btree (user_id);

CREATE TABLE public.digimon (
  id serial NOT NULL,
  digimon_id integer NOT NULL,
  request_id integer NOT NULL,
  name text NOT NULL,
  stage text NOT NULL,
  type text NULL,
  attribute text NULL,
  sprite_url text NULL,
  hp integer NULL,
  sp integer NULL,
  atk integer NULL,
  def integer NULL,
  int integer NULL,
  spd integer NULL,
  detail_url text NULL,
  CONSTRAINT digimon_pkey PRIMARY KEY (id)
);

CREATE TABLE public.evolution_paths (
  id serial NOT NULL,
  from_digimon_id integer NULL,
  to_digimon_id integer NULL,
  level_required integer NOT NULL DEFAULT 0,
  CONSTRAINT evolution_paths_pkey PRIMARY KEY (id),
  CONSTRAINT evolution_paths_from_digimon_id_to_digimon_id_key UNIQUE (from_digimon_id, to_digimon_id),
  CONSTRAINT evolution_paths_from_digimon_id_fkey FOREIGN KEY (from_digimon_id) REFERENCES digimon(id),
  CONSTRAINT evolution_paths_to_digimon_id_fkey FOREIGN KEY (to_digimon_id) REFERENCES digimon(id)
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL,
  display_name text NULL,
  avatar_url text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  description text NOT NULL,
  is_daily boolean NOT NULL DEFAULT false,
  due_date timestamp with time zone NULL,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  completed_at timestamp with time zone NULL,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.user_digimon (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  digimon_id integer NOT NULL,
  name text NOT NULL,
  current_level integer NOT NULL DEFAULT 1,
  experience_points integer NOT NULL DEFAULT 0,
  health integer NOT NULL DEFAULT 100,
  happiness integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone NULL DEFAULT now(),
  last_updated_at timestamp with time zone NULL DEFAULT now(),
  last_fed_tasks_at timestamp with time zone NULL DEFAULT now(),
  is_active boolean NULL DEFAULT false,
  CONSTRAINT user_digimon_pkey PRIMARY KEY (id),
  CONSTRAINT user_digimon_digimon_id_fkey FOREIGN KEY (digimon_id) REFERENCES digimon(id),
  CONSTRAINT user_digimon_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.user_discovered_digimon (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  digimon_id integer NOT NULL,
  discovered_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_discovered_digimon_pkey PRIMARY KEY (id),
  CONSTRAINT user_discovered_digimon_user_id_digimon_id_key UNIQUE (user_id, digimon_id),
  CONSTRAINT user_discovered_digimon_digimon_id_fkey FOREIGN KEY (digimon_id) REFERENCES digimon(id),
  CONSTRAINT user_discovered_digimon_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create a table for team battles
CREATE TABLE public.team_battles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  opponent_id uuid NULL,
  winner_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_team jsonb NOT NULL,
  opponent_team jsonb NOT NULL,
  turns jsonb NULL,
  CONSTRAINT team_battles_pkey PRIMARY KEY (id),
  CONSTRAINT team_battles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS team_battles_user_id_idx ON public.team_battles USING btree (user_id);
CREATE INDEX IF NOT EXISTS team_battles_opponent_id_idx ON public.team_battles USING btree (opponent_id);

-- Functions in the public schema

CREATE OR REPLACE FUNCTION public.update_completed_today() RETURNS trigger AS $$
BEGIN
  IF NEW.is_completed = TRUE AND (OLD.is_completed = FALSE OR OLD.is_completed IS NULL) THEN
    DECLARE
      quota_id UUID;
    BEGIN
      SELECT id INTO quota_id FROM daily_quotas 
      WHERE user_id = NEW.user_id;
      
      IF quota_id IS NULL THEN
        INSERT INTO daily_quotas (
          user_id, 
          completed_today, 
          consecutive_days_missed
        ) VALUES (
          NEW.user_id, 
          1, 
          0
        );
      ELSE
        UPDATE daily_quotas 
        SET completed_today = completed_today + 1,
            updated_at = NOW()
        WHERE id = quota_id;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_and_increment_battle_limit(p_user_id uuid, p_date date, p_limit integer) RETURNS boolean AS $$
DECLARE
  v_current_count INTEGER;
  v_limit_id UUID;
BEGIN
  SELECT id, battles_used INTO v_limit_id, v_current_count
  FROM battle_limits
  WHERE user_id = p_user_id AND date = p_date
  FOR UPDATE;
  
  IF v_limit_id IS NULL THEN
    IF p_limit > 0 THEN
      INSERT INTO battle_limits (user_id, date, battles_used, last_battle_at)
      VALUES (p_user_id, p_date, 1, NOW());
      RETURN TRUE;
    ELSE
      RETURN FALSE; -- Edge case: limit is 0
    END IF;
  END IF;
  
  IF v_current_count >= p_limit THEN
    RETURN FALSE;
  END IF;
  
  UPDATE battle_limits
  SET battles_used = battles_used + 1,
      last_battle_at = NOW()
  WHERE id = v_limit_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add other functions as needed...

-- Functions in the cron schema

CREATE FUNCTION cron.schedule(schedule text, command text) RETURNS bigint AS $$
BEGIN
  RETURN cron_schedule(schedule, command);
END;
$$ LANGUAGE c;

CREATE FUNCTION cron.unschedule(job_id bigint) RETURNS boolean AS $$
BEGIN
  RETURN cron_unschedule(job_id);
END;
$$ LANGUAGE c;

CREATE FUNCTION cron.job_cache_invalidate() RETURNS trigger AS $$
BEGIN
  RETURN cron_job_cache_invalidate();
END;
$$ LANGUAGE c;

CREATE FUNCTION cron.schedule(job_name text, schedule text, command text) RETURNS bigint AS $$
BEGIN
  RETURN cron_schedule_named(job_name, schedule, command);
END;
$$ LANGUAGE c;

CREATE FUNCTION cron.unschedule(job_name text) RETURNS boolean AS $$
BEGIN
  RETURN cron_unschedule_named(job_name);
END;
$$ LANGUAGE c;

CREATE FUNCTION cron.alter_job(job_id bigint, schedule text DEFAULT NULL::text, command text DEFAULT NULL::text, database text DEFAULT NULL::text, username text DEFAULT NULL::text, active boolean DEFAULT NULL::boolean) RETURNS void AS $$
BEGIN
  cron_alter_job(job_id, schedule, command, database, username, active);
END;
$$ LANGUAGE c;

CREATE FUNCTION cron.schedule_in_database(job_name text, schedule text, command text, database text, username text DEFAULT NULL::text, active boolean DEFAULT true) RETURNS bigint AS $$
BEGIN
  RETURN cron_schedule_named(job_name, schedule, command, database, username, active);
END;
$$ LANGUAGE c;

-- Add other cron jobs as needed...