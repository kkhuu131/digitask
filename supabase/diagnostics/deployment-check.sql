-- Read-only verification, usable locally or against the linked project.
DO $$
DECLARE f regprocedure; v_signature text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.user_digimon'::regclass
    AND tgname='record_digimon_discovery_trigger' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Discovery trigger missing';
  END IF;
  IF has_column_privilege('authenticated','public.user_titles','claimed_at','UPDATE') OR
    has_column_privilege('authenticated','public.user_titles','claimed_at','INSERT') THEN
    RAISE EXCEPTION 'Browser can forge a claim timestamp';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_digimon p WHERE NOT EXISTS (
    SELECT 1 FROM public.user_discovered_digimon d WHERE d.user_id=p.user_id AND d.digimon_id=p.digimon_id)) THEN
    RAISE EXCEPTION 'Owned Digimon missing discoveries';
  END IF;
  IF (SELECT array_agg(version ORDER BY version) FROM supabase_migrations.schema_migrations)
    IS DISTINCT FROM ARRAY['20260916220000', '20260916230000', '20260916231000',
      '20260916232000', '20260916233000', '20260916234000', '20260916235000',
      '20260917000000', '20260918061922', '20260918063049']::text[] THEN
    RAISE EXCEPTION 'Unexpected migration history';
  END IF;
  IF EXISTS (SELECT 1 FROM (VALUES (601,200),(602,500),(603,1000)) expected(id,bits)
    LEFT JOIN public.titles title USING(id)
    WHERE title.id IS NULL OR title.reward_bits IS DISTINCT FROM expected.bits
      OR title.category IS DISTINCT FROM 'tournament') THEN
    RAISE EXCEPTION 'Tournament achievement catalog mismatch';
  END IF;
  IF position('WHEN ''hard'' THEN 300 WHEN ''medium'' THEN 200 ELSE 100 END'
    IN pg_get_functiondef('public.settle_arena_battle(uuid,uuid,jsonb)'::regprocedure))=0 THEN
    RAISE EXCEPTION 'Arena victory rewards not updated';
  END IF;
  FOREACH f IN ARRAY ARRAY[
    'public.prepare_arena_battle(uuid,uuid,uuid,uuid[],text[])'::regprocedure,
    'public.settle_arena_battle(uuid,uuid,jsonb)'::regprocedure,
    'public.arena_battle_context(uuid)'::regprocedure
  ] LOOP
    IF has_function_privilege('anon',f,'EXECUTE') OR
      has_function_privilege('authenticated',f,'EXECUTE') OR
      NOT has_function_privilege('service_role',f,'EXECUTE') THEN
      RAISE EXCEPTION 'Arena service RPC has incorrect permissions: %',f;
    END IF;
  END LOOP;
  IF has_table_privilege('authenticated','public.arena_battle_requests','INSERT') OR
    has_table_privilege('authenticated','public.arena_battle_requests','UPDATE') OR
    has_table_privilege('anon','public.arena_battle_requests','SELECT') THEN
    RAISE EXCEPTION 'Arena request table has incorrect permissions';
  END IF;
  FOREACH f IN ARRAY ARRAY[
    'public.admin_rename_user(uuid,text)'::regprocedure,
    'public.allocate_stat(uuid,text,uuid)'::regprocedure,
    'public.complete_task_all_triggers(uuid,uuid,boolean)'::regprocedure,
    'public.spend_energy_self(integer)'::regprocedure,
    'public.grant_energy_self(integer)'::regprocedure,
    'public.claim_achievement(integer,integer)'::regprocedure
  ] LOOP
    IF has_function_privilege('anon', f, 'EXECUTE') OR
      NOT has_function_privilege('authenticated', f, 'EXECUTE') THEN
      RAISE EXCEPTION 'Incorrect execution permissions for %', f;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE oid = f AND prosecdef AND proconfig IS NULL) THEN
      RAISE EXCEPTION 'Missing SECURITY DEFINER search path for %', f;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      'reset_boss_hp', 'set_event_phase', 'show_event_status', 'show_user_participation',
      'user_can_battle_boss', 'user_participated_in_phase1')) THEN
    RAISE EXCEPTION 'Retired boss functions remain';
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reset-daily-stats') THEN
    RAISE EXCEPTION 'Failed daily-stat job remains';
  END IF;
  FOREACH v_signature IN ARRAY ARRAY[
    'public.check_and_increment_battle_limit()', 'public.check_and_set_first_win(uuid)',
    'public.delete_user_and_data(uuid)', 'public.generate_enemy_team(integer)',
    'public.get_opponents_with_digimon(integer,uuid)', 'public.get_random_digimon(integer)',
    'public.get_random_digimon_by_stage(text)', 'public.get_random_users(uuid)',
    'public.is_admin(uuid)', 'public.keep_recent_team_battles()', 'public.reset_user_tasks(uuid,text)',
    'public.spend_energy(uuid,integer)', 'public.update_longest_streak()', 'public.update_profiles_updated_at()'
  ] LOOP
    IF to_regprocedure(v_signature) IS NOT NULL THEN
      RAISE EXCEPTION 'Unused overload remains: %', v_signature;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM pg_trigger WHERE tgfoid = 'public.update_battle_stats()'::regprocedure AND NOT tgisinternal) <> 1 OR
    (SELECT count(*) FROM pg_trigger WHERE tgfoid = 'public.level_up_digimon()'::regprocedure AND NOT tgisinternal) <> 1 THEN
    RAISE EXCEPTION 'Duplicate counter/progression triggers remain';
  END IF;
  IF has_column_privilege('authenticated', 'public.profiles', 'battles_won', 'UPDATE') OR
    has_column_privilege('authenticated', 'public.profiles', 'battles_completed', 'UPDATE') THEN
    RAISE EXCEPTION 'Browser can still edit battle counters';
  END IF;
  IF (SELECT count(*) FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
    AND tablename IN ('user_digimon', 'daily_quotas')) <> 2 THEN
    RAISE EXCEPTION 'Active realtime tables are not published';
  END IF;
  IF to_regprocedure('public.contribute_boss_progress(uuid,integer,boolean)') IS NULL OR
    to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION 'An active dependency was removed';
  END IF;
  RAISE NOTICE 'Migration history, RPC grants and legacy cleanup verified';
END;
$$;
