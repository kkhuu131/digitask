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
