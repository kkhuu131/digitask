-- Weekly Boss Raid System Migration

-- Create preset boss configurations table
CREATE TABLE preset_boss_configs
(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    boss_digimon_id INTEGER REFERENCES digimon(id),
    rotation_order INTEGER NOT NULL UNIQUE,
    stat_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.5,
    special_abilities JSONB DEFAULT '[]',
    reward_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    ()
);

    -- Weekly boss events table
    CREATE TABLE weekly_boss_events
    (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        week_start_date DATE NOT NULL UNIQUE,
        preset_boss_id INTEGER REFERENCES preset_boss_configs(id),
        phase INTEGER NOT NULL DEFAULT 1,
        -- 1 = weakening, 2 = battle, 3 = completed
        global_progress INTEGER NOT NULL DEFAULT 0,
        target_progress INTEGER NOT NULL DEFAULT 1000,
        -- Base target, can be adjusted
        total_damage_dealt BIGINT NOT NULL DEFAULT 0,
        boss_max_hp BIGINT NOT NULL DEFAULT 1000000,
        boss_current_hp BIGINT NOT NULL DEFAULT 1000000,
        participants_count INTEGER DEFAULT 0,
        is_defeated boolean DEFAULT false,
        phase_1_end_date TIMESTAMP
        WITH TIME ZONE,
  phase_2_end_date TIMESTAMP
        WITH TIME ZONE,
  created_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        ()
);

        -- User participation in weekly events
        CREATE TABLE weekly_boss_participation
        (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id),
            event_id UUID REFERENCES weekly_boss_events(id),
            tasks_contributed INTEGER DEFAULT 0,
            battle_attempts INTEGER DEFAULT 0,
            total_damage_dealt BIGINT DEFAULT 0,
            best_single_damage INTEGER DEFAULT 0,
            participation_tier INTEGER DEFAULT 0,
            -- 0=none, 1=participant, 2=battler, 3=victor
            rewards_claimed BOOLEAN DEFAULT false,
            last_battle_at TIMESTAMP
            WITH TIME ZONE,
  created_at TIMESTAMP
            WITH TIME ZONE DEFAULT NOW
            (),
  UNIQUE
            (user_id, event_id)
);

            -- Boss battle results
            CREATE TABLE weekly_boss_battles
            (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                event_id UUID REFERENCES weekly_boss_events(id),
                user_id UUID REFERENCES auth.users(id),
                damage_dealt INTEGER NOT NULL,
                battle_duration INTEGER DEFAULT 0,
                -- in seconds
                user_team JSONB NOT NULL,
                boss_hp_before BIGINT NOT NULL,
                boss_hp_after BIGINT NOT NULL,
                battle_turns JSONB,
                created_at TIMESTAMP
                WITH TIME ZONE DEFAULT NOW
                ()
);

                -- Create indexes for performance
                CREATE INDEX idx_weekly_boss_events_week_start ON weekly_boss_events(week_start_date);
                CREATE INDEX idx_weekly_boss_participation_user_event ON weekly_boss_participation(user_id, event_id);
                CREATE INDEX idx_weekly_boss_battles_event_user ON weekly_boss_battles(event_id, user_id);
                CREATE INDEX idx_weekly_boss_battles_created_at ON weekly_boss_battles(created_at);

                -- Insert preset boss configurations (6 rotating bosses)
                INSERT INTO preset_boss_configs
                    (name, description, boss_digimon_id, rotation_order, stat_multiplier, special_abilities, reward_multiplier)
                VALUES
                    ('Corrupted MetalGreymon', 'A once-noble warrior corrupted by dark digital energy. Its chrome digizoid armor has turned black with malice.',
                        (SELECT id
                        FROM digimon
                        WHERE name
                ILIKE '%metalgreymon%' LIMIT 1), 
  1, 2.8, 
  '["Giga Destroyer", "Metal Slash", "Corrupted Shield"]', 
  1.0),

                ('Shadow MegaKabuterimon', 'An ancient insect digimon consumed by darkness, its once-bright exoskeleton now drips with digital corruption.',
                (SELECT id
                FROM digimon
                WHERE name
                ILIKE '%megakabuterimon%' LIMIT 1), 
  2, 2.6, 
  '["Horn Buster", "Shadow Swarm", "Electro Shocker"]', 
  1.1),

                ('Viral WarGreymon', 'The legendary dragon warrior infected by a powerful virus, turning its courage into destructive rage.',
                (SELECT id
                FROM digimon
                WHERE name
                ILIKE '%wargreymon%' LIMIT 1), 
  3, 3.2, 
  '["Dark Gaia Force", "Dramon Killer", "Berserker Mode"]', 
  1.3),

                ('Nightmare Piedmon', 'A twisted jester whose pranks have become deadly serious, wielding dark magic from the deepest nightmares.',
                (SELECT id
                FROM digimon
                WHERE name
                ILIKE '%piedmon%' LIMIT 1), 
  4, 3.0, 
  '["Trump Sword", "Mask Square", "Nightmare Illusion"]', 
  1.2),

                ('Chaos Omnimon', 'The fusion of corrupted data has created this ultimate warrior, whose justice has been perverted into tyranny.',
                (SELECT id
                FROM digimon
                WHERE name
                ILIKE '%omnimon%' OR name ILIKE '%omegamon%' LIMIT 1), 
  5, 3.5, 
  '["Supreme Cannon", "Transcendent Sword", "Digital Apocalypse"]', 
  1.5),

                ('Ancient Apocalymon', 'The embodiment of deleted data given form, seeking to return all digital existence to the void.',
                (SELECT id
                FROM digimon
                WHERE name
                ILIKE '%apocalymon%' LIMIT 1), 
  6, 4.0, 
  '["Darkness Zone", "Death Evolution", "Ultimate Stream"]', 
  1.8);

                -- Function to determine correct phase based on day of week
                CREATE OR REPLACE FUNCTION get_correct_phase_for_day
                ()
