# Digitask codebase review

> Historical assessment before the September 16 cleanup. The unused-file and package candidates below have now been removed; active battle conversion and attribute colors were preserved in standalone modules. README and repository guidance were updated, and obsolete turn-based battle documentation was deleted. Other architectural findings remain follow-up work.

Reviewed September 16, 2026. Latest local commit: `670e3e3`, March 23, 2026.

Database follow-up: the live schema and reference data now have a locally verified baseline, declarative sources, generated types and CI checks. Production history adoption, RPC authorization fixes and broken weekly-boss cleanup are complete. See [DATABASE_AUDIT.md](DATABASE_AUDIT.md) and [supabase/README.md](supabase/README.md).

## Assessment

This is a substantial React application with working build tooling and several generations of feature implementations still present. It needs incremental consolidation, rather than a rewrite. The biggest maintenance problems are mixed responsibilities, incomplete database reproducibility, and multiple writers for the same game state. Removing unused files is a useful first step, but will not resolve those problems by itself.

The initial working tree was clean. This review changes no application source or database state. Verification regenerated the ignored `dist/` directory.

## Current structure

| Area | Current role | Assessment |
| --- | --- | --- |
| `src/App.tsx` | Routing, guards, auth lifecycle, initialization, subscriptions, profile setup | Too many responsibilities in one file |
| `src/pages/` | Route screens, including substantial database and game logic | Screens need thinner boundaries |
| `src/components/` | Shared UI and feature-specific UI together | Hard to identify feature ownership; obsolete variants remain |
| `src/store/` | Zustand state, database access, orchestration, calculations and types | Domain stores exist, but depend heavily on one another |
| `src/engine/` | Arena simulation and steering behavior | Useful starting point for an independent game domain |
| `src/utils/` | Calculations, lookups, browser persistence and tutorials | Some pure logic imports stores and their side effects |
| `src/constants/` | Generated species/evolution/form data, game definitions and content | Separate generated data from authored configuration |
| `scripts/` | Scraping, lookup generation and analysis | Useful tools, but lack consistent verification and commands |
| `supabase/` | Partial schema and 18 migrations | Does not contain a complete, reproducible backend definition |
| `public/` | Approximately 10,178 assets, mostly sprites | Only about 4.2 MiB; file count alone is not evidence of waste |
| `.github/workflows/ci.yml` | Type check, lint, format, tests and build | Good baseline |

There are 126 non-declaration TypeScript source/test files. An import trace from `src/main.tsx` reaches 99 modules; three additional files are tests, and 24 are unreachable from that entry. Approximately 39,060 physical lines sit outside `src/constants/` (including tests and declarations). Generated evolution data alone is approximately 1.03 MB and repeats records in four lookup structures.

Existing strengths: strict TypeScript, unused-variable checks, feature-oriented Zustand stores, lazy route imports, an error boundary, checked-in lockfile, CI, consistent source formatting, and calculation tests.

## Verification

| Check | Result |
| --- | --- |
| `npm.cmd test` | 3 files, 39 tests passed |
| `npm.cmd run lint` | Passed |
| `npm.cmd run format:check` | Passed |
| `npm.cmd run build` | Passed; includes TypeScript check |

PowerShell blocks the `npm.ps1` shim; `npm.cmd` works without changing execution policy. Tests/build initially encountered sandbox directory permissions; approved runs outside the sandbox passed.

Build warnings: a main JavaScript chunk of 1,254.93 kB (235.86 kB gzip), mixed static/dynamic imports of `authStore`, and stale Browserslist data. The damage tests log a caught `localStorage is not defined` error because importing calculation code initializes a browser store. A passing test suite is therefore not evidence of clean module isolation.

Not verified: browser workflows, production deployment, live database schema/policies/grants, database rebuild, coverage percentage, dependency vulnerability status, or asset completeness. Installed dependencies were used; a fresh `npm ci` was not performed. No remote service was modified.

## Priority 1: correctness and database ownership

### Make rewards and purchases atomic

Evidence: `src/store/titleStore.ts:288` marks an achievement claimed before granting bits and inserting a selected Digimon. The claim update checks only the row ID, not `claimed_at IS NULL`. Two tabs can both pass the local check and grant rewards. A failure after the first write can leave an achievement claimed without its reward. The fallback currency update also ignores its returned error.

