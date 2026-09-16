-- Read-only comparison; line endings inside older stored bodies are normalized.
SELECT p.proname AS name, pg_get_function_identity_arguments(p.oid) AS arguments,
  md5(replace(p.prosrc, chr(13) || chr(10), chr(10))) AS body_hash,
  md5(p.prosrc) AS raw_body_hash, p.prosecdef AS security_definer,
  p.proconfig AS settings, p.provolatile AS volatility,
  p.proacl::text AS privileges, p.procost AS cost, p.prorows AS rows,
  p.proisstrict AS strict, p.proparallel AS parallel
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' ORDER BY p.proname, arguments;
