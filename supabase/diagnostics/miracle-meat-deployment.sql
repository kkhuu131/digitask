-- Read-only verification; never buys an item or reads account data.
SELECT
  EXISTS (SELECT 1 FROM supabase_migrations.schema_migrations
    WHERE version = '20261013093021') AS migration_applied,
  NOT has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_blocked,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_allowed,
  p.prosecdef AS security_definer,
  p.proconfig AS settings,
  position('bits = bits - 2500' IN p.prosrc) > 0 AS price_2500,
  position('SET abi = v_abi + 5' IN p.prosrc) > 0 AS abi_plus_5,
  position('v_abi <> p_expected_abi' IN p.prosrc) > 0 AS stale_retry_guard,
  position('WHERE id = p_digimon_id AND user_id = v_user_id FOR UPDATE' IN p.prosrc) > 0 AS ownership_lock,
  md5(replace(p.prosrc, chr(13) || chr(10), chr(10))) AS body_hash
FROM pg_proc p
WHERE p.oid = 'public.purchase_miracle_meat(uuid, integer)'::regprocedure;
