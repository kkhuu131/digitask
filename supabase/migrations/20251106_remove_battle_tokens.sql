-- Remove Battle Tokens - Using Bits instead from user_currency table

-- 1) Drop token-related RPC functions
DROP FUNCTION IF EXISTS public.add_tokens(uuid, integer);
DROP FUNCTION IF EXISTS public.add_tokens_self(integer);
DROP FUNCTION IF EXISTS public.spend_tokens(uuid, integer);
DROP FUNCTION IF EXISTS public.spend_tokens_self(integer);

-- 2) Remove battle_tokens column from profiles
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS battle_tokens;

