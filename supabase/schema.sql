-- Enable UUID extension
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

-- Create digimon table
CREATE TABLE digimon
(
  id SERIAL PRIMARY KEY,
  digimon_id INTEGER NOT NULL,
  -- The display ID (#215)
  request_id INTEGER NOT NULL,
  -- The URL parameter ID (request=164)
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  type TEXT,
  attribute TEXT,
  sprite_url TEXT,
  hp INTEGER,
  sp INTEGER,
  atk INTEGER,
  def INTEGER,
  int INTEGER,
  spd INTEGER,
  detail_url TEXT
);

-- Create evolution paths table
CREATE TABLE evolution_paths
(
  id SERIAL PRIMARY KEY,
  from_digimon_id INTEGER REFERENCES digimon(id),
  to_digimon_id INTEGER REFERENCES digimon(id),
  level_required INTEGER NOT NULL DEFAULT 0,
  UNIQUE(from_digimon_id, to_digimon_id)
);

-- Create user's digimon table
CREATE TABLE user_digimon
(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  digimon_id INTEGER NOT NULL REFERENCES digimon(id),
  name TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  health INTEGER NOT NULL DEFAULT 100,
  happiness INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW
  (),
  last_updated_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW
  (),
  last_fed_tasks_at TIMESTAMP
  WITH TIME ZONE DEFAULT NOW
  ()
);

  -- Add RLS policies for user_digimon
  ALTER TABLE user_digimon ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can only see their own digimon" 
ON user_digimon FOR
  SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own digimon" 
ON user_digimon FOR
  INSERT 
WITH CHECK (auth.uid() =
  user_id);

  CREATE POLICY "Users can update their own digimon" 
ON user_digimon FOR
  UPDATE 
USING (auth.uid()
  = user_id);

  CREATE POLICY "Users can delete their own digimon" 
ON user_digimon FOR
  DELETE 
USING (auth.uid
  () = user_id);

  -- Create pets table
  CREATE TABLE pets
  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_stage TEXT NOT NULL DEFAULT 'egg',
    species_key TEXT NOT NULL DEFAULT 'default',
    health INTEGER NOT NULL DEFAULT 100,
    happiness INTEGER NOT NULL DEFAULT 100,
    age_days INTEGER NOT NULL DEFAULT 0,
    evolution_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    (),
  last_updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    (),
  last_fed_tasks_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    ()
);

    -- Add RLS policies for pets
    ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can only see their own pets" 
  ON pets FOR
    SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own pets" 
  ON pets FOR
    INSERT 
  WITH CHECK (auth.uid() =
    user_id);

    CREATE POLICY "Users can update their own pets" 
  ON pets FOR
    UPDATE 
  USING (auth.uid
  = user_id
    );

    CREATE POLICY "Users can delete their own pets" 
  ON pets FOR
    DELETE 
  USING (auth.uid
    () = user_id);

    -- Create tasks table
    CREATE TABLE tasks
    (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      is_daily BOOLEAN NOT NULL DEFAULT false,
      due_date DATE,
      is_completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP
      WITH TIME ZONE DEFAULT NOW
      (),
  completed_at TIMESTAMP
      WITH TIME ZONE
);

      -- Add RLS policies for tasks
      ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can only see their own tasks" 
  ON tasks FOR
      SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own tasks" 
  ON tasks FOR
      INSERT 
  WITH CHECK (auth.uid() =
      user_id);

      CREATE POLICY "Users can update their own tasks" 
  ON tasks FOR
      UPDATE 
  USING (auth.uid()
      = user_id);

      CREATE POLICY "Users can delete their own tasks" 
  ON tasks FOR
      DELETE 
  USING (auth.uid
      () = user_id);

      -- Create a table to track which Digimon the user has discovered
      CREATE TABLE user_discovered_digimon
      (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        digimon_id INTEGER NOT NULL REFERENCES digimon(id),
        discovered_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        (),
  UNIQUE
        (user_id, digimon_id)
);

        -- Add RLS policies for user_discovered_digimon
        ALTER TABLE user_discovered_digimon ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can only see their own discovered Digimon" 
ON user_discovered_digimon FOR
        SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own discovered Digimon" 
ON user_discovered_digimon FOR
        INSERT 
WITH CHECK (auth.uid() =
        user_id); 