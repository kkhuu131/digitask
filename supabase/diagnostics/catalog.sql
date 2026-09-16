-- Read-only inventory. Output can include scheduled-job commands; keep raw results private.
BEGIN READ ONLY;

SELECT jsonb_build_object(
  'server_version', current_setting('server_version'),
  'migrations', (SELECT jsonb_agg(jsonb_build_object(
    'version', version, 'name', name, 'statements', statements
  ) ORDER BY version) FROM supabase_migrations.schema_migrations),
  'cron_jobs', (SELECT jsonb_agg(jsonb_build_object(
    'jobid', jobid, 'jobname', jobname, 'schedule', schedule,
    'command', command, 'active', active
  ) ORDER BY jobid) FROM cron.job),
  'cron_runs_last_week', (SELECT jsonb_agg(to_jsonb(r)) FROM (
    SELECT jobid, status, count(*) AS runs, max(start_time) AS latest_run
    FROM cron.job_run_details
    WHERE start_time > now() - interval '7 days'
    GROUP BY jobid, status ORDER BY jobid, status
  ) r),
  'tables', (SELECT jsonb_agg(to_jsonb(r)) FROM (
    SELECT relname AS name, n_live_tup AS approximate_rows,
      seq_scan, idx_scan, last_analyze, last_autoanalyze
    FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY relname
  ) r),
  'functions', (SELECT jsonb_agg(to_jsonb(r)) FROM (
    SELECT p.proname AS name, pg_get_function_identity_arguments(p.oid) AS arguments,
      pg_get_function_result(p.oid) AS result, p.prosecdef AS security_definer,
      p.proconfig AS settings,
      has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' ORDER BY p.proname, p.oid
  ) r),
  'managed_schema_public_triggers', (SELECT jsonb_agg(to_jsonb(r)) FROM (
    SELECT n.nspname AS schema, c.relname AS table_name, t.tgname AS trigger_name,
      pg_get_triggerdef(t.oid) AS definition
    FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace pn ON pn.oid = p.pronamespace
    WHERE NOT t.tgisinternal AND n.nspname IN ('auth', 'storage') AND pn.nspname = 'public'
    ORDER BY n.nspname, c.relname, t.tgname
  ) r),
  'publications', (SELECT jsonb_agg(to_jsonb(r)) FROM (
    SELECT pubname, schemaname, tablename FROM pg_publication_tables
    WHERE schemaname = 'public' ORDER BY pubname, tablename
  ) r),
  'extensions', (SELECT jsonb_agg(to_jsonb(r)) FROM (
    SELECT e.extname, e.extversion, n.nspname AS schema
    FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace ORDER BY e.extname
  ) r),
  'public_object_dependencies', (SELECT jsonb_agg(to_jsonb(r)) FROM (
    SELECT pg_describe_object(d.classid, d.objid, d.objsubid) AS dependent,
      pg_describe_object(d.refclassid, d.refobjid, d.refobjsubid) AS referenced,
      d.deptype
    FROM pg_depend d
    WHERE (d.refclassid = 'pg_proc'::regclass AND d.refobjid IN (
      SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
    )) OR (d.refclassid = 'pg_class'::regclass AND d.refobjid IN (
      SELECT c.oid FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'v', 'm')
    ))
  ) r)
) AS inventory;

COMMIT;
