-- Prepared requests spend nothing. Settlement saves ticket, rewards, history and replay together.

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

ALTER TABLE ONLY public.arena_battle_offers ADD CONSTRAINT arena_battle_offers_pkey PRIMARY KEY(id);
ALTER TABLE ONLY public.arena_battle_offers ADD CONSTRAINT arena_battle_offers_user_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.arena_battle_requests ADD CONSTRAINT arena_battle_requests_pkey PRIMARY KEY(id);
ALTER TABLE ONLY public.arena_battle_requests ADD CONSTRAINT arena_battle_requests_user_fkey FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.arena_battle_requests ADD CONSTRAINT arena_battle_requests_offer_fkey FOREIGN KEY(offer_id) REFERENCES public.arena_battle_offers(id);
CREATE INDEX arena_offers_user_expiry ON public.arena_battle_offers(user_id,expires_at);
CREATE INDEX arena_requests_user_settled ON public.arena_battle_requests(user_id,settled_at DESC);
CREATE UNIQUE INDEX arena_one_pending_per_user ON public.arena_battle_requests(user_id) WHERE status='prepared';
CREATE UNIQUE INDEX arena_offer_settled_once ON public.arena_battle_requests(offer_id) WHERE status='settled';

ALTER TABLE public.arena_battle_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_battle_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY arena_offers_read_own ON public.arena_battle_offers FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY arena_requests_read_own ON public.arena_battle_requests FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE OR REPLACE FUNCTION public.prepare_arena_battle(
  p_user_id uuid, p_request_id uuid, p_offer_id uuid,
  p_team_ids uuid[], p_strategies text[]
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_request public.arena_battle_requests%ROWTYPE;
  v_offer public.arena_battle_offers%ROWTYPE; v_team jsonb;
BEGIN
  PERFORM 1 FROM public.profiles WHERE id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  SELECT * INTO v_request FROM public.arena_battle_requests WHERE id=p_request_id;
  IF FOUND THEN
    IF v_request.user_id <> p_user_id THEN RAISE EXCEPTION 'Request belongs to another user' USING ERRCODE='42501'; END IF;
    RETURN to_jsonb(v_request);
  END IF;
  IF p_request_id IS NULL OR cardinality(p_team_ids) IS NULL OR cardinality(p_team_ids) NOT BETWEEN 1 AND 3
    OR cardinality(p_strategies) IS DISTINCT FROM cardinality(p_team_ids)
    OR EXISTS (SELECT 1 FROM unnest(p_strategies) s WHERE s IS NULL OR s NOT IN ('aggressive','balanced','defensive'))
    OR (SELECT count(DISTINCT id) FROM unnest(p_team_ids) id) <> cardinality(p_team_ids) THEN
    RAISE EXCEPTION 'Choose one to three distinct Digimon and their behaviors' USING ERRCODE='22023'; END IF;
  IF EXISTS (SELECT 1 FROM public.arena_battle_requests WHERE user_id=p_user_id AND status='prepared') THEN
    RAISE EXCEPTION 'Resume the existing battle request before starting another'; END IF;
  SELECT * INTO v_offer FROM public.arena_battle_offers WHERE id=p_offer_id AND user_id=p_user_id AND expires_at>now();
  IF NOT FOUND OR EXISTS (SELECT 1 FROM public.arena_battle_requests WHERE offer_id=p_offer_id AND status='settled') THEN
    RAISE EXCEPTION 'Opponent option expired; refresh the arena'; END IF;
  IF (SELECT battle_energy FROM public.profiles WHERE id=p_user_id) < 1 THEN
    RAISE EXCEPTION 'Not enough Battle Tickets. Complete tasks to earn tickets!'; END IF;
  SELECT jsonb_agg(to_jsonb(p) || jsonb_build_object('digimon',to_jsonb(d)) ORDER BY selected.ordinality)
    INTO v_team FROM unnest(p_team_ids) WITH ORDINALITY selected(id,ordinality)
    JOIN public.user_digimon p ON p.id=selected.id AND p.user_id=p_user_id AND p.is_in_storage IS NOT TRUE
    JOIN public.digimon d ON d.id=p.digimon_id;
  IF jsonb_array_length(v_team) IS DISTINCT FROM cardinality(p_team_ids) THEN
    RAISE EXCEPTION 'Selected Digimon must belong to your party' USING ERRCODE='42501'; END IF;
  INSERT INTO public.arena_battle_requests(id,user_id,offer_id,seed,snapshot)
    VALUES(p_request_id,p_user_id,p_offer_id,floor(random()*4294967296)::bigint,
      jsonb_build_object('user_team',v_team,'opponent_team',v_offer.opponent_team,
        'strategies',to_jsonb(p_strategies),'difficulty',v_offer.difficulty,'opponent_name',v_offer.opponent_name))
    RETURNING * INTO v_request;
  RETURN to_jsonb(v_request);
END;
$$;
ALTER FUNCTION public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[]) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.settle_arena_battle(p_user_id uuid,p_request_id uuid,p_replay jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE v_request public.arena_battle_requests%ROWTYPE; v_bits integer; v_battle uuid;
  v_won boolean;
BEGIN
  PERFORM 1 FROM public.profiles WHERE id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  SELECT * INTO v_request FROM public.arena_battle_requests WHERE id=p_request_id AND user_id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Battle request not found' USING ERRCODE='42501'; END IF;
  IF v_request.status='settled' THEN RETURN to_jsonb(v_request); END IF;
  IF p_replay IS NULL OR p_replay->>'winner' IS NULL OR p_replay->>'winner' NOT IN ('user','opponent')
    OR (p_replay->>'version')::integer IS DISTINCT FROM 1
    OR (p_replay->>'engineVersion')::integer IS DISTINCT FROM v_request.engine_version
    OR (p_replay->>'seed')::bigint IS DISTINCT FROM v_request.seed
    OR (p_replay->>'durationMs')::integer IS NULL OR (p_replay->>'durationMs')::integer NOT BETWEEN 16 AND 120000
    OR jsonb_typeof(p_replay->'frames') IS DISTINCT FROM 'array'
    OR jsonb_array_length(p_replay->'frames') NOT BETWEEN 1 AND 1875 THEN
    RAISE EXCEPTION 'Invalid server simulation result' USING ERRCODE='22023'; END IF;
  v_won := p_replay->>'winner'='user';
  v_bits := CASE WHEN v_won THEN CASE v_request.snapshot->>'difficulty'
    WHEN 'hard' THEN 200 WHEN 'medium' THEN 100 ELSE 75 END
    ELSE CASE WHEN v_request.snapshot->>'difficulty'='hard' THEN 40 ELSE 50 END END;
  UPDATE public.profiles SET battle_energy=battle_energy-1 WHERE id=p_user_id AND battle_energy>=1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Not enough Battle Tickets. Complete tasks to earn tickets!'; END IF;
  INSERT INTO public.user_currency(user_id,bits) VALUES(p_user_id,2000+v_bits)
    ON CONFLICT(user_id) DO UPDATE SET bits=public.user_currency.bits+v_bits,updated_at=now();
  -- The existing single battle trigger remains the counter writer.
  INSERT INTO public.team_battles(user_id,winner_id,user_team,opponent_team,turns)
    VALUES(p_user_id,CASE WHEN v_won THEN p_user_id ELSE NULL END,
      v_request.snapshot->'user_team',v_request.snapshot->'opponent_team','[]'::jsonb) RETURNING id INTO v_battle;
  IF v_won THEN UPDATE public.profiles SET last_arena_first_win=(now() AT TIME ZONE 'America/Los_Angeles')::date
    WHERE id=p_user_id; END IF;
  UPDATE public.arena_battle_requests SET status='settled',replay=p_replay,bits_reward=v_bits,
    battle_id=v_battle,settled_at=now() WHERE id=p_request_id RETURNING * INTO v_request;
  RETURN to_jsonb(v_request);
END;
$$;
ALTER FUNCTION public.settle_arena_battle(uuid,uuid,jsonb) OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.arena_battle_context(p_user_id uuid) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
SELECT jsonb_build_object(
  'party',COALESCE((SELECT jsonb_agg(to_jsonb(p)||jsonb_build_object('digimon',to_jsonb(d)))
    FROM public.user_digimon p JOIN public.digimon d ON d.id=p.digimon_id
    WHERE p.user_id=p_user_id AND p.is_in_storage IS NOT TRUE),'[]'::jsonb),
  'offers',COALESCE((SELECT jsonb_agg(to_jsonb(o) ORDER BY difficulty)
    FROM public.arena_battle_offers o WHERE o.user_id=p_user_id AND o.expires_at>now()
    AND o.created_at=(SELECT max(created_at) FROM public.arena_battle_offers WHERE user_id=p_user_id AND expires_at>now())
    AND NOT EXISTS(SELECT 1 FROM public.arena_battle_requests r WHERE r.offer_id=o.id AND r.status='settled')),'[]'::jsonb),
  'pending',(SELECT to_jsonb(r) FROM public.arena_battle_requests r WHERE r.user_id=p_user_id AND r.status='prepared'),
  'latest',(SELECT to_jsonb(r) FROM public.arena_battle_requests r WHERE r.user_id=p_user_id AND r.status='settled'
    ORDER BY r.settled_at DESC LIMIT 1)
);
$$;
ALTER FUNCTION public.arena_battle_context(uuid) OWNER TO postgres;


REVOKE ALL ON public.arena_battle_offers,public.arena_battle_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.arena_battle_offers,public.arena_battle_requests TO authenticated;
GRANT ALL ON public.arena_battle_offers,public.arena_battle_requests TO service_role;
REVOKE ALL ON FUNCTION public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[]) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.settle_arena_battle(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.arena_battle_context(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_arena_battle(uuid,uuid,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.arena_battle_context(uuid) TO service_role;