`src/store/tournamentStore.ts:336` has a useful conditional update for round advancement, but awards currency afterward with an unawaited `addCurrency()` call. Round completion can succeed while the payout fails, and the notification still announces the reward.

`src/store/currencyStore.ts:70` and `:95` calculate balances in the browser and write absolute values. Concurrent updates can overwrite each other. Inventory quantities use similar read/modify/write patterns in `src/store/inventoryStore.ts`. Shop operations span separate currency, inventory, stat and ownership writes in `src/pages/DigimonStorePage.tsx`.

Move each operation into a database transaction/RPC: claim achievement, record tournament result with reward, purchase item, consume item and allocate stats. Check eligibility and valid reward choices on the server, use conditional writes or row locks, derive reward amounts there, and return the authoritative updated state. Test retries, two simultaneous callers and partial failure. RLS ownership checks alone do not enforce reward eligibility.

### Give battle statistics one writer

Evidence: `src/pages/Battle.tsx` inserts a `team_battles` row and subsequently reads/increments `profiles.battles_completed` and `battles_won`. `supabase/migrations/add_battle_stats_trigger.sql` also increments these fields after insert. If that trigger is deployed, the page increments the already incremented values, counting a battle twice. The migration's comment implying the trigger runs instead of the client update is misleading.

Choose server ownership and remove the duplicate client increments after confirming the deployed trigger. Persist battle results and rewards together. The current result and payout originate in the client; inspect live policies before concluding how much a user can manipulate them.

### Restore a reproducible database definition

Evidence: most migration filenames have no timestamp/order prefix; multiple files replace `complete_task_all_triggers`. There is no checked-in Supabase local configuration. `schema.sql` lacks a full policy/grant/trigger definition and omits active dependencies such as `user_tournaments`. Client RPCs including `allocate_stat`, `swap_team_members`, `grant_bits_self`, `is_admin` and `update_digimon_exp` have no definitions in the checked-in SQL. The schema also drops `user_titles.is_displayed`, although active code uses it.

Capture the deployed schema, policies, functions, triggers, grants and scheduled jobs. Compare it with the repository, establish an ordered migration baseline without rewriting applied history, and prove that an empty local database can be rebuilt. Add seed/reference data or a documented import path. Do not delete historical migrations because their feature is obsolete.

The checked-in energy migration defines `SECURITY DEFINER` functions accepting arbitrary user IDs without an internal authorization check. Its self-grant function accepts a caller-provided positive amount. Review actual execute grants, RLS and function definitions; restrict privileged mutation entry points and reward amounts. These are repository-level concerns, not verified findings about deployed permissions.

### Consolidate session and subscription lifecycle

Evidence: `src/App.tsx:139` treats the presence of `import.meta.hot` as a hot reload and skips `RequireAuth` checks. In development, the HMR interface exists during ordinary startup too, so this bypasses guards beyond actual reloads. Keep development behavior representative of production.

`taskStore.initializeStore()` creates a quota subscription and discards its cleanup. `App` creates another quota subscription after initialization. Realtime setup is asynchronous, so effect cleanup can also run before unsubscribe handles are assigned. Make one session-scoped owner responsible for creation, cancellation and cleanup.

Sign-out resets only selected fields in auth/pet/task stores. Currency, inventory, titles, tournament data, complete pet collections, quota data and admin status do not all have explicit reset behavior. Browser persistence uses global keys such as `savedStats` and battle-option storage. Add a complete session reset, scope user data caches by user ID, and prevent old in-flight requests from updating the next user's state. Verify sign-out/sign-in as a different account.

## Priority 2: remove unused code and stale dependencies

### Files outside the app import graph

The TypeScript compiler API was used to resolve static imports, exports and literal dynamic imports from `src/main.tsx`, including the `@/` alias. These files are deletion candidates, not files removed by this review. The trace does not prove absence of external consumers or nonliteral loading. Type-only imports were included, making the trace conservative.

