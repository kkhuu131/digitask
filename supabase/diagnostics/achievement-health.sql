-- Read-only checks; account-specific diagnostics should be ignored *.local.sql files.
SELECT jsonb_build_object(
  'missing_discoveries', (SELECT count(*) FROM (
    SELECT DISTINCT p.user_id,p.digimon_id FROM public.user_digimon p
    WHERE NOT EXISTS (SELECT 1 FROM public.user_discovered_digimon d
      WHERE d.user_id=p.user_id AND d.digimon_id=p.digimon_id)) missing),
  'catalog_ids', (SELECT jsonb_agg(id ORDER BY id) FROM public.titles)
) AS health;
