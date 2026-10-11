SET local check_function_bodies = off;

DROP FUNCTION "public"."prepare_arena_battle"(uuid, uuid, uuid, uuid[], text[], integer);

ALTER TABLE "public"."arena_battle_requests"
  ALTER COLUMN "engine_version" SET DEFAULT 3;

CREATE OR REPLACE FUNCTION public.prepare_arena_battle (
  p_user_id        uuid,
  p_request_id     uuid,
  p_offer_id       uuid,
  p_team_ids       uuid[],
  p_strategies     text[],
  p_engine_version integer DEFAULT 3
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog', 'public'
  AS $function$
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
  IF p_engine_version NOT IN (1, 2, 3) THEN
    RAISE EXCEPTION 'Unsupported arena engine version' USING ERRCODE='22023'; END IF;
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
  INSERT INTO public.arena_battle_requests(id,user_id,offer_id,seed,snapshot,engine_version)
    VALUES(p_request_id,p_user_id,p_offer_id,floor(random()*4294967296)::bigint,
      jsonb_build_object('user_team',v_team,'opponent_team',v_offer.opponent_team,
        'strategies',to_jsonb(p_strategies),'difficulty',v_offer.difficulty,'opponent_name',v_offer.opponent_name),
      p_engine_version)
    RETURNING * INTO v_request;
  RETURN to_jsonb(v_request);
END;
$function$;

CREATE OR REPLACE FUNCTION public.settle_arena_battle (
  p_user_id    uuid,
  p_request_id uuid,
  p_replay     jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog', 'public'
  AS $function$
DECLARE v_request public.arena_battle_requests%ROWTYPE; v_bits integer; v_battle uuid;
  v_won boolean;
BEGIN
  PERFORM 1 FROM public.profiles WHERE id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  SELECT * INTO v_request FROM public.arena_battle_requests WHERE id=p_request_id AND user_id=p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Battle request not found' USING ERRCODE='42501'; END IF;
  IF v_request.status='settled' THEN RETURN to_jsonb(v_request); END IF;
  IF p_replay IS NULL OR p_replay->>'winner' IS NULL OR p_replay->>'winner' NOT IN ('user','opponent')
    OR (p_replay->>'version')::integer IS DISTINCT FROM
      (CASE WHEN v_request.engine_version = 1 THEN 1 ELSE 2 END)
    OR (p_replay->>'engineVersion')::integer IS DISTINCT FROM v_request.engine_version
    OR (p_replay->>'seed')::bigint IS DISTINCT FROM v_request.seed
    OR (p_replay->>'durationMs')::integer IS NULL OR (p_replay->>'durationMs')::integer NOT BETWEEN 16 AND 120000
    OR jsonb_typeof(p_replay->'frames') IS DISTINCT FROM 'array'
    OR jsonb_array_length(p_replay->'frames') NOT BETWEEN 1 AND 4000 THEN
    RAISE EXCEPTION 'Invalid server simulation result' USING ERRCODE='22023'; END IF;
  v_won := p_replay->>'winner'='user';
  v_bits := CASE WHEN v_won THEN CASE v_request.snapshot->>'difficulty'
    WHEN 'hard' THEN 300 WHEN 'medium' THEN 200 ELSE 100 END
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
$function$;

REVOKE ALL ON FUNCTION "public"."prepare_arena_battle"(uuid, uuid, uuid, uuid[], text[], integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."prepare_arena_battle"(uuid, uuid, uuid, uuid[], text[], integer) TO "postgres", "service_role";
