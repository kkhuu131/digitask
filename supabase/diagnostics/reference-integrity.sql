-- Read-only smoke check: required game catalog data must work on a fresh database.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.digimon)
    OR NOT EXISTS (SELECT 1 FROM public.evolution_paths)
    OR NOT EXISTS (SELECT 1 FROM public.digimon_forms)
    OR NOT EXISTS (SELECT 1 FROM public.titles) THEN
    RAISE EXCEPTION 'Required game reference data is missing';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.evolution_paths e
    LEFT JOIN public.digimon source ON source.id = e.from_digimon_id
    LEFT JOIN public.digimon target ON target.id = e.to_digimon_id
    WHERE source.id IS NULL OR target.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Evolution paths reference missing species';
  END IF;
  IF EXISTS (
    SELECT 1 FROM generate_series(1, 5) starter_id
    LEFT JOIN public.digimon d ON d.id = starter_id
    WHERE d.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Onboarding starter species are missing';
  END IF;
  RAISE NOTICE 'Reference data and onboarding species are available';
END;
$$;
