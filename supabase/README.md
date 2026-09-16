# Database workflow

The live public schema was captured on 2026-09-16. The baseline deliberately preserves its behavior. The same day, its history was adopted on production and six tested follow-up migrations added authorization, atomic task rewards, orphan cleanup, authoritative battle/progression writers realtime publication membership, atomic achievement claims and automatic discoveries. See [DATABASE_AUDIT.md](../DATABASE_AUDIT.md) for completed changes and remaining defects.

## What belongs where

- `schemas/`: desired public schema, organized by object type and function. These are the editable schema sources.
- `migrations/`: immutable, ordered deployment SQL. The baseline recreates the captured public schema and required species, forms, evolution paths and titles.
- `seeds/reference.sql`: provenance snapshot of those four reference tables; the baseline includes it, so production creation does not depend on development seeding. No user data is included.
- `seed.sql`: optional development fixtures only.
- `operations/scheduled-jobs.sql`: live cron snapshot for review, **not an installation script**. One captured job is broken. Schedules, reference-data changes and other DML need explicit migrations; schema generation does not capture them.
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

## One-time adoption: completed on 2026-09-16

The linked `digitask` project now records all seven active migrations in this checkout, from `20260916220000` through `20260916235000`. The four previous March 2026 versions were archived and removed from the active history metadata. The baseline was marked applied, **never executed** on the existing database. Only the six follow-up migrations were deployed, without seeds, role updates or vault updates.

The complete pre-adoption schema export matched the original capture before repair. Original definitions, grants, cron commands and recorded migration statements, plus manual restoration SQL, are backed up locally under ignored `supabase/.temp/backups/baseline-adoption-20260916/`. These are schema/metadata rollback materials, not a user-data backup. Adoption and the first five follow-ups did not modify production user rows. The achievement/discovery follow-up repaired six missing discovery records for currently owned species without resetting claims. Old checkouts must update before deploying; do not repeat this repair procedure.

New Supabase projects replay the baseline normally. Provisioning the five healthy cron jobs, provider settings, secrets, storage buckets and other project configuration remains a separate reviewed step. The baseline captures public schema and reference data, not a full production backup. The cleanup migration safely unschedules the obsolete job only when its command still matches the captured broken command.

## Live verification

`diagnostics/deployment-check.sql` contains read-only assertions for the September 16 deployment. `diagnostics/function-fingerprints.sql` compares normalized stored bodies, authorization attributes and grants. All 28 application overloads match the local schema after normalization; 18 older production bodies retain CRLF while the imported sources use LF. Raw CLI diff treats these as cosmetic replacements, not new functional migrations to apply. Declarative checks against migration history remain clean.

`.gitattributes` keeps SQL checkouts in LF on Windows and Linux to prevent new line-ending drift.

The task RPC now awards its battle ticket itself, rejects already-completed tasks, and propagates errors to roll back all its writes. The client no longer calls a separate grant RPC. The legacy grant RPC accepts only an authenticated zero-value connectivity probe; positive grants are rejected. `allocate_stat` validates ownership and stat names, locks saved points and enforces the current ABI cap; its client reverts optimistic changes if allocation is declined. Other direct-write game paths still need a broader permissions review.

Battle counters have one database writer and protected column grants. Only the BEFORE level-up trigger remains. The two active subscription tables are published. Client changes are prepared locally; deploy them through the normal website process and test browser behavior. The cleanup did not recalculate historical counters or rewrite battle rows.

See the official [migration guidance](https://supabase.com/docs/guides/deployment/database-migrations) and [CLI migration repair reference](https://supabase.com/docs/reference/cli/supabase-migration-repair).

## Achievement rewards and discoveries

`titles.reward_bits` and `titles.reward_digimon_ids` define server-owned rewards. When editing `src/constants/titles.ts`, add a new data migration and update `seeds/achievement-catalog.sql`; database tests compare actual catalog rewards and pool IDs with the client definitions. Existing title names and requirements are preserved by reward catalog upserts.

`claim_achievement` locks the profile and owned earned-title row, validates the selected egg, grants Bits/pets and marks the claim in one transaction. Repeat attempts return the existing confirmation without another reward. Browser inserts into `user_titles` can supply only `user_id/title_id`; browser updates can change only `is_displayed`. Earning remains client-driven and requires a separate server-authorization follow-up.

`record_digimon_discovery_trigger` records species on pet insertion and species/owner changes, preserving prior discoveries. The migration backfills currently owned species only; deleted/evolved historical species without records cannot be reconstructed. Deploy the prepared web client to use the new claim flow. Do not reset historical claimed flags based only on a failure report. Account-specific diagnostic SQL belongs in ignored `*.local.sql` files.