| Group | Candidates under `src/` |
| --- | --- |
| Previous task UI | `components/TaskFilters.tsx`, `TaskItem.tsx`, `TaskKanban.tsx`, `TaskLayout.tsx` |
| Previous battle UI | `components/ArenaHPBar.tsx`, `BattleHistory.tsx`, `BattleSpeedControl.tsx`, `InteractiveBattle.tsx`; `pages/BattleHub.tsx`; `store/battleSpeedStore.ts` |
| Previous pet/profile/title UI | `components/DigimonSelectionModal.tsx`, `DigimonTeamManager.tsx`, `StatProgressMeter.tsx`, `TitleSelectionModal.tsx`, `UserTitles.tsx`; `pages/ProfileSettings.tsx`, `UserDigimonPage.tsx` |
| Other abandoned screens | `components/ForgotPassword.tsx`, `pages/AdminDigimonEditor.tsx` |
| Unused helpers/types | `utils/digimonLookup.ts`, `evolutionLookup.ts`, `rateLimiter.ts`, `tutorialContent.ts`; `types/types.ts` |

Delete complete obsolete groups in small commits, then rerun checks and smoke-test the related feature. The active task path is `TaskList` → `CleanTaskList`; the active battle path is `Battle` → `ArenaBattle`. The password route uses `pages/ForgotPassword.tsx`.

Do **not** delete `interactiveBattleStore.ts` along with `InteractiveBattle.tsx`: the active Battle page imports its conversion helper. Extract that helper into the battle domain first, then audit which store exports remain used.

### Dependencies without implementation references

No references were found in source, scripts or configuration for these runtime packages:

```text
@radix-ui/react-dialog       @radix-ui/react-scroll-area
class-variance-authority    clsx
cors                       express
date-fns                   openai
react-datepicker           react-dnd
react-dnd-html5-backend     react-hot-toast
react-tooltip              react-zoom-pan-pinch
tailwind-merge
```

Also review `@types/cors` and `@types/express` after removing their parent packages. Uninstall candidates with npm so the lockfile stays synchronized. They are installed overhead; unused packages are not necessarily in the browser bundle.

Keep `@headlessui/react` (active admin/shop usage), `@tailwindcss/forms` (Tailwind configuration), and `axios`, `cheerio`, `dotenv` (scripts). Move script-only packages and `vitest` to development dependencies where appropriate for the deployment workflow.

### Root files and assets

`digimon_list.json` and `evolution_data.json` are scraper outputs, with no application imports found. Put them in a documented data pipeline location or regenerate/ignore them if reproducible; do not remove them before confirming they are not the only reference dataset.

`image/ui-redesign-plan/` contains tracked design screenshots. Archive under documentation if still useful. `interactive-battle-system.md` is historical documentation; reconcile it with `src/engine/ARENA_BATTLE_SYSTEM.md` and current behavior.

`public/assets/pet/egg.svg` is still an active fallback. The placeholder generator contains a malformed SVG namespace (`xmlns="by this is whttp://www.w3.org/2000/svg"`), while the checked-in egg asset is correct. Fix the generator before regenerating; do not delete the entire pet asset folder based on the old feature name.

Sprite filenames are constructed dynamically and also come from generated records. Build an asset audit that enumerates those paths and documented fallbacks before proposing sprite deletion. A simple search for each filename would produce false positives.

## Priority 3: organize by feature and isolate domain logic

Suggested destination, reached gradually:

```text
src/
  app/                    # router, providers, startup/session lifecycle
  features/
    auth/
    tasks/
    digimon/
    battles/
    tournaments/
    achievements/
    shop/
    profiles/
    admin/
  shared/
    ui/                   # truly shared controls/dialogs/loading states
    lib/                  # Supabase client, persistence adapter
    types/                # generated Database types, cross-domain primitives
  data/
    generated/            # generated species/evolution/form records
```

Each substantial feature can own its pages, components, store, API adapter, domain functions and tests. Add subfolders only when needed. Keep feature imports through a small intentional interface; avoid a giant barrel that imports all stores and recreates startup coupling.

Dependency direction: UI → feature state/application actions → API adapters or pure domain functions. Domain functions should not import React, Zustand, Supabase or browser storage. Shared code should not depend on feature stores.

First extraction targets:

