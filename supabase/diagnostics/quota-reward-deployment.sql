-- Read-only release verification: no account data or reward writes.
SELECT
  EXISTS (SELECT 1 FROM supabase_migrations.schema_migrations
    WHERE version = '20261013090108') AS migration_applied,
  position('v_quota_bonus_exp := ROUND(500 * v_exp_multiplier);' IN p.prosrc) > 0 AS base_500,
  position('LEAST(1.0 + (v_daily_quota.current_streak - 1) * 0.1, 2.0)' IN p.prosrc) > 0 AS streak_cap_2x,
  position('experience_points + v_reserve_exp + v_quota_bonus_exp' IN p.prosrc) > 0 AS full_party_bonus,
  position('COALESCE(is_in_storage, false) = false' IN p.prosrc) > 0 AS storage_excluded,
  NOT has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_blocked,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_allowed,
  p.prosecdef AS security_definer,
  p.proconfig AS settings,
  md5(replace(p.prosrc, chr(13) || chr(10), chr(10))) AS body_hash
FROM pg_proc p
WHERE p.oid = 'public.complete_task_all_triggers(uuid, uuid, boolean)'::regprocedure;
