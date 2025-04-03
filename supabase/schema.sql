CREATE TABLE public.battle_limits
(
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  battles_used integer NOT NULL DEFAULT 0,
  last_battle_at timestamp
  with time zone NULL,
  created_at timestamp
  with time zone NULL DEFAULT now
  (),
  CONSTRAINT battle_limits_pkey PRIMARY KEY
  (id),
  CONSTRAINT battle_limits_user_id_date_key UNIQUE
  (user_id, date),
  CONSTRAINT battle_limits_user_id_fkey FOREIGN KEY
  (user_id) REFERENCES auth.users
  (id) ON
  DELETE CASCADE
) TABLESPACE pg_default;

  CREATE TABLE public.battles
  (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_digimon_id uuid NOT NULL,
    opponent_digimon_id uuid NOT NULL,
    winner_digimon_id uuid NOT NULL,
    created_at timestamp
    with time zone NOT NULL DEFAULT now
    (),
  user_digimon_details jsonb NULL,
  opponent_digimon_details jsonb NULL,
  CONSTRAINT battles_pkey PRIMARY KEY
    (id),
  CONSTRAINT battles_opponent_digimon_id_fkey FOREIGN KEY
    (opponent_digimon_id) REFERENCES user_digimon
    (id) ON
    DELETE CASCADE,
  CONSTRAINT battles_user_digimon_id_fkey FOREIGN KEY
    (user_digimon_id) REFERENCES user_digimon
    (id) ON
    DELETE CASCADE,
  CONSTRAINT battles_winner_digimon_id_fkey FOREIGN KEY
    (winner_digimon_id) REFERENCES user_digimon
    (id)
) TABLESPACE pg_default;

    CREATE INDEX
    IF NOT EXISTS battles_user_digimon_id_idx ON public.battles USING btree
    (user_digimon_id) TABLESPACE pg_default;
    CREATE INDEX
    IF NOT EXISTS battles_opponent_digimon_id_idx ON public.battles USING btree
    (opponent_digimon_id) TABLESPACE pg_default;
    CREATE INDEX
    IF NOT EXISTS battles_winner_digimon_id_idx ON public.battles USING btree
    (winner_digimon_id) TABLESPACE pg_default;

    CREATE TABLE public.digimon
    (
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
    )
    TABLESPACE pg_default;

    CREATE TABLE public.evolution_paths
    (
      id serial NOT NULL,
      from_digimon_id integer NULL,
      to_digimon_id integer NULL,
      level_required integer NOT NULL DEFAULT 0,
      CONSTRAINT evolution_paths_pkey PRIMARY KEY (id),
      CONSTRAINT evolution_paths_from_digimon_id_to_digimon_id_key UNIQUE (from_digimon_id, to_digimon_id),
      CONSTRAINT evolution_paths_from_digimon_id_fkey FOREIGN KEY (from_digimon_id) REFERENCES digimon(id),
      CONSTRAINT evolution_paths_to_digimon_id_fkey FOREIGN KEY (to_digimon_id) REFERENCES digimon(id)
    )
    TABLESPACE pg_default;

    CREATE TABLE public.profiles
    (
      id uuid NOT NULL,
      username text NOT NULL,
      display_name text NULL,
      avatar_url text NULL,
      created_at timestamp
      with time zone NOT NULL DEFAULT now
      (),
  updated_at timestamp
      with time zone NOT NULL DEFAULT now
      (),
  CONSTRAINT profiles_pkey PRIMARY KEY
      (id),
  CONSTRAINT profiles_username_key UNIQUE
      (username),
  CONSTRAINT profiles_id_fkey FOREIGN KEY
      (id) REFERENCES auth.users
      (id) ON
      DELETE CASCADE
) TABLESPACE pg_default;

      CREATE TABLE public.tasks
      (
        id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
        user_id uuid NOT NULL,
        description text NOT NULL,
        is_daily boolean NOT NULL DEFAULT false,
        due_date timestamp
        with time zone NULL,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp
        with time zone NULL DEFAULT now
        (),
  completed_at timestamp
        with time zone NULL,
  CONSTRAINT tasks_pkey PRIMARY KEY
        (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY
        (user_id) REFERENCES auth.users
        (id) ON
        DELETE CASCADE
) TABLESPACE pg_default;

        CREATE TABLE public.user_digimon
        (
          id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
          user_id uuid NOT NULL,
          digimon_id integer NOT NULL,
          name text NOT NULL,
          current_level integer NOT NULL DEFAULT 1,
          experience_points integer NOT NULL DEFAULT 0,
          health integer NOT NULL DEFAULT 100,
          happiness integer NOT NULL DEFAULT 100,
          created_at timestamp
          with time zone NULL DEFAULT now
          (),
  last_updated_at timestamp
          with time zone NULL DEFAULT now
          (),
  last_fed_tasks_at timestamp
          with time zone NULL DEFAULT now
          (),
  CONSTRAINT user_digimon_pkey PRIMARY KEY
          (id),
  CONSTRAINT user_digimon_digimon_id_fkey FOREIGN KEY
          (digimon_id) REFERENCES digimon
          (id),
  CONSTRAINT user_digimon_user_id_fkey FOREIGN KEY
          (user_id) REFERENCES auth.users
          (id) ON
          DELETE CASCADE
) TABLESPACE pg_default;

          CREATE TABLE public.user_discovered_digimon
          (
            id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
            user_id uuid NOT NULL,
            digimon_id integer NOT NULL,
            discovered_at timestamp
            with time zone NULL DEFAULT now
            (),
  CONSTRAINT user_discovered_digimon_pkey PRIMARY KEY
            (id),
  CONSTRAINT user_discovered_digimon_user_id_digimon_id_key UNIQUE
            (user_id, digimon_id),
  CONSTRAINT user_discovered_digimon_digimon_id_fkey FOREIGN KEY
            (digimon_id) REFERENCES digimon
            (id),
  CONSTRAINT user_discovered_digimon_user_id_fkey FOREIGN KEY
            (user_id) REFERENCES auth.users
            (id) ON
            DELETE CASCADE
) TABLESPACE pg_default;