# Database workflow

The live public schema was captured on 2026-09-16. The baseline deliberately preserves its behavior. The same day, its history was adopted on production and six tested follow-up migrations added authorization, atomic task rewards, orphan cleanup, authoritative battle/progression writers, realtime publication membership, atomic achievement claims and automatic discoveries. See [DATABASE_AUDIT.md](../DATABASE_AUDIT.md) for completed changes and remaining defects.

## What belongs where

- `schemas/`: desired public schema, organized by object type and function. These are the editable schema sources.
- `migrations/`: immutable, ordered deployment SQL. The baseline recreates the captured public schema and required species, forms, evolution paths and titles.
- `seeds/reference.sql`: provenance snapshot of those four reference tables; the baseline includes it, so production creation does not depend on development seeding. No user data is included.
- `seed.sql`: optional development fixtures only.
- `operations/scheduled-jobs.sql`: live cron snapshot for review, **not an installation script**. The five retained jobs are healthy; the broken job was removed. Schedules, reference-data changes and other DML need explicit migrations; schema generation does not capture them.
- `archive/`: previous local migrations, partial schema and the four recorded remote migrations, preserved for investigation rather than replay.
- `diagnostics/`: read-only inventory and reference-data checks.
- `src/types/database.types.ts`: generated public database types. The existing client has not yet been converted to use them.

## Local setup

Install Docker Desktop, use Linux containers, and keep Docker running. From this repository:

```sh
npm ci
npm run db:start:database
npm run db:reset
npm run db:test
npm run db:test:authorization
npm run db:lint:check
npm run db:check
```

Use `npm.cmd` in PowerShell if script execution is blocked. `db:start:database` runs PostgreSQL for schema checks; `db:start` starts the full local Supabase stack for application testing. Configure the app with local credentials from `npx supabase status` when testing locally; starting Docker does not automatically redirect your existing production environment variables.

## Every schema change

1. Edit the relevant files in `schemas/`. Do not edit the applied baseline or earlier migrations.
2. Run `npm run db:diff -- --name describe_change`. The pinned CLI uses `db schema declarative sync --no-apply` to generate a migration without applying it. Its `db diff` command no longer compares the desired schema directory.
3. Review the generated SQL, grants, RLS, dependency order and data preservation. Add explicit SQL for backfills, cron or reference data as needed. Keep destructive cleanup separate from adopting the baseline.
4. Run `npm run db:reset`, `npm run db:test`, `npm run db:test:authorization`, `npm run db:lint:check`, `npm run db:types`, `npm run db:check`, and application checks. Test permissions and affected behavior as well as fresh database creation.
5. Commit schemas, migration and generated types together. Deploy reviewed migrations to a staging project before the production project.

`db:check` compares declarative SQL with replayed migrations in an isolated temporary workspace and checks local generated types. CI rebuilds locally and checks schema consistency, reference data, authorization, atomic reward rollback, legacy cleanup and database lint without production credentials. `db:lint` shows warnings for investigation; `db:lint:check` uses `--fail-on error` and fails CI for invalid functions. The tests target only `supabase_db_digitask` and roll back their fixtures; they accept no production target.

## One-time adoption: completed on 2026-09-16 (arena update 2026-09-17)

The linked `digitask` project now records all thirteen active migrations in this checkout, from `20260916220000` through `20260918204618`. The four previous March 2026 versions were archived and removed from the active history metadata. The baseline was marked applied, **never executed** on the existing database. The six September 16 follow-ups and the September 17 additive arena migration were deployed without development seeds, role updates or vault updates. The authenticated arena-battle Edge Function is also deployed. The September 18 arena reward, tournament achievement/catalog, lifetime task-progress and evolution-history migrations are now applied.

The complete pre-adoption schema export matched the original capture before repair. Original definitions, grants, cron commands and recorded migration statements, plus manual restoration SQL, are backed up locally under ignored `supabase/.temp/backups/baseline-adoption-20260916/`. These are schema/metadata rollback materials, not a user-data backup. Adoption and the first five follow-ups did not modify production user rows. The achievement/discovery follow-up repaired six missing discovery records for currently owned species without resetting claims. Old checkouts must update before deploying; do not repeat this repair procedure.

New Supabase projects replay the baseline normally. Provisioning the five healthy cron jobs, provider settings, secrets, storage buckets and other project configuration remains a separate reviewed step. The baseline captures public schema and reference data, not a full production backup. The cleanup migration safely unschedules the obsolete job only when its command still matches the captured broken command.

## Live verification

`diagnostics/deployment-check.sql` contains read-only assertions for the September 16-17 deployments. `diagnostics/function-fingerprints.sql` compares normalized stored bodies, authorization attributes and grants. All 31 application overloads match the local schema after normalization; 18 older production bodies retain CRLF while the imported sources use LF. Raw CLI diff treats these as cosmetic replacements, not new functional migrations to apply. Declarative checks against migration history remain clean.

`.gitattributes` keeps SQL checkouts in LF on Windows and Linux to prevent new line-ending drift.

The task RPC now awards its battle ticket itself, rejects already-completed tasks, and propagates errors to roll back all its writes. The client no longer calls a separate grant RPC. The legacy grant RPC accepts only an authenticated zero-value connectivity probe; positive grants are rejected. `allocate_stat` validates ownership and stat names, locks saved points and enforces the current ABI cap; its client reverts optimistic changes if allocation is declined. Other direct-write game paths still need a broader permissions review.

Battle counters have one database writer and protected column grants. Only the BEFORE level-up trigger remains. The two active subscription tables are published. Client changes are prepared locally; deploy them through the normal website process and test browser behavior. The cleanup did not recalculate historical counters or rewrite battle rows.

