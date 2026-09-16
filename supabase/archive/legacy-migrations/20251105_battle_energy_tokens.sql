-- Battle Energy and Tokens + First Win-of-Day

-- 1) Extend profiles with battle energy/tokens
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS battle_energy integer NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS max_battle_energy integer NOT NULL DEFAULT 100;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS battle_tokens integer NOT NULL DEFAULT 0;

-- Track when the user last received the Arena first-win-of-day
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_arena_first_win date;

-- 2) RPC: grant_energy(p_user_id uuid, p_amount int)
CREATE OR REPLACE FUNCTION public.grant_energy(p_user_id uuid, p_amount integer)
RETURNS TABLE (battle_energy integer, max_battle_energy integer) AS $$
BEGIN
  UPDATE public.profiles
  SET battle_energy = LEAST(max_battle_energy, COALESCE(battle_energy,0) + GREATEST(0, p_amount))
  WHERE id = p_user_id;

  RETURN QUERY
  SELECT battle_energy, max_battle_energy FROM public.profiles WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2a) Self-scoped variants that rely on RLS (no user_id param)
CREATE OR REPLACE FUNCTION public.grant_energy_self(p_amount integer)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles p
  SET battle_energy = LEAST(p.max_battle_energy, COALESCE(p.battle_energy,0) + GREATEST(0, p_amount))
  WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 3) RPC: spend_energy(p_user_id uuid, p_amount int) -> boolean
CREATE OR REPLACE FUNCTION public.spend_energy(p_user_id uuid, p_amount integer)
RETURNS boolean AS $$
DECLARE
  v_energy integer;
BEGIN
  SELECT battle_energy INTO v_energy FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF v_energy IS NULL OR v_energy < p_amount OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET battle_energy = v_energy - p_amount
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.spend_energy_self(p_amount integer)
RETURNS boolean AS $$
DECLARE
  v_energy integer;
BEGIN
  SELECT battle_energy INTO v_energy FROM public.profiles WHERE id = auth.uid() FOR UPDATE;

  IF v_energy IS NULL OR v_energy < p_amount OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET battle_energy = v_energy - p_amount
  WHERE id = auth.uid();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 4) RPC: add_tokens(p_user_id uuid, p_amount int) -> integer (new balance)
CREATE OR REPLACE FUNCTION public.add_tokens(p_user_id uuid, p_amount integer)
RETURNS integer AS $$
DECLARE
  v_tokens integer;
BEGIN
  UPDATE public.profiles
  SET battle_tokens = COALESCE(battle_tokens,0) + GREATEST(0, p_amount)
  WHERE id = p_user_id;

  SELECT battle_tokens INTO v_tokens FROM public.profiles WHERE id = p_user_id;
  RETURN v_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.add_tokens_self(p_amount integer)
RETURNS integer AS $$
DECLARE
  v_tokens integer;
BEGIN
  UPDATE public.profiles
  SET battle_tokens = COALESCE(battle_tokens,0) + GREATEST(0, p_amount)
  WHERE id = auth.uid();

  SELECT battle_tokens INTO v_tokens FROM public.profiles WHERE id = auth.uid();
  RETURN v_tokens;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 5) RPC: spend_tokens(p_user_id uuid, p_amount int) -> boolean
CREATE OR REPLACE FUNCTION public.spend_tokens(p_user_id uuid, p_amount integer)
RETURNS boolean AS $$
DECLARE
  v_tokens integer;
BEGIN
  SELECT battle_tokens INTO v_tokens FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF v_tokens IS NULL OR v_tokens < p_amount OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET battle_tokens = v_tokens - p_amount
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_and_set_first_win_self()
RETURNS boolean AS $$
DECLARE
  v_last date;
  v_today date := (now() AT TIME ZONE 'America/Los_Angeles')::date;
BEGIN
  SELECT last_arena_first_win INTO v_last FROM public.profiles WHERE id = auth.uid() FOR UPDATE;

  IF v_last IS DISTINCT FROM v_today THEN
    UPDATE public.profiles SET last_arena_first_win = v_today WHERE id = auth.uid();
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION public.grant_energy_self(integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.spend_energy_self(integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_tokens_self(integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_and_set_first_win_self() TO authenticated, anon;

-- 6) RPC: check_and_set_first_win(p_user_id uuid) -> boolean
-- Returns TRUE if first win bonus applies now (and sets last_arena_first_win to today)
CREATE OR REPLACE FUNCTION public.check_and_set_first_win(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_last date;
  v_today date := (now() AT TIME ZONE 'America/Los_Angeles')::date;
BEGIN
  SELECT last_arena_first_win INTO v_last FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF v_last IS DISTINCT FROM v_today THEN
    UPDATE public.profiles SET last_arena_first_win = v_today WHERE id = p_user_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


