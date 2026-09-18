BEGIN;
SET local check_function_bodies = off;

-- Block concurrent species changes until every existing pet has a starting point.
LOCK TABLE public.user_digimon IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE "public"."user_digimon_history" (
  "id"                bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "user_digimon_id"   uuid                     NOT NULL,
  "digimon_id"        integer                  NOT NULL,
  "recorded_at"       timestamp with time zone NOT NULL DEFAULT clock_timestamp(),
  "is_starting_point" boolean                  NOT NULL DEFAULT false,
  "is_backfilled"     boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "user_digimon_history_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."user_digimon_history"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.record_digimon_history()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog', 'public'
  AS $function$
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
$function$;

ALTER TABLE "public"."user_digimon_history"
  ADD CONSTRAINT "user_digimon_history_pet_fkey" FOREIGN KEY (user_digimon_id) REFERENCES public.user_digimon(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_digimon_history"
  ADD CONSTRAINT "user_digimon_history_species_fkey" FOREIGN KEY (digimon_id) REFERENCES public.digimon(id);

CREATE UNIQUE INDEX user_digimon_history_one_start ON public.user_digimon_history USING btree (user_digimon_id)
  WHERE is_starting_point;

CREATE INDEX user_digimon_history_pet_order ON public.user_digimon_history USING btree (user_digimon_id, id);

CREATE TRIGGER record_digimon_history_trigger
  AFTER INSERT OR UPDATE OF digimon_id ON public.user_digimon
  FOR EACH ROW
  EXECUTE FUNCTION public.record_digimon_history();

CREATE POLICY "Read history of visible Digimon" ON "public"."user_digimon_history"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.user_digimon pet
  WHERE (pet.id = user_digimon_history.user_digimon_id))));

REVOKE ALL ON FUNCTION "public"."record_digimon_history"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."record_digimon_history"() TO "postgres", "service_role";

REVOKE ALL ON TABLE "public"."user_digimon_history" FROM "anon";

GRANT SELECT ON TABLE "public"."user_digimon_history" TO "anon";

REVOKE ALL ON TABLE "public"."user_digimon_history" FROM "authenticated";

GRANT SELECT ON TABLE "public"."user_digimon_history" TO "authenticated";

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_digimon_history" TO "postgres", "service_role";

REVOKE ALL ON SEQUENCE public.user_digimon_history_id_seq FROM PUBLIC, anon, authenticated;
GRANT ALL ON SEQUENCE public.user_digimon_history_id_seq TO service_role;

-- BEGIN DIGIMON HISTORY BACKFILL
-- Current species only: historical paths cannot be reliably reconstructed.
INSERT INTO public.user_digimon_history (user_digimon_id, digimon_id, is_starting_point, is_backfilled)
SELECT id, digimon_id, true, true FROM public.user_digimon
ON CONFLICT (user_digimon_id) WHERE is_starting_point DO NOTHING;
-- END DIGIMON HISTORY BACKFILL
COMMIT;
