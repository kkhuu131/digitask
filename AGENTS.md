# Repository instructions

Digitask is a React/TypeScript productivity game backed by Supabase.
Read [README.md](README.md) for architecture and setup. Before database work, read
[supabase/README.md](supabase/README.md), the authoritative database workflow, and
[DATABASE_AUDIT.md](DATABASE_AUDIT.md) for deployed changes and remaining work.
Review documents include historical findings; inspect current code before acting
on a candidate or restoring an old implementation.

## Development flow

1. Inspect the working tree and relevant callers. Preserve unrelated user changes.
2. Extend the existing components, stores and database tooling. Do not introduce a
   parallel migration directory, schema snapshot or obsolete UI implementation.
   If changing the workflow is necessary, update its documentation with the change.
3. Run checks appropriate to the change. Application checks are `npm run lint`,
   `npm run format:check`, `npm test` and `npm run build`. Use `npm.cmd` if PowerShell
   blocks the npm shim. CI uses Node.js 20.
4. Commit related code, tests, SQL and regenerated types together. Distinguish
   changes actually deployed from changes merely prepared for deployment.
5. Update `src/pages/PatchNotes.tsx` for each substantial batch of user-facing
   changes (features, fixes or UI improvements). Group related work into one dated
   entry rather than adding an entry for every commit. Small related changes may
   be folded into the current batch; internal-only changes do not need an entry.
   Describe the final user-visible behavior and do not claim deployment before
   it has happened.

## Database rules

- Edit desired schema in `supabase/schemas/`. Generate a new migration with
  `npm run db:diff -- --name describe_change`. Applied migrations are immutable.
- Production baseline adoption is complete. Never replay the baseline on the
  existing production project, repeat history repair or replay `supabase/archive/`.
  Fresh projects replay active migrations normally.
- Review generated SQL, grants, RLS, dependency order and data preservation.
  Backfills, reference-data changes and cron changes need explicit migration SQL;
  schema generation does not capture them.
- With Docker running, run `npm run db:reset`, `npm run db:test`,
  `npm run db:test:authorization`, `npm run db:lint:check`, `npm run db:types` and
  `npm run db:check`, plus affected application checks. Reset is local-only.
- Use the pinned repository CLI and scripts. The declarative consistency checker
  is intentional. Do not replace it with a raw remote diff that rewrites older
  functions solely because of CRLF/LF differences.
- Test locally, then on staging when available. Verify the linked target and review
  a deployment dry run before a production push. A local reset or build does not
  deploy production migrations. Coordinate compatible database and web releases.
- Do not assume production remains at the documented state indefinitely. Inspect
  migration history and relevant read-only diagnostics before changing it.
- Keep credentials, backups, raw exports and account-specific diagnostic SQL out
  of Git, using ignored `*.local.*` files or `supabase/.temp/`. Service role keys
  belong only in server/data tooling; `VITE_` variables must be browser-safe.
- `operations/scheduled-jobs.sql` is a reference, not an automatic installation
  script. Providers, secrets, buckets and project settings are provisioned separately.

## Preserve current behavior ownership

- Before achievement changes, read [ACHIEVEMENTS.md](ACHIEVEMENTS.md). It maps
  catalog/migration/seed updates, earning callers, claims, legacy preservation
  and DigiEgg progress routes. New reward routes need explicit progress mapping
  and UI integration; preserve smooth claims and hide fully claimed routes.
- Active task UI is `Dashboard` → `TaskList` → `CleanTaskList`. The retired
  `TaskLayout`, `TaskFilters`, `TaskItem` and `TaskKanban` are not its implementation.
- `complete_task_all_triggers` awards task rewards and one battle ticket itself.
  Do not add another browser ticket grant.
- Achievement claims use `claim_achievement`, committing rewards and claim status
  together. Do not restore browser claim timestamps, `grant_bits_self` calls or
  direct currency fallbacks. Earning is still client-driven and needs a separate
  authorization follow-up.
- Changes to `src/constants/titles.ts` need an explicit catalog data migration and
  an updated `supabase/seeds/achievement-catalog.sql`. Database tests compare the
  actual server reward definitions with the client catalog.
- `record_digimon_discovery_trigger` records pet inserts and species/owner changes.
  Preserve prior discoveries. Do not reset old claim flags or regrant rewards
  without evidence of what failed.
- Battle counters and level progression each have one database trigger. Do not
  restore duplicate triggers or browser counter increments.
- Daily arena fights use the authenticated `arena-battle` Edge Function. Setup
  includes team selection with optional strongest-team auto-fill. New battles use
  Balanced behavior automatically; recorded replay behaviors remain intact.
  Prepared requests spend nothing;
  `settle_arena_battle` atomically saves the ticket spend, rewards, history and
  recorded replay. The three arena service RPCs are service-role-only. Browser
  playback completion must never spend tickets, award rewards or write history.
- Build the Edge Function with `npm run arena:build`. Source lives in `src/server/`
  and the shared engine; the bundled `supabase/functions/arena-battle/index.js` is
  generated and ignored. Deploy with `npm run arena:deploy` after reviewed SQL
  migrations, then deploy the compatible frontend. Run `arena:test:integration`
  against a locally served function for server-flow changes; CI does this too.
- Bump the engine version and migrate the request engine-version default when combat
  rules change. Preserve support for existing
  prepared requests or migrate them deliberately without charging. Replays retain
  sampled states/events and do not depend on current engine rules. Keep replay
  format readers compatible with stored data. Tournament combat remains its
  separate existing flow; it is not covered by daily arena settlement.
- Realtime uses published `user_digimon` and `daily_quotas`. Delete payloads must
  not be treated as complete new rows.

## Code and cleanup conventions

- Before UI work, read [UI_GUIDELINES.md](UI_GUIDELINES.md). Use the shared
  styles in `src/index.css`, preserve shell-owned gutters, keep actions amber
  across themes and avoid decorative multicolor gradients. Update the guidelines
  when introducing a deliberate new convention. [UI_REVIEW.md](UI_REVIEW.md)
  records the consistency review and remaining interaction work.

- Routes/initialization are in `src/App.tsx`; screens are lazy-loaded. Zustand
  stores are in `src/store/`; inspect consumers before changing actions.
- Database access uses `src/lib/supabase.ts`. Generated types are checked in, but
  converting that client to use them remains a documented follow-up.
- Active arena code is in `src/engine/`. Shared conversion is in
  `src/utils/convertToBattleDigimon.ts`; attribute colors are in
  `src/constants/battleAttributeColors.ts`.
- Digidex completion uses `src/utils/digidexProgress.ts` across profiles, the
  leaderboard and the Digidex. Count unique discovered catalog species and derive
  the total from the bundled catalog; do not hard-code a species total.
- Generated species, evolution, form and sprite constants are updated with their
  scripts. Other constants are authored game definitions or content.
- Before deleting code, inspect direct/dynamic imports, routes, callers and
  dependencies among unreachable files. Preserve shared helpers still in use.
  Database cleanup also requires stored-call, trigger, cron and dependency checks.
- Sprite paths can be constructed dynamically or stored in data. Filename searches
  alone cannot establish that an asset is unused.
- Tests use dummy Supabase configuration from `.env.test`, never real credentials.
  Database fixtures run only against local Docker and roll back their changes.