1. `App.tsx`: separate route definitions, guards, session bootstrap and profile/onboarding recovery UI. Replace module-level lifecycle flags with one explicit session lifecycle that handles cancellation and errors.
2. `petStore.ts`: move `Digimon`/`UserDigimon` definitions and pure progression functions out of the store; separate evolution, party operations and database calls.
3. `battleStore.ts`: move matchup maps, damage constants, conversion and opponent generation into pure battle modules. `battleCalculations.ts` currently imports a store, which explains browser initialization during tests.
4. `AdminDigimonManager.tsx`: split forms, species editing, evolution editing and data adapters.
5. `CleanTaskList.tsx`, `ArenaBattle.tsx`, `DigimonStorePage.tsx`: separate domain actions from rendering, and extract coherent UI sections rather than arbitrary line-count fragments.

Large files are a symptom; feature ownership and dependency direction are the goal. For example, a long changelog is less urgent than a shorter module that writes rewards and controls navigation.

## Priority 4: data size, documentation and safeguards

### Generated data

The evolution generator serializes the same records into `all`, `byFrom`, `byTo` and `byPair`. Store records once and derive indexes over IDs or shared references. Keep explicit types instead of a huge literal `as const` structure requiring repeated casts in helpers. Move domain types out of `petStore` so generated data does not depend on a state implementation.

Generation scripts query without explicit stable ordering or pagination. Add deterministic ordering, complete pagination, validation and a formatter step, then verify regeneration has no unrelated diff. Record dataset provenance/version. Varying database row order should not churn a 50,000-line file.

Route splitting already works, but shared stores and data remain eager. Measure the startup dependency graph and reduce eager domain/data imports before adding manual bundle chunks. Optimize the measured main bundle; increasing the warning limit does not improve loading.

### Documentation

README describes an OpenAI/Bokomon API, `src/api/bokomonHandler.ts`, `src/server/middleware.ts` and a Vite middleware plugin that do not exist. `vite.config.ts` only installs the React plugin. Remove the stale feature/setup instructions and reconcile CLAUDE.md with source and the captured database baseline.

README says arena battles cost 20 energy; active `Battle.tsx` spends one ticket. Several previous battle/quota descriptions also belong to older implementations. Document current behavior after choosing its authoritative implementation.

Add `.env.example` with placeholders for required browser configuration and separate script-only variables. The tracked `.env.test` contains apparent placeholder Supabase credentials; do not treat its presence as a secret finding. Remove documentation asking users to prefix a private provider key with `VITE_`.

### Checks and tests

Keep current CI. Add unused-file/dependency detection with explicit application, test, configuration and script entry points; a tool such as Knip can automate the checks after its output is reviewed. Initially run it without blocking releases, then enforce an intentional baseline.

Re-enable `react-hooks/exhaustive-deps` incrementally. ESLint currently disables it along with `no-explicit-any`, `no-empty` and `no-case-declarations`. Fix stale closures and swallowed mutation errors before tightening every style rule. Generate Supabase Database types and use a typed client to reduce handwritten schema drift.

Tests cover calculation utilities only. Prioritize transaction/concurrency tests for claims/purchases/rewards; session switch and subscription cleanup tests; arena engine invariants with controllable randomness; and browser smoke tests for onboarding, task completion, evolution, purchases and battles. Test failure recovery as well as the happy path.

The coverage script has no declared coverage provider and no provider appears in the installed `@vitest` directory. Add a provider compatible with the installed Vitest version and a scoped coverage configuration before relying on that command in CI. Remove `--passWithNoTests` once tests are a required invariant so accidental test disappearance fails visibly.

## Recommended sequence

1. Preserve the passing baseline and capture the deployed database definition. Reconcile current behavior in documentation.
2. Remove the 24 reviewed unused source candidates and unused packages in small groups. Retain historical migration/data provenance.
3. Fix reward transactions, currency concurrency and battle-stat ownership, with focused failure/concurrency tests.
4. Centralize session reset, initialization and realtime cleanup; remove the development guard bypass.
5. Extract pure types/calculations and move one feature at a time, starting with tasks or battles. Keep each move behavior-preserving.
6. Make generated data compact and reproducible, then reassess the startup bundle and asset references.
7. Enforce unused-code checks, typed database access and broader workflow tests after establishing working baselines.

Completion criteria: an empty local database can be built from the repo; each persistent mutation has a single authoritative owner; duplicate requests cannot duplicate rewards; switching accounts leaves no previous account data; generated data reproduces cleanly; and all existing checks plus the new critical-path tests pass.
