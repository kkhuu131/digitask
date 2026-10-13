-- Local-only fixtures: ownership, price, ABI increment, stale retries and rollback.
BEGIN;
INSERT INTO auth.users (id, email) VALUES
 ('00000000-0000-4000-8000-000000000141', 'meat-owner@example.invalid'),
 ('00000000-0000-4000-8000-000000000142', 'meat-other@example.invalid');
INSERT INTO public.profiles (id, username) VALUES
 ('00000000-0000-4000-8000-000000000141', 'meat-owner'),
 ('00000000-0000-4000-8000-000000000142', 'meat-other');
INSERT INTO public.user_currency (user_id, bits) VALUES
 ('00000000-0000-4000-8000-000000000141', 10000);
INSERT INTO public.user_digimon (id, user_id, digimon_id, name, is_active, is_in_storage, abi) VALUES
 ('00000000-0000-4000-8000-000000014101', '00000000-0000-4000-8000-000000000141', 1, 'storage', false, true, NULL),
 ('00000000-0000-4000-8000-000000014102', '00000000-0000-4000-8000-000000000141', 1, 'active', true, false, 10),
 ('00000000-0000-4000-8000-000000014201', '00000000-0000-4000-8000-000000000142', 1, 'foreign', false, false, 0);
DO $$ BEGIN
 IF has_function_privilege('anon', 'public.purchase_miracle_meat(uuid,integer)', 'EXECUTE')
   OR NOT has_function_privilege('authenticated', 'public.purchase_miracle_meat(uuid,integer)', 'EXECUTE') THEN
   RAISE EXCEPTION 'Miracle Meat RPC permissions are incorrect';
 END IF;
 PERFORM set_config('request.jwt.claim.sub', '', true);
 BEGIN
   PERFORM public.purchase_miracle_meat('00000000-0000-4000-8000-000000014101', 0);
   RAISE EXCEPTION 'Unauthenticated purchase accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END; $$;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000141', true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb;
BEGIN
 BEGIN
   PERFORM public.purchase_miracle_meat('00000000-0000-4000-8000-000000014201', 0);
   RAISE EXCEPTION 'Foreign Digimon purchase accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   PERFORM public.purchase_miracle_meat('00000000-0000-4000-8000-000000014101', NULL);
   RAISE EXCEPTION 'Missing expected ABI accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 r := public.purchase_miracle_meat('00000000-0000-4000-8000-000000014101', 0);
 IF (r->>'abi')::integer <> 5 OR (r->>'bits')::integer <> 7500
   OR r->>'digimon_id' <> '00000000-0000-4000-8000-000000014101'
   OR (SELECT abi FROM public.user_digimon WHERE id='00000000-0000-4000-8000-000000014101') <> 5
   OR (SELECT abi FROM public.user_digimon WHERE id='00000000-0000-4000-8000-000000014102') <> 10 THEN
   RAISE EXCEPTION 'Purchase must cost 2500 Bits and add 5 ABI to selected storage pet only';
 END IF;
 BEGIN
   PERFORM public.purchase_miracle_meat('00000000-0000-4000-8000-000000014101', 0);
   RAISE EXCEPTION 'Stale purchase accepted';
 EXCEPTION WHEN serialization_failure THEN NULL; END;
 IF (SELECT bits FROM public.user_currency WHERE user_id=auth.uid()) <> 7500 THEN
   RAISE EXCEPTION 'Stale purchase spent Bits';
 END IF;
 r := public.purchase_miracle_meat('00000000-0000-4000-8000-000000014101', 5);
 IF (r->>'abi')::integer <> 10 OR (r->>'bits')::integer <> 5000 THEN
   RAISE EXCEPTION 'Second deliberate purchase incorrect';
 END IF;
END; $$;
RESET ROLE;
CREATE FUNCTION pg_temp.reject_meat_abi() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.abi > COALESCE(OLD.abi, 0) THEN RAISE EXCEPTION 'Injected ABI failure'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER reject_meat_abi BEFORE UPDATE ON public.user_digimon
FOR EACH ROW EXECUTE FUNCTION pg_temp.reject_meat_abi();
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN
   PERFORM public.purchase_miracle_meat('00000000-0000-4000-8000-000000014102', 10);
   RAISE EXCEPTION 'Injected failure swallowed';
 EXCEPTION WHEN raise_exception THEN
   IF SQLERRM <> 'Injected ABI failure' THEN RAISE; END IF;
 END;
 IF (SELECT bits FROM public.user_currency WHERE user_id=auth.uid()) <> 5000
   OR (SELECT abi FROM public.user_digimon WHERE id='00000000-0000-4000-8000-000000014102') <> 10 THEN
   RAISE EXCEPTION 'Failed ABI update retained payment or partial effect';
 END IF;
END; $$;
RESET ROLE;
DROP TRIGGER reject_meat_abi ON public.user_digimon;
UPDATE public.user_currency SET bits=2499 WHERE user_id='00000000-0000-4000-8000-000000000141';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 BEGIN
   PERFORM public.purchase_miracle_meat('00000000-0000-4000-8000-000000014102', 10);
   RAISE EXCEPTION 'Insufficient balance accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 IF (SELECT bits FROM public.user_currency WHERE user_id=auth.uid()) <> 2499
   OR (SELECT abi FROM public.user_digimon WHERE id='00000000-0000-4000-8000-000000014102') <> 10 THEN
   RAISE EXCEPTION 'Insufficient balance purchase modified rewards';
 END IF;
END; $$;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000142', true);
DO $$ BEGIN
 BEGIN
   PERFORM public.purchase_miracle_meat('00000000-0000-4000-8000-000000014201', 0);
   RAISE EXCEPTION 'Missing currency balance accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END; $$;
RESET ROLE;
ROLLBACK;
SELECT 'Miracle Meat ownership, payment, selected ABI, retry and rollback checks passed' AS result;
