-- Desired application schema, imported from Supabase on 2026-09-16.
-- Edit here and generate a NEW migration; applied migrations remain immutable.

CREATE OR REPLACE FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text" DEFAULT NULL::"text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = pg_catalog, public
    AS $$
DECLARE
  user_uuid TEXT;
  generated_username TEXT;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required' USING ERRCODE = '42501';
  END IF;
  IF new_username IS NOT NULL AND (length(btrim(new_username)) < 1 OR length(new_username) > 50) THEN
    RAISE EXCEPTION 'Username must contain between 1 and 50 characters' USING ERRCODE = '22023';
  END IF;
  -- Get the first 5 characters of the user's UUID
  SELECT SUBSTRING(id::TEXT, 1, 5) INTO user_uuid
  FROM auth.users
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = '22023';
  END IF;
  
  -- If no new username provided, generate one
  IF new_username IS NULL THEN
    generated_username := 'User' || user_uuid;
  ELSE
    generated_username := new_username;
  END IF;
  
  -- Update the username in the profiles table
  UPDATE profiles
  SET username = generated_username,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN generated_username;
END;
$$;

ALTER FUNCTION "public"."admin_rename_user"("user_id" "uuid", "new_username" "text") OWNER TO "postgres";
