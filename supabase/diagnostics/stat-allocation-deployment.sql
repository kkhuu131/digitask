-- Read-only pre/post deployment check; contains no account-specific data.
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS arguments,
  ARRAY(SELECT version FROM supabase_migrations.schema_migrations
    WHERE version IN ('20260921230037', '20261010185632') ORDER BY version) AS relevant_migrations,
  p.prosecdef AS security_definer, p.proconfig AS settings,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_execute,
  md5(replace(p.prosrc, chr(13) || chr(10), chr(10))) AS body_hash
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('allocate_stat', 'allocate_stats', 'prepare_arena_battle', 'settle_arena_battle')
ORDER BY p.proname, arguments;
