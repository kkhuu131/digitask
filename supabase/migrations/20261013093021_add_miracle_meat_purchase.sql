SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.purchase_miracle_meat (
  p_digimon_id   uuid,
  p_expected_abi integer
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog', 'public'
  AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_abi integer;
  v_bits integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF p_expected_abi IS NULL OR p_expected_abi < 0 THEN
    RAISE EXCEPTION 'Supply the current ABI' USING ERRCODE = '22023';
  END IF;
  -- Match existing gameplay's profile-first lock order.
  PERFORM 1 FROM public.profiles WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = '22023';
  END IF;
  SELECT COALESCE(abi, 0) INTO v_abi
  FROM public.user_digimon
  WHERE id = p_digimon_id AND user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Choose one of your own Digimon' USING ERRCODE = '42501';
  END IF;
  IF v_abi <> p_expected_abi THEN
    RAISE EXCEPTION 'ABI changed. Refresh your Digimon before buying again.' USING ERRCODE = '40001';
  END IF;
  UPDATE public.user_currency SET bits = bits - 2500
  WHERE user_id = v_user_id AND bits >= 2500
  RETURNING bits INTO v_bits;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enough Bits to buy Miracle Meat' USING ERRCODE = '22023';
  END IF;
  UPDATE public.user_digimon
  SET abi = v_abi + 5, last_updated_at = now()
  WHERE id = p_digimon_id AND user_id = v_user_id;
  RETURN jsonb_build_object('digimon_id', p_digimon_id, 'abi', v_abi + 5, 'bits', v_bits);
END;
$function$;

REVOKE ALL ON FUNCTION "public"."purchase_miracle_meat"(uuid, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."purchase_miracle_meat"(uuid, integer) TO "authenticated", "postgres", "service_role";
