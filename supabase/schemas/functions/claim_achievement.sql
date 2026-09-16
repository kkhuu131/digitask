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