See the official [migration guidance](https://supabase.com/docs/guides/deployment/database-migrations) and [CLI migration repair reference](https://supabase.com/docs/reference/cli/supabase-migration-repair).

## Achievement rewards and discoveries

The deployed migration `20260918072450_restore_lifetime_task_progress.sql` adds
the missing lifetime task increment to the existing completion trigger. Its
conservative backfill preserves higher counters and claims; retained tasks,
today's quota and earned task thresholds establish overlapping lower bounds,
not an exact historical total. Production verification preserved all 254 existing
achievement records and raised 16 counters without reducing any. See
[ACHIEVEMENTS.md](../ACHIEVEMENTS.md) and the local task-progress fixtures.

`titles.reward_bits` and `titles.reward_digimon_ids` define server-owned rewards. When editing `src/constants/titles.ts`, add a new data migration and update `seeds/achievement-catalog.sql`; database tests compare actual catalog rewards and pool IDs with the client definitions. Existing title names and requirements are preserved by reward catalog upserts. See [ACHIEVEMENTS.md](../ACHIEVEMENTS.md) for the complete catalog, earning, backfill, claim and progress-UI checklist.

`claim_achievement` locks the profile and owned earned-title row, validates the selected egg, grants Bits/pets and marks the claim in one transaction. Repeat attempts return the existing confirmation without another reward. Browser inserts into `user_titles` can supply only `user_id/title_id`; browser updates can change only `is_displayed`. Earning remains client-driven and requires a separate server-authorization follow-up.

`record_digimon_discovery_trigger` records species on pet insertion and species/owner changes, preserving prior discoveries. The migration backfills currently owned species only; deleted/evolved historical species without records cannot be reconstructed. Deploy the prepared web client to use the new claim flow. Do not reset historical claimed flags based only on a failure report. Account-specific diagnostic SQL belongs in ignored `*.local.sql` files.

## Digimon evolution history (database deployed 2026-09-18)

`20260918184219_track_digimon_evolution_history.sql` adds append-only species
history for each owned pet. An AFTER INSERT/species-update trigger records the
initial species and every actual species change in the same transaction, covering
evolution, devolution, forms and the surviving DNA-evolution pet. Renames, levels
and same-species updates do not create entries. DNA partner history is not merged;
deleting a pet cascades its history. The backfill records only each existing pet's
current species with a tracking-start marker, never reconstructing unknown paths.

History SELECT permissions follow visible `user_digimon` rows; browser roles have
no history write or trigger-function permissions. The UI fetches all pages and
renders the complete ordered history inside a bounded scrolling section. Deploy
the additive SQL migration before the compatible frontend. The migration is
applied to production; read-only checks confirmed starting points and latest
species for all 333 current pets, one enabled trigger and browser write protection.
The compatible frontend is included alongside the migration. Website publication
follows the repository's Vercel integration; verify it separately from the SQL deployment.

## Persisted daily arena battles

Daily arena fights call the authenticated arena-battle Edge Function. Its source is in src/server/ and the shared engine; npm run arena:build creates the ignored function bundle. The database migration adds private offers/requests and three service-role-only RPCs. Prepared requests charge nothing. Settlement commits the ticket spend, existing win/loss Bits reward, history, counters and saved playback in one transaction. Browser-supplied user IDs, winners, stats and reward amounts are not trusted.

Deploy the reviewed arena migration first, then run npm run arena:deploy, then deploy the compatible website. The legacy frontend remains compatible with the additive SQL migration, but it keeps its original ticket-loss problem until the new frontend is deployed. Verify the Edge Function and database deployment separately. No additional custom secret is needed: Supabase supplies its URL, anon key and service role key to the Edge runtime.

For local HTTP testing, build the function before starting the local stack. Start Auth/API/Edge services (a database-only start is insufficient), rebuild the database, then run npm run arena:serve in another terminal and npm run arena:test:integration. The test accepts only the local API, creates disposable users, exercises concurrent and aborted requests and removes its fixtures. CI starts the minimal Auth/API/Edge stack and runs this test alongside database checks. For browser testing, configure local VITE_ credentials deliberately; Docker does not redirect existing production configuration.

Recordings sample presentation state every 64ms and preserve combat events; movement is interpolated during playback. A worst-case replay is approximately 1 MiB in the current test. Requests and recordings are retained; monitor database growth and define a retention policy before expanding usage. The battle_id is a historical identifier rather than a foreign key, so the existing team_battles pruning job does not erase or block saved arena results. Replays can show results after the team or reference balance changes. Update replay readers compatibly, and preserve or explicitly migrate uncharged prepared requests when changing engine versions.

The 120-second simulation limit uses the greater remaining team HP fraction; ties count as defeats. Easy/Medium/Hard victories award 100/200/300 Bits; defeats award 50/50/40. Playback may be interrupted without losing rewards; it performs no database mutation. Tournament settlement remains a separate existing flow.

See the official [Edge Function authentication guide](https://supabase.com/docs/guides/functions/auth-legacy-jwt) and [runtime limits](https://supabase.com/docs/guides/functions/limits). Keep the engine bounded and benchmark it when changing simulation costs.

## Task-history reconciliation (database deployed 2026-09-18)

Data-only migration `20260918204618_reconcile_task_history_progress.sql` reconciles
lifetime counters with retained daily history without lowering any counter,
double-counting today's overlapping quota/history, or altering claims. It is
applied to production; the history/lifetime aggregate reports no remaining gaps.
Application summaries and partner task progress read the same lifetime source;
calendar cells still represent only the displayed dates. See `DATABASE_AUDIT.md`
for preservation checks. No schema or generated-type changes were needed.