RETURNS INTEGER AS $$
                DECLARE
  current_day INTEGER;
                BEGIN
  -- Get day of week (1 = Monday, 7 = Sunday)
  current_day := EXTRACT
                (DOW FROM CURRENT_DATE);
                -- Convert Sunday (0) to 7 for easier logic
                IF current_day = 0 THEN
    current_day := 7;
                END
                IF;
  
  -- Phase 1: Monday-Friday (1-5)
  -- Phase 2: Saturday-Sunday (6-7)
  IF current_day >= 1 AND current_day <= 5 THEN
                RETURN 1;
                -- Weekdays = Phase 1 (Task weakening)
                ELSE
                RETURN 2;
                -- Weekends = Phase 2 (Battle phase)
                END
                IF;
END;
$$ LANGUAGE plpgsql;

                -- Function to get current or create new weekly boss event
                CREATE OR REPLACE FUNCTION get_current_weekly_boss_event
                ()
RETURNS TABLE
                (
  event_id UUID,
  boss_name TEXT,
  boss_description TEXT,
  phase INTEGER,
  global_progress INTEGER,
  target_progress INTEGER,
  boss_current_hp BIGINT,
  boss_max_hp BIGINT,
  participants_count INTEGER,
  days_remaining INTEGER
) AS $$
                DECLARE
  current_week_start DATE;
  existing_event_id UUID;
  next_boss_rotation INTEGER;
  new_event_id UUID;
  correct_phase INTEGER;
                BEGIN
  -- Get the start of current week (Monday)
  current_week_start := DATE_TRUNC
                ('week', CURRENT_DATE);
  
  -- Get the correct phase for today
  correct_phase := get_correct_phase_for_day
                ();

                -- Check if we have an event for this week
                SELECT id
                INTO existing_event_id
                FROM weekly_boss_events
                WHERE week_start_date = current_week_start;

                IF existing_event_id IS NULL THEN
                -- Determine next boss in rotation
                SELECT COALESCE(
      (SELECT rotation_order + 1 
       FROM weekly_boss_events wbe 
       JOIN preset_boss_configs pbc ON wbe.preset_boss_id = pbc.id 
       ORDER BY week_start_date DESC 
       LIMIT 1), 
      1
    ) INTO next_boss_rotation;
    
    -- Reset to 1 if we've exceeded the max rotation
    IF next_boss_rotation > 6 THEN
      next_boss_rotation := 1;
    END IF;
    
    -- Create new event with correct phase
    INSERT INTO weekly_boss_events (
      week_start_date,
      preset_boss_id,
      phase,
      target_progress,
      boss_max_hp,
      boss_current_hp,
      phase_1_end_date,
      phase_2_end_date
    )
                SELECT
                    current_week_start,
                    pbc.id,
                    correct_phase, -- Use correct phase based on day
                    1000, -- Base target progress
                    CAST(1000000 * pbc.stat_multiplier AS BIGINT),
                    CAST(1000000 * pbc.stat_multiplier AS BIGINT),
                    current_week_start + INTERVAL '5 days', -- Phase 1 ends Friday
                    current_week_start + INTERVAL '7 days'
                -- Phase 2 ends Sunday
                FROM preset_boss_configs pbc
                WHERE pbc.rotation_order = next_boss_rotation
                RETURNING id INTO new_event_id;
    
    existing_event_id := new_event_id;
  ELSE
                -- Update existing event to correct phase if needed
                UPDATE weekly_boss_events 
    SET phase = correct_phase
    WHERE id = existing_event_id
                    AND phase != correct_phase;
                END
                IF;
  
  -- Return current event details
  RETURN QUERY
                SELECT
                    wbe.id,
                    pbc.name,
                    pbc.description,
                    wbe.phase,
                    wbe.global_progress,
                    wbe.target_progress,
                    wbe.boss_current_hp,
                    wbe.boss_max_hp,
                    wbe.participants_count,
                    CASE 
      WHEN wbe.phase = 1 THEN EXTRACT(DAY FROM wbe.phase_1_end_date - NOW())::INTEGER
      WHEN wbe.phase = 2 THEN EXTRACT(DAY FROM wbe.phase_2_end_date - NOW())::INTEGER
      ELSE 0
    END
                FROM weekly_boss_events wbe
                    JOIN preset_boss_configs pbc ON wbe.preset_boss_id = pbc.id
                WHERE wbe.id = existing_event_id;
                END;
