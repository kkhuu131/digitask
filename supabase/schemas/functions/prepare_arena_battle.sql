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
