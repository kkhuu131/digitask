-- Read-only release verification; no account-specific data or reward writes.
SELECT version FROM supabase_migrations.schema_migrations
WHERE version IN ('20261010225044', '20261010225306', '20261010225953') ORDER BY version;

SELECT p.proname AS name,
  md5(replace(p.prosrc, chr(13) || chr(10), chr(10))) AS body_hash,
  p.prosecdef AS security_definer, p.proconfig AS settings,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
  obj_description(p.oid, 'pg_proc') AS description
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('complete_task_all_triggers', 'level_up_digimon')
ORDER BY p.proname;

SELECT count(*) AS enabled_level_writers FROM pg_trigger
WHERE tgfoid = 'public.level_up_digimon()'::regprocedure
  AND NOT tgisinternal AND tgenabled <> 'D';