$$ LANGUAGE plpgsql;

                -- Function to contribute task progress to weekly boss
                CREATE OR REPLACE FUNCTION contribute_boss_progress
                (
  p_user_id UUID,
  p_task_points INTEGER DEFAULT 1,
  p_is_daily_quota BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
                DECLARE
  v_event_id UUID;
  v_bonus_multiplier DECIMAL := 1.0;
  v_total_contribution INTEGER;
                BEGIN
                    -- Get current event
                    SELECT event_id
                    INTO v_event_id
                    FROM get_current_weekly_boss_event()
  LIMIT
                    1;

                IF v_event_id IS NULL OR
                    (SELECT phase
                    FROM weekly_boss_events
                    WHERE id = v_event_id) != 1 THEN
                RETURN FALSE;
                -- No active phase 1 event
                END
                IF;
  
  -- Apply bonus for daily quota completion
  IF p_is_daily_quota THEN
    v_bonus_multiplier := 3.0;
                END
                IF;
  
  -- Check for streak bonus (7+ day streak = 1.5x multiplier)
  IF (SELECT current_streak
                FROM daily_quotas
                WHERE user_id = p_user_id
                ORDER BY created_at DESC LIMIT 1) >= 7 THEN
    v_bonus_multiplier := v_bonus_multiplier * 1.5;
                END
                IF;
  
  v_total_contribution := CEIL
                (p_task_points * v_bonus_multiplier);

                -- Update or insert participation record
                INSERT INTO weekly_boss_participation
                    (user_id, event_id, tasks_contributed, participation_tier)
                VALUES
                    (p_user_id, v_event_id, v_total_contribution, 1)
                ON CONFLICT
                (user_id, event_id)
  DO
                UPDATE SET 
    tasks_contributed = weekly_boss_participation.tasks_contributed + v_total_contribution,
    participation_tier = GREATEST(weekly_boss_participation.participation_tier, 1);

                -- Update global progress
                UPDATE weekly_boss_events 
  SET 
    global_progress = global_progress + v_total_contribution,
    participants_count = (
      SELECT COUNT(DISTINCT user_id)
                FROM weekly_boss_participation
                WHERE event_id = v_event_id
    )
  WHERE id = v_event_id;

                -- Check if we should advance to phase 2
                UPDATE weekly_boss_events 
  SET phase = 2 
  WHERE id = v_event_id
                    AND phase = 1
                    AND global_progress >= target_progress;

                RETURN TRUE;
                END;
$$ LANGUAGE plpgsql;

                -- Function to advance phases automatically (called by cron job)
                CREATE OR REPLACE FUNCTION advance_boss_phases
                ()
RETURNS VOID AS $$
                BEGIN
                    -- Move phase 1 to phase 2 if time is up (Friday)
                    UPDATE weekly_boss_events 
  SET phase = 2
  WHERE phase = 1
                        AND phase_1_end_date <= NOW()
                        AND global_progress >= target_progress * 0.75;
                    -- Minimum 75% progress required

                    -- Move phase 2 to completed (Sunday)
                    UPDATE weekly_boss_events 
  SET phase = 3
  WHERE phase = 2
                        AND phase_2_end_date <= NOW();
                END;
                $$ LANGUAGE plpgsql; 