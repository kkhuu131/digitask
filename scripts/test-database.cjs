// Deliberately local-only: no database URL or production target is accepted.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
let sql = fs.readFileSync(path.join(__dirname, '../supabase/tests/authorization.sql'), 'utf8');
sql += '\n' + fs.readFileSync(path.join(__dirname, '../supabase/tests/achievement-claims.sql'), 'utf8');
// Check the actual database catalog against the client definitions, not a text snapshot.
const ts = require('typescript');
const vm = require('node:vm');
const catalogContext = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/constants/titles.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, catalogContext);
const rewards = catalogContext.exports.TITLES.map((title) =>
  '(' + title.id + ',' + (title.rewards?.bits ?? 0) + ',ARRAY[' + (title.rewards?.digiEggPool ?? []).join(',') + ']::integer[])').join(',');
sql += `
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM (VALUES ${rewards}) AS expected(id,bits,pool)
    LEFT JOIN public.titles t USING(id)
    WHERE t.id IS NULL OR t.reward_bits IS DISTINCT FROM expected.bits OR t.reward_digimon_ids IS DISTINCT FROM expected.pool)
    THEN RAISE EXCEPTION 'Achievement catalog differs from client; add a catalog data migration'; END IF;
  IF EXISTS (SELECT 1 FROM public.titles t CROSS JOIN LATERAL unnest(t.reward_digimon_ids) reward(id)
    LEFT JOIN public.digimon d ON d.id=reward.id WHERE d.id IS NULL)
    THEN RAISE EXCEPTION 'Achievement pool references missing species'; END IF;
END $$;
`;
sql += '\n' + fs.readFileSync(path.join(__dirname, '../supabase/tests/arena-battles.sql'), 'utf8');
const baseline = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260916220000_baseline.sql'), 'utf8');
const retired = new Set(['user_can_battle_boss', 'user_participated_in_phase1',
  'reset_boss_hp', 'set_event_phase', 'show_event_status', 'show_user_participation']);
const fixtures = [...baseline.matchAll(/^CREATE OR REPLACE FUNCTION "public"\."([^"]+)"\([\s\S]*?(?=^ALTER FUNCTION)/gm)]
  .filter((match) => retired.has(match[1])).map((match) => match[0]);
if (fixtures.length !== retired.size) throw new Error('Missing original cleanup-test definitions');
const cleanup = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260916231000_retire_broken_boss_functions.sql'), 'utf8');
if (cleanup.includes('$cleanup$')) throw new Error('Unexpected SQL delimiter');
sql += '\nBEGIN;\n' + fixtures.join('\n') + `
SELECT cron.schedule('reset-daily-stats', '0 8 * * *', 'SELECT public.reset_daily_tasks()');
SELECT cron.alter_job(jobid, active := false) FROM cron.job WHERE jobname = 'reset-daily-stats';
DO $test$
BEGIN
  BEGIN
    EXECUTE $cleanup$${cleanup}$cleanup$;
    RAISE EXCEPTION 'Cleanup removed a job whose command had changed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'The reset-daily-stats command changed; review before unscheduling' THEN RAISE; END IF;
  END;
END;
$test$;
SELECT cron.alter_job(jobid, command := 'SELECT reset_daily_stat_gains()') FROM cron.job WHERE jobname = 'reset-daily-stats';
` + cleanup + `
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reset-daily-stats') OR
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname IN (${[...retired].map((name) => "'" + name + "'").join(', ')})) THEN
    RAISE EXCEPTION 'Cleanup left the failed job or retired functions';
  END IF;
  IF to_regprocedure('public.contribute_boss_progress(uuid,integer,boolean)') IS NULL THEN
    RAISE EXCEPTION 'Cleanup removed the active compatibility stub';
  END IF;
END;
$$;
ROLLBACK;
SELECT 'Legacy cleanup and changed-job protection passed; fixtures rolled back' AS result;
`;
const result = spawnSync('docker', ['exec', '-i', 'supabase_db_digitask',
  'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], {
  input: sql, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
