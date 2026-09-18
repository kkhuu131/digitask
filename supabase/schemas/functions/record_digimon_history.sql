CREATE OR REPLACE FUNCTION public.record_digimon_history() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_digimon_history (user_digimon_id, digimon_id, is_starting_point)
    VALUES (NEW.id, NEW.digimon_id, true);
  ELSIF NEW.digimon_id IS DISTINCT FROM OLD.digimon_id THEN
    INSERT INTO public.user_digimon_history (user_digimon_id, digimon_id)
    VALUES (NEW.id, NEW.digimon_id);
  END IF;
  RETURN NEW;
END;
$$;
ALTER FUNCTION public.record_digimon_history() OWNER TO postgres;
