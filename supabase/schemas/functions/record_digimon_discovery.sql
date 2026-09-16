CREATE OR REPLACE FUNCTION public.record_digimon_discovery() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  INSERT INTO public.user_discovered_digimon (user_id, digimon_id)
  VALUES (NEW.user_id, NEW.digimon_id)
  ON CONFLICT (user_id, digimon_id) DO NOTHING;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.record_digimon_discovery() OWNER TO postgres;
