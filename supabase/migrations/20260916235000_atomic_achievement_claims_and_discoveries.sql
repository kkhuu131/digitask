-- Rewards are server-owned; claims and discovery records commit together.
ALTER TABLE public.titles ADD COLUMN reward_bits integer NOT NULL DEFAULT 0 CHECK (reward_bits >= 0), ADD COLUMN reward_digimon_ids integer[] NOT NULL DEFAULT ARRAY[]::integer[];
-- Achievement catalog mirrored from src/constants/titles.ts. Keep rewards synchronized.
INSERT INTO public.titles (id,name,description,category,requirement_type,requirement_value,reward_bits,reward_digimon_ids) VALUES
(1,'Digital Rookie','Completed Stage 10 of the Campaign','campaign','campaign_stage','10',0,ARRAY[]::integer[]),
(2,'Island Explorer','Defeated Devimon and cleansed the File Island.','campaign','campaign_stage','20',200,ARRAY[]::integer[]),
(3,'Vampire Hunter','Defeated the resurrected Myotismon.','campaign','campaign_stage','30',500,ARRAY[18,19,23,24,26]::integer[]),
(4,'Master of the Spiral','Conquered all four Dark Masters.','campaign','campaign_stage','46',1000,ARRAY[19,23,24,26,30,32,33,36,41,44,45,47,49,51,55]::integer[]),
(5,'DigiDestined','Defeated the final boss, Apocalymon.','campaign','campaign_stage','60',2000,ARRAY[18,21,27,29,34,39,46,50,23,24,32,47,48,53,54]::integer[]),
(6,'Seven Deadly Sins','Defeated all Seven Great Demon Lords.','campaign','campaign_stage','70',2500,ARRAY[66,68,70,71,72,75,76,77,78,79,80,81,82,83]::integer[]),
(7,'Royal Challenger','Defeated and gained the trust of the Royal Knights.','campaign','campaign_stage','80',3000,ARRAY[66,68,70,71,72,75,76,77,78,79,80,81,82,83]::integer[]),
(8,'Multiversal Tamer','Survived the Space Time Distortion.','campaign','campaign_stage','56',2000,ARRAY[66,68,70,71,72,75,76,77,78,79,80,81,82,83]::integer[]),
(101,'Digimon Fan','Discovered 50 different Digimon','collection','digimon_count','50',200,ARRAY[]::integer[]),
(102,'Digimon Researcher','Discovered 100 different Digimon','collection','digimon_count','100',500,ARRAY[]::integer[]),
(103,'Digimon Professor','Discovered 200 different Digimon','collection','digimon_count','200',1000,ARRAY[]::integer[]),
(104,'Digimon Master','Discovered 300 different Digimon','collection','digimon_count','300',2000,ARRAY[]::integer[]),
(201,'Ultimate Tamer','Evolved a Digimon to Ultimate stage','evolution','digimon_stage','Ultimate',300,ARRAY[]::integer[]),
(202,'Mega Tamer','Evolved a Digimon to Mega stage','evolution','digimon_stage','Mega',500,ARRAY[7,8,9,10,11,12]::integer[]),
(203,'Ultra Tamer','Evolved a Digimon to Ultra stage','evolution','digimon_stage','Ultra',1000,ARRAY[18,19,23,24,26]::integer[]),
(301,'Battle Novice','Won 10 arena battles.','battle','battle_wins','10',0,ARRAY[18,19,23,24,26]::integer[]),
(302,'Battle Expert','Won 50 arena battles.','battle','battle_wins','50',300,ARRAY[18,19,23,24,26]::integer[]),
(303,'Battle Master','Won 200 team battles.','battle','battle_wins','200',750,ARRAY[19,23,24,26,30,32,33,36,41,44,45,47,49,51,55]::integer[]),
(304,'Battle Champion','Won 1000 arena battles.','battle','battle_wins','1000',2000,ARRAY[66,68,70,71,72,75,76,77,78,79,80,81,82,83]::integer[]),
(400,'Getting Started','Completed 1 Daily Quota.','streak','longest_streak','1',100,ARRAY[]::integer[]),
(401,'In Training','Maintained a 3 day streak.','streak','longest_streak','3',150,ARRAY[]::integer[]),
(402,'Routine Rookie','Maintained a 7 day streak.','streak','longest_streak','7',200,ARRAY[1,2,3,4,5]::integer[]),
(403,'Champion Flow','Maintained a 14 day streak.','streak','longest_streak','14',300,ARRAY[7,8,9,10,11,12]::integer[]),
(404,'Ultimate Bond','Maintained a 31 day streak.','streak','longest_streak','31',500,ARRAY[7,8,9,10,11,12]::integer[]),
(405,'Crest Ignited','Maintained a 50 day streak.','streak','longest_streak','50',750,ARRAY[18,19,23,24,26]::integer[]),
(406,'Digivolved','Maintained a 75 day streak.','streak','longest_streak','75',1000,ARRAY[19,23,24,26,30,32,33,36,41,44,45,47,49,51,55]::integer[]),
(407,'Perfect Partner','Maintained a 100 day streak.','streak','longest_streak','100',2000,ARRAY[18,21,27,29,34,39,46,50,23,24,32,47,48,53,54]::integer[]),
(408,'Digitask Adventure','Maintained a 365 day streak. One full year!','streak','longest_streak','365',5000,ARRAY[66,68,70,71,72,75,76,77,78,79,80,81,82,83]::integer[]),
(501,'First Steps','Completed your very first task.','tasks','tasks_completed','1',100,ARRAY[]::integer[]),
(502,'Getting the Hang of It','Completed 10 tasks.','tasks','tasks_completed','10',200,ARRAY[]::integer[]),
(503,'Committed','Completed 25 tasks.','tasks','tasks_completed','25',300,ARRAY[1,2,3,4,5]::integer[]),
(504,'Task Apprentice','Completed 50 tasks.','tasks','tasks_completed','50',500,ARRAY[7,8,9,10,11,12]::integer[]),
(505,'Task Adept','Completed 100 tasks.','tasks','tasks_completed','100',750,ARRAY[18,19,23,24,26]::integer[]),
(506,'Task Master','Completed 250 tasks.','tasks','tasks_completed','250',1000,ARRAY[19,23,24,26,30,32,33,36,41,44,45,47,49,51,55]::integer[]),
(507,'Digital Legend','Completed 500 tasks.','tasks','tasks_completed','500',1500,ARRAY[18,21,27,29,34,39,46,50,23,24,32,47,48,53,54]::integer[]),
(508,'One Thousand Tasks','Completed 1000 tasks. You are a true Tamer.','tasks','tasks_completed','1000',3000,ARRAY[66,68,70,71,72,75,76,77,78,79,80,81,82,83]::integer[])
ON CONFLICT (id) DO UPDATE SET reward_bits=EXCLUDED.reward_bits,reward_digimon_ids=EXCLUDED.reward_digimon_ids;

