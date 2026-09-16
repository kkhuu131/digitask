# Database audit and deployed cleanup — 2026-09-16

The linked `digitask` database now has **19 public tables, 2 views, 28 application function overloads and 5 scheduled jobs**. The realtime publication contains `user_digimon` and `daily_quotas`, matching the app subscriptions.

The inspection covered application/scripts, stored-function callers, attached triggers, policies, catalog dependencies and cron commands. All 20 original orphan-function candidates have been removed. The regenerated audit reports **no functions without known callers**. Historical migrations still contain original definitions as required for replay; they are not runtime callers.

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

Drops use explicit signatures and no CASCADE. No table or user data was deleted or rewritten by these migrations. Baseline seeds were not replayed on production. The earlier review-only orphan-removal proposal has been replaced by the deployed migration.

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

1. **Client rollout and old partial claims:** deploy the prepared frontend to use `claim_achievement`; browser writes to claim timestamps are now denied. Old claims may have delivered partial rewards; repair individual cases only with evidence, never reset all claims. Newly discovered species are tracked automatically, and all currently owned species have discovery records.
2. **Broader mutation authorization:** currency, daily-quota bonuses, saved stats and some other gameplay fields still have browser write paths. `user_milestones` also has a permissive update policy. Achievement earning is also still client-driven: an owned title row is the current claim entitlement, not server-verified accomplishment. Restricting the patched RPCs/counters does not secure every mutation; move each operation behind validated server transactions with role/ownership tests.
3. **Typed database client:** generated types are checked in and verified, but `src/lib/supabase.ts` does not yet use `Database`. Convert it and resolve real schema/domain mismatches rather than adding broad casts.
4. **Remaining legacy integrations:** migrate scraper DDL bootstrap, remove the boss compatibility invocation, retire battle-limit cron/Debug uses, then assess reporting views. The audit now also flags `grant_energy_self` after removing its client connectivity fallback; retire it after the client rollout and update its permission tests. Preserve current dependencies until their callers change.
5. **Frontend deployment and runtime verification:** publish the prepared client changes through the normal deployment process and test achievement/battle/progression/realtime behavior with staging accounts.

## Verification and rollback materials

Fresh local replay, declarative consistency, generated types, reference data, authorization/atomic-rollback tests, battle-counter/spoofing tests, wild-loss insertion, multi-level progression, changed-cron-command protection, database lint, application lint/format/build and all 43 application tests pass. Read-only live assertions verify history, removed overloads, permissions, single triggers and publication membership.

All 28 local and remote normalized function bodies, inspected attributes and grants match. Eighteen older stored bodies retain CRLF on production; raw CLI diff treats those line endings as cosmetic replacements. Do not generate functional migrations from that cosmetic difference.

Run `npm run db:audit` for the current conservative caller inventory. Raw exports/results are ignored `*.local.*` files. A pre-achievement schema snapshot and rollback notes are under `supabase/.temp/backups/achievement-discovery-20260916/`. Original schema/metadata and restoration materials are stored locally under ignored `supabase/.temp/backups/baseline-adoption-20260916/` and `supabase/.temp/backups/function-cleanup-20260916/`; they contain no user-data backup. Preserve nullable winners if rolling back after new wild-loss rows have been recorded.

Follow [supabase/README.md](supabase/README.md) for the ongoing migration workflow. Production baseline adoption is complete and must not be repeated.
