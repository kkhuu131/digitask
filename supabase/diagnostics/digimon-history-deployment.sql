-- Read-only pre/post deployment checks. No account-specific data is returned.
BEGIN READ ONLY;
SELECT current_database() AS database_name,
  to_regclass('public.user_digimon_history') IS NOT NULL AS history_installed,
  (SELECT count(*) FROM public.user_digimon) AS pet_count,
  (SELECT count(*) FROM public.user_digimon pet LEFT JOIN public.digimon species
    ON species.id=pet.digimon_id WHERE species.id IS NULL) AS missing_species;
SELECT tgname, pg_get_triggerdef(oid) AS definition
FROM pg_trigger WHERE tgrelid='public.user_digimon'::regclass AND NOT tgisinternal
ORDER BY tgname;
DO $$ BEGIN
  IF to_regclass('public.user_digimon_history') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.user_digimon pet WHERE NOT EXISTS (
      SELECT 1 FROM public.user_digimon_history h WHERE h.user_digimon_id=pet.id AND h.is_starting_point)) THEN
      RAISE EXCEPTION 'Pet missing history starting point'; END IF;
    IF EXISTS (SELECT 1 FROM public.user_digimon pet WHERE pet.digimon_id IS DISTINCT FROM (
      SELECT h.digimon_id FROM public.user_digimon_history h WHERE h.user_digimon_id=pet.id ORDER BY h.id DESC LIMIT 1)) THEN
      RAISE EXCEPTION 'Latest history differs from current species'; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.user_digimon'::regclass
      AND tgname='record_digimon_history_trigger' AND tgenabled='O') THEN
      RAISE EXCEPTION 'History trigger missing or disabled'; END IF;
    IF has_table_privilege('authenticated','public.user_digimon_history','INSERT,UPDATE,DELETE') OR
      has_table_privilege('anon','public.user_digimon_history','INSERT,UPDATE,DELETE') OR
      has_function_privilege('authenticated','public.record_digimon_history()','EXECUTE') OR
      has_function_privilege('anon','public.record_digimon_history()','EXECUTE') THEN
      RAISE EXCEPTION 'Browser history write permissions detected'; END IF;
  END IF;
END $$;
SELECT jsonb_build_object(
  'history_installed', to_regclass('public.user_digimon_history') IS NOT NULL,
  'pet_count', (SELECT count(*) FROM public.user_digimon),
  'missing_species', (SELECT count(*) FROM public.user_digimon pet LEFT JOIN public.digimon species
    ON species.id=pet.digimon_id WHERE species.id IS NULL),
  'history_trigger_count', (SELECT count(*) FROM pg_trigger WHERE tgrelid='public.user_digimon'::regclass
    AND tgname='record_digimon_history_trigger' AND tgenabled='O'),
  'migration_recorded', EXISTS (SELECT 1 FROM supabase_migrations.schema_migrations WHERE version='20260918184219')
) AS deployment_check;
COMMIT;
