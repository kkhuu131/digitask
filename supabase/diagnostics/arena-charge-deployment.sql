-- Read-only release checks, without account-specific rows or credentials.
SELECT jsonb_build_object(
  'engine_default', (SELECT pg_get_expr(d.adbin,d.adrelid)
    FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum
    WHERE d.adrelid='public.arena_battle_requests'::regclass AND a.attname='engine_version'),
  'prepare_arguments', pg_get_function_arguments('public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[],integer)'::regprocedure),
  'functions', (SELECT jsonb_agg(jsonb_build_object(
    'name',p.proname,'body_hash',md5(replace(p.prosrc,chr(13),'')),
    'security_definer',p.prosecdef,'settings',p.proconfig,
    'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),
    'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),
    'service_execute',has_function_privilege('service_role',p.oid,'EXECUTE')) ORDER BY p.proname)
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN ('prepare_arena_battle','settle_arena_battle')),
  'request_counts', (SELECT jsonb_agg(counts) FROM
    (SELECT engine_version,status,count(*) FROM public.arena_battle_requests GROUP BY engine_version,status) counts)
) AS arena_charge_release;
