-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."create_add_dna_requirement_function"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  CREATE OR REPLACE FUNCTION public.add_dna_requirement_column()
  RETURNS void AS $func$
  BEGIN
    ALTER TABLE public.evolution_paths 
    ADD COLUMN IF NOT EXISTS dna_requirement INTEGER NULL REFERENCES public.digimon(id);
  END;
  $func$ LANGUAGE plpgsql;
END;
$_$;

ALTER FUNCTION "public"."create_add_dna_requirement_function"() OWNER TO "postgres";
