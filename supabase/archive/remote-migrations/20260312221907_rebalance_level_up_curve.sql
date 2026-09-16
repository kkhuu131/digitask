-- Update level_up_digimon trigger to use new EXP curve
-- New formula: xp needed to go from level N to N+1 = 100 + (N * 50)
-- Level 1->2: 150 XP, Level 10->11: 600 XP, Level 50->51: 2600 XP, Level 99: ~5000 XP
-- (was: N * 20 — Level 1->2: 20 XP, Level 99: 1980 XP)

CREATE OR REPLACE FUNCTION level_up_digimon()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    xp_threshold INTEGER;
BEGIN
    -- Loop in case multiple level-ups are earned at once
    LOOP
        xp_threshold := 100 + (NEW.current_level * 50);

        EXIT WHEN NEW.experience_points < xp_threshold OR NEW.current_level >= 99;

        NEW.current_level := NEW.current_level + 1;
        NEW.experience_points := NEW.experience_points - xp_threshold;

        -- Safety: don't go negative
        IF NEW.experience_points < 0 THEN
            NEW.experience_points := 0;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;
