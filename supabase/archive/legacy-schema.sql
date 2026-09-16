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
  hp_level1 integer NULL DEFAULT 0,
  sp_level1 integer NULL DEFAULT 0,
  atk_level1 integer NULL DEFAULT 0,
  def_level1 integer NULL DEFAULT 0,
  int_level1 integer NULL DEFAULT 0,
  spd_level1 integer NULL DEFAULT 0,
  hp_level99 integer NULL DEFAULT 0,
  sp_level99 integer NULL DEFAULT 0,
  atk_level99 integer NULL DEFAULT 0,
  def_level99 integer NULL DEFAULT 0,
  int_level99 integer NULL DEFAULT 0,
  spd_level99 integer NULL DEFAULT 0,
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
  highest_stage_cleared INTEGER DEFAULT 0,
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
  CONSTRAINT team_battles_opponent_id_fkey FOREIGN KEY (opponent_id) REFERENCES profiles(id),
  CONSTRAINT team_battles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT team_battles_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES profiles(id)
);
CREATE INDEX IF NOT EXISTS team_battles_user_id_idx ON public.team_battles USING btree (user_id);
CREATE INDEX IF NOT EXISTS team_battles_opponent_id_idx ON public.team_battles USING btree (opponent_id);

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
  is_on_team boolean NOT NULL DEFAULT false,
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

CREATE TABLE public.user_milestones (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  daily_quota_streak integer NOT NULL DEFAULT 0,
  tasks_completed_count integer NOT NULL DEFAULT 0,
  last_digimon_claimed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_milestones_pkey PRIMARY KEY (id),
  CONSTRAINT user_milestones_user_id_key UNIQUE (user_id),
  CONSTRAINT user_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON public.user_milestones USING btree (user_id);

-- Add titles table to store all available titles
CREATE TABLE titles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'campaign', 'collection', 'evolution', etc.
  requirement_type TEXT NOT NULL, -- 'campaign_stage', 'digimon_count', 'digimon_level', etc.
  requirement_value INTEGER NOT NULL, -- stage number, count threshold, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_titles table to track which titles users have earned
CREATE TABLE user_titles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title_id INTEGER REFERENCES titles(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- Functions

CREATE OR REPLACE FUNCTION public.get_random_digimon_by_stage(stage_param text)
RETURNS TABLE(id integer, digimon_id integer, request_id integer, name text, stage text, type text, attribute text, sprite_url text, hp integer, sp integer, atk integer, def integer, "int" integer, spd integer, hp_level1 integer, sp_level1 integer, atk_level1 integer, def_level1 integer, int_level1 integer, spd_level1 integer, hp_level99 integer, sp_level99 integer, atk_level99 integer, def_level99 integer, int_level99 integer, spd_level99 integer)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.digimon_id,
    d.request_id,
    d.name,
    d.stage,
    d.type,
    d.attribute,
    d.sprite_url,
    d.hp,
    d.sp,
    d.atk,
    d.def,
    d."int",
    d.spd,
    d.hp_level1,
    d.sp_level1,
    d.atk_level1,
    d.def_level1,
    d.int_level1,
    d.spd_level1,
    d.hp_level99,
    d.sp_level99,
    d.atk_level99,
    d.def_level99,
    d.int_level99,
    d.spd_level99
  FROM public.digimon d
  WHERE d.stage = stage_param
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Update user_titles table to remove is_displayed column
ALTER TABLE user_titles DROP COLUMN is_displayed;