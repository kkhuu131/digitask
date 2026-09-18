# Database audit and deployed cleanup — 2026-09-17

## Digimon evolution history — database deployed 2026-09-18

`20260918184219_track_digimon_evolution_history.sql` adds transactional per-pet
species history and a current-species-only backfill. Existing paths are unknown
and not reconstructed. Repeated species remain separate ordered entries. History
is readable wherever the pet is visible, but browser roles cannot write it.
Deleted pets cascade their history; DNA evolution continues the surviving pet's
history without merging the consumed partner's history. The migration was applied
to the linked production project after migration-history inspection and a
reviewed one-migration dry run. Read-only post-deployment checks verified all 333
current pets have a starting point and a latest history entry matching their
species, exactly one active history trigger, and no browser history writes.
Production migration history now includes `20260918184219`. The compatible
frontend is included alongside the migration; website publication follows the
repository's Vercel integration and requires separate deployment verification.

Local reset, reference integrity, history/authorization/backfill/rollback fixtures,
database lint, regenerated types and declarative consistency checks passed.
All 104 app tests, lint, formatting and production build passed. Browser checks
verified 101-entry histories, bounded vertical scrolling, sprite details and
error/retry/empty states in both themes at 320px, 768px and 1440px widths.

The linked `digitask` database now has **22 public tables, 2 views, 32 application function overloads and 5 scheduled jobs**. The realtime publication contains `user_digimon` and `daily_quotas`, matching the app subscriptions.

The inspection covered application/scripts, stored-function callers, attached triggers, policies, catalog dependencies and cron commands. All 20 original orphan-function candidates have been removed. The current audit flags three legacy frontend RPCs (`check_and_set_first_win_self`, `grant_energy_self`, `spend_energy_self`) after their callers were replaced. They remain for older deployed clients and should be retired in a separate migration after rollout. Historical migrations still contain original definitions as required for replay; they are not runtime callers.

## Task-progress repair deployed — 2026-09-18

Read-only inspection on 2026-09-18 confirmed that the deployed task completion
trigger updates today's quota but never increments
`user_milestones.tasks_completed_count`. Both task achievements and partner task
progress read this lifetime counter. Sixteen accounts had retained task completion
evidence exceeding their stored counter; historical recurring resets and deleted
tasks prevent exact reconstruction.

`20260918072450_restore_lifetime_task_progress.sql` adds a single server-side
increment in the existing completion trigger and a nondecreasing backfill from
retained task evidence, today's quota and already-earned task milestone thresholds.
The repair preserves claims, pins and streaks and does not grant rewards directly.
It was applied to the linked production project after a reviewed one-migration
dry run. Production history now ends at `20260918072450`. Read-only post-deployment
diagnostics verified the function, one active completion writer and recovered
historical lower bounds. Private before/after snapshots verified all 254 existing
achievement records and all 41 milestone records were preserved; 16 counters
increased, none decreased, and streak/claim/pin metadata was unchanged.

Local reset, reference checks, authorization/reward rollback fixtures, repeated
backfill preservation fixtures, database lint, regenerated types and declarative
consistency checks passed. All 102 application tests, lint, formatting and build
passed. Verification used read-only production queries; the migration performed
the reviewed counter repair. No production test users or task completions were used.

## Completed and deployed

| Migration | Result |
| --- | --- |
| `20260916220000_baseline` | Captured live schema and required reference data. Marked already applied on the existing project; never replayed there. Four original remote versions are archived. |
| `20260916230000_authorize_gameplay_rpcs` | Authorization guards, safe definer search paths, serialized/atomic task rewards, repeat-completion rejection and explicit RPC grants. |
| `20260916231000_retire_broken_boss_functions` | Removed six broken weekly-boss helpers and unscheduled the daily job calling a nonexistent function. |
| `20260916232000_retire_unused_function_overloads` | Removed the remaining 14 overloads after confirming no code, stored-function, trigger or cron callers. Preserved active `is_admin()` and `spend_energy_self(integer)`. |
| `20260916233000_consolidate_battle_and_levelup_writers` | Kept one battle-counter trigger and one BEFORE level-up trigger; validated battle inserts and protected counter columns from browser writes. |
| `20260916234000_publish_active_realtime_tables` | Published the two tables used by app subscriptions. Existing read permissions and RLS were retained. |
| `20260916235000_atomic_achievement_claims_and_discoveries` | Atomic claims with server-owned reward definitions, ownership/pool validation and repeat protection. Added eight missing task achievements and repaired six missing discoveries. Discovery triggers cover pet inserts and species changes. |
| `20260917000000_persist_atomic_arena_battles` | Private offers/requests, service-only preparation and atomic settlement. Prepared requests charge nothing; settlement saves ticket, Bits, history, counters and recorded playback once. The authenticated arena-battle Edge Function is deployed. |

Drops use explicit signatures and no CASCADE. No existing user rows were deleted or rewritten by these migrations. The discovery backfill inserted six missing records. Baseline seeds were not replayed on production. The earlier review-only orphan-removal proposal has been replaced by the deployed migration.

### Mutation ownership

- **Tasks:** the RPC locks the profile and task, validates `auth.uid()`, rejects already-completed tasks, and awards XP, stats and a battle ticket in one transaction. Errors propagate rather than leaving partial rewards. The completion trigger owns the quota increment; its missing-row branch now works. Streak/quota readiness is read after that increment.
- **Saved stats:** `allocate_stat` validates the user, pet ownership and stat name, locks saved points, and enforces the ABI cap. Its client reverts optimistic changes when the server declines allocation.
- **Admin rename:** requires an authenticated administrator. The unused administrative deletion helper was subsequently removed.
- **Tickets:** self-spending validates authentication and a positive amount. The old arbitrary-user overload is removed. The legacy grant RPC permits only an authenticated zero-value probe; task completion grants tickets directly.
- **Battles:** the database increments both participants once and increments only the winner's wins. The trigger locks participant profiles in a consistent order. Counter columns are excluded from browser INSERT/UPDATE grants, so older clients cannot add a second increment. Initiator ownership and participant/winner constraints reject spoofed rows. Wild and tournament losses can have a null winner. The arena's extra update and tournament's extra title-check increment are removed from the frontend.
- **Progression:** the existing BEFORE level-up trigger persists level/remaining-XP changes. The redundant AFTER trigger is removed.

New battle constraints use NOT VALID to enforce new writes without rewriting historical rows. Existing inflated lifetime counters were not recomputed: retained battle history is incomplete, so it cannot establish accurate lifetime totals.

### Frontend changes

The workspace now uses server counter values, checks battle-insert errors, removes Debug queries against the deleted `battles` table, and updates realtime handlers. Quotas consume filtered INSERT/UPDATE payloads; pet DELETE events match the deleted primary key locally. SQL checkouts use LF through `.gitattributes`.

These frontend changes are built and tested locally but **have not been published to the live website**. Publication membership is verified; browser-to-live websocket delivery was not tested. See the official [Postgres Changes documentation](https://supabase.com/docs/guides/realtime/postgres-changes) for replication and payload behavior.

## Kept because they remain used

- `admin_users` and zero-argument `is_admin()` support active policies and admin checks.
- `user_milestones` and `profiles.highest_stage_cleared` are read by achievement logic.
- The no-op `contribute_boss_progress` remains called by task completion. Remove that invocation before retiring the compatibility stub.
- The scraper conditionally invokes `create_add_dna_requirement_function` if a required column is missing. Move this schema bootstrap into the migration workflow before retiring its factory. Its generated helper is intentionally absent while that column exists.
- `battle_limits` still has a Debug caller and a scheduled reset; its surrounding system needs a coordinated retirement.
- `admin_reports` and `user_digimon_profiles` have no repository callers but may support reporting. Their removal is separate from the explicitly authorized function cleanup.

## Scheduled jobs

The five retained jobs are `check-overdue-tasks`, `reset-battle-limits`, `daily_team_battles_cleanup`, `daily_task_reset` and `daily_quota_processing`. Their inspected last-week runs succeeded. The obsolete `reset-daily-stats` job was removed after seven failures; cleanup refuses to unschedule it if its command changes or its missing function reappears.

`operations/scheduled-jobs.sql` contains only the five healthy job definitions. It is an operational reference, not automatic declarative-schema input. New projects still need reviewed cron provisioning and external Supabase configuration. Daily jobs use fixed UTC schedules; review daylight-saving behavior if Los Angeles midnight is intended.

## Remaining work, in order

1. **Client rollout and old partial claims:** deploy the prepared frontend to use `claim_achievement` and the persisted arena Edge flow; browser writes to claim timestamps are now denied. Old claims may have delivered partial rewards; repair individual cases only with evidence, never reset all claims. Newly discovered species are tracked automatically, and all currently owned species have discovery records.
2. **Broader mutation authorization:** currency, daily-quota bonuses, saved stats and some other gameplay fields still have browser write paths. `user_milestones` also has a permissive update policy. Achievement earning is also still client-driven: an owned title row is the current claim entitlement, not server-verified accomplishment. Restricting the patched RPCs/counters does not secure every mutation; move each operation behind validated server transactions with role/ownership tests.
3. **Typed database client:** generated types are checked in and verified, but `src/lib/supabase.ts` does not yet use `Database`. Convert it and resolve real schema/domain mismatches rather than adding broad casts.
4. **Remaining legacy integrations:** migrate scraper DDL bootstrap, remove the boss compatibility invocation, retire battle-limit cron/Debug uses, then assess reporting views. The audit flags the three old energy/first-win RPCs above; retire them after the client rollout and update their permission tests. Preserve current dependencies until their callers change.
5. **Frontend deployment and runtime verification:** publish the prepared client changes through the normal deployment process and test achievement/battle/progression/realtime behavior with staging accounts.

## Verification and rollback materials

Fresh local replay, declarative consistency, generated types, reference data, authorization/atomic-rollback tests, battle-counter/spoofing tests, wild-loss insertion, multi-level progression, changed-cron-command protection, database lint, application lint/format/build and all 52 application tests pass. Local HTTP tests use actual Auth/API/Edge Runtime and cover concurrent starts, aborted-request recovery, private request reads and server-only settlement. Replay tests verify reproducible seeds and identical events/final health across playback frame rates. Read-only live assertions verify history, removed overloads, permissions, single triggers and publication membership; the deployed Edge Function rejects anonymous callers. No paid production battle was created as a test.

All 31 local and remote normalized function bodies, inspected attributes and grants match. Eighteen older stored bodies retain CRLF on production; raw CLI diff treats those line endings as cosmetic replacements. Do not generate functional migrations from that cosmetic difference.

Run `npm run db:audit` for the current conservative caller inventory. Raw exports/results are ignored `*.local.*` files. A pre-achievement schema snapshot and rollback notes are under `supabase/.temp/backups/achievement-discovery-20260916/`. Original schema/metadata and restoration materials are stored locally under ignored `supabase/.temp/backups/baseline-adoption-20260916/` and `supabase/.temp/backups/function-cleanup-20260916/`; they contain no user-data backup. Preserve nullable winners if rolling back after new wild-loss rows have been recorded.

Follow [supabase/README.md](supabase/README.md) for the ongoing migration workflow. Production baseline adoption is complete and must not be repeated.

## Arena operational follow-up

The production migration and arena-battle function are deployed; the website still needs the prepared client commit/deployment. The old client remains compatible with the additive arena migration but retains its old ticket-loss behavior until rollout. Tournament combat/settlement is still separate and has not been converted. Recordings are currently retained indefinitely; define a retention policy and monitor storage before scaling usage. The worst-case local replay is approximately 1 MiB; a bounded 120-second simulation took about 60 ms in the current local test. A schema-only pre-arena backup and rollback notes are under ignored `supabase/.temp/backups/atomic-arena-20260917/`. Do not delete settled records or refund paid fights merely because playback was interrupted.

## Deployed arena reward update - 2026-09-18

The desired `settle_arena_battle` function and a new migration raise Easy/Medium/Hard
victory rewards to 100/200/300 Bits. Defeat rewards remain 50/50/40. Settled requests
keep their recorded amounts; retries do not grant another payout. The Arena page,
SQL reward/rollback fixtures and local HTTP integration expectation are updated.
Docker was unavailable during preparation. The local reset, reward/authorization
regressions, database lint, generated types and declarative consistency checks
subsequently passed. The migration copies only the changed
function definition; its signature and service-role-only grants are preserved.
The documented local checks and production deployment dry run passed;
`20260918061922_increase_arena_victory_rewards` was applied to production.

## Deployed tournament achievements and campaign retirement - 2026-09-18

A new catalog data migration adds Contender/Finalist/Champion (IDs 601?603) with
200/500/1,000 Bits claim rewards. It backfills earned tournament titles from saved
round wins or completed final placements, and preserves outstanding campaign
entitlements from saved highest-stage progress before browser campaign checks
are retired. Inserts are conflict-safe and grant no immediate currency; prior
claim timestamps, earned dates and pinned flags remain unchanged. Catalog seeds
match the client. The website shows only earned campaign titles in Legacy and
excludes all campaign titles from active completion totals.

Tournament earning remains client-driven from persisted results, consistent with
the existing earning model; broader earning authorization remains a separate
follow-up. Claims still use the atomic server RPC. Local database reset, reference integrity, reward/authorization/backfill
regressions, lint, generated types and declarative consistency checks passed. `20260918063049_tournament_achievements_and_campaign_legacy` was applied to
production before the frontend release, giving new claims server catalog
definitions and capturing campaign entitlements before retiring checks. No type signatures changed.

The local authenticated Arena HTTP integration check also passed after these
changes, including concurrent starts, interrupted-request recovery, saved results,
resume and role isolation. Both SQL migrations are deployed to the linked `digitask` production project.
Frontend publication follows through the repository?s Vercel integration.