CREATE OR REPLACE FUNCTION public.record_digimon_discovery() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  INSERT INTO public.user_discovered_digimon (user_id, digimon_id)
  VALUES (NEW.user_id, NEW.digimon_id)
  ON CONFLICT (user_id, digimon_id) DO NOTHING;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.record_digimon_discovery() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.claim_achievement(p_user_title_id integer, p_digimon_id integer DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_claim public.user_titles%ROWTYPE;
  v_title public.titles%ROWTYPE;
  v_pet uuid;
  v_storage boolean := false;
  v_claimed_at timestamptz;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in to claim achievements' USING ERRCODE = '42501'; END IF;
  -- Consistent lock order with task rewards; serialize this user's claims and party counts.
  PERFORM 1 FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'User profile not found'; END IF;
  SELECT * INTO v_claim FROM public.user_titles
    WHERE id = p_user_title_id AND user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Achievement not earned by this user' USING ERRCODE = '42501'; END IF;
  IF v_claim.claimed_at IS NOT NULL THEN
    RETURN jsonb_build_object('claimed', false, 'claimed_at', v_claim.claimed_at);
  END IF;
  SELECT * INTO STRICT v_title FROM public.titles WHERE id = v_claim.title_id;
  IF cardinality(v_title.reward_digimon_ids) > 0 THEN
    IF p_digimon_id IS NULL OR NOT (p_digimon_id = ANY(v_title.reward_digimon_ids)) THEN
      RAISE EXCEPTION 'Choose a Digimon from this achievement reward pool' USING ERRCODE = '22023';
    END IF;
  ELSIF p_digimon_id IS NOT NULL THEN
    RAISE EXCEPTION 'This achievement has no DigiEgg reward' USING ERRCODE = '22023';
  END IF;
  IF v_title.reward_bits > 0 THEN
    INSERT INTO public.user_currency (user_id, bits) VALUES (v_user, 2000 + v_title.reward_bits)
    ON CONFLICT (user_id) DO UPDATE SET bits = public.user_currency.bits + v_title.reward_bits, updated_at = now();
  END IF;
  IF p_digimon_id IS NOT NULL THEN
    SELECT count(*) >= 9 INTO v_storage FROM public.user_digimon
      WHERE user_id = v_user AND is_in_storage IS NOT TRUE;
    INSERT INTO public.user_digimon (user_id, digimon_id, name, happiness, is_active, is_in_storage)
      VALUES (v_user, p_digimon_id, '', 100, false, v_storage) RETURNING id INTO v_pet;
  END IF;
  v_claimed_at := clock_timestamp();
  UPDATE public.user_titles SET claimed_at = v_claimed_at WHERE id = v_claim.id;
  RETURN jsonb_build_object('claimed', true, 'claimed_at', v_claimed_at,
    'bits', v_title.reward_bits, 'digimon_id', v_pet, 'is_in_storage', v_storage);
END;
$$;
ALTER FUNCTION public.claim_achievement(integer, integer) OWNER TO postgres;

CREATE OR REPLACE TRIGGER record_digimon_discovery_trigger AFTER INSERT OR UPDATE OF digimon_id, user_id ON public.user_digimon FOR EACH ROW EXECUTE FUNCTION public.record_digimon_discovery();
REVOKE ALL ON FUNCTION public.record_digimon_discovery() FROM PUBLIC, anon, authenticated;
GRANT ALL ON FUNCTION public.record_digimon_discovery() TO service_role;
REVOKE ALL ON FUNCTION public.claim_achievement(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_achievement(integer, integer) TO authenticated, service_role;
REVOKE INSERT, UPDATE ON public.user_titles FROM anon, authenticated;
GRANT INSERT (user_id, title_id) ON public.user_titles TO authenticated;
GRANT UPDATE (is_displayed) ON public.user_titles TO authenticated;

-- Repair missing discoveries only for species users currently own; preserve existing timestamps.
INSERT INTO public.user_discovered_digimon (user_id, digimon_id)
SELECT DISTINCT user_id, digimon_id FROM public.user_digimon
ON CONFLICT (user_id, digimon_id) DO NOTHING;
