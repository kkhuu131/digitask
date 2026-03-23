# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # Start Vite dev server (also runs the Bokomon API middleware)

# Build & lint
npm run build         # tsc + vite build
npm run lint          # ESLint with zero warnings allowed
npm run preview       # Preview the production build locally

# Tests (vitest)
npm test              # Run all tests once — used by CI
npm run test:watch    # Watch mode for local development
npm run test:coverage # Run with coverage report
# Test files live in src/__tests__/utils/ — pure utility unit tests (39 tests)
# .env.test provides dummy Supabase credentials so store imports don't throw during tests

# Data-generation scripts (require SUPABASE_SERVICE_ROLE_KEY in .env, except animated list)
node scripts/generate-digimon-lookup.js        # Regenerates src/constants/digimonLookup.ts from DB
node scripts/generate-evolution-lookup.js      # Regenerates src/constants/evolutionLookup.ts from DB
node scripts/generate-digimon-forms-lookup.js  # Regenerates src/constants/digimonFormsLookup.ts from DB
node scripts/generate-animated-digimon-list.js # Regenerates src/constants/animatedDigimonList.ts from public/assets/animated_digimon/ (no DB needed)
npm run generate-placeholders                  # Alias for node scripts/generate-pet-placeholders.js
```

## Environment Variables

Requires a `.env` file with:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # Only needed when running data-generation scripts
```

`.env.test` (committed) provides dummy credentials so `npm test` can import store files without Supabase throwing. Do not put real credentials in `.env.test`.

CI (`github/workflows/ci.yml`) reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from GitHub repository secrets for the build step.

## Architecture Overview

**Digitask** is a productivity app that gamifies task completion using Digimon as virtual pets. Users create real-life tasks; completing them gives EXP and stat gains to their active Digimon.

### Stack
- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Framer Motion
- **State**: Zustand stores (one per domain)
- **Backend/DB**: Supabase (Postgres + Auth + Realtime subscriptions)
- **Routing**: React Router v6

### Directory Structure

```
src/
  App.tsx             # Root router, auth init sequence, protected routes
  __tests__/          # Vitest unit tests (mirrors src/ structure)
    utils/            # Tests for pure utility functions
  store/              # Zustand stores (one per domain)
  pages/              # Route-level components
  components/         # Shared/feature components
  engine/             # Arena battle engine (physics loop, steering, state machine)
  utils/              # Pure logic (stat calc, evolution helpers, sprite manager)
  constants/          # Pre-generated lookup tables (see "Local Constants Pattern" below)
  hooks/              # Custom React hooks
  lib/supabase.ts     # Supabase client singleton
  types/              # Shared TypeScript types
public/assets/
  animated_digimon/   # Sprite sheets organized by Digimon name (idle1/2, attack, happy, etc.)
  digimon/            # Static dot sprites used in battle/dex
scripts/              # Node scripts to regenerate src/constants/ lookup files
```

### Local Constants Pattern (Important)

Digimon species data and evolution paths are **not queried from Supabase at runtime**. Instead, they are embedded as TypeScript constants in `src/constants/` and imported directly. This was intentional — the data changes very rarely, and keeping it local eliminates DB round-trips on every page load.

The constants directory contains:
| File | Source | Regenerate with |
|------|--------|-----------------|
| `digimonLookup.ts` | `digimon` table | `generate-digimon-lookup.js` |
| `evolutionLookup.ts` | `evolution_paths` table | `generate-evolution-lookup.js` |
| `digimonFormsLookup.ts` | `digimon_forms` table | `generate-digimon-forms-lookup.js` |
| `animatedDigimonList.ts` | `public/assets/animated_digimon/` folders | `generate-animated-digimon-list.js` |
| `campaignOpponents.ts` | Hardcoded — legacy campaign CPU teams (campaign mode removed; file unused) | (manual) |
| `tournamentBossTeams.ts` | Hardcoded — tournament opponent team pool | (manual) |
| `storeItems.ts` | Hardcoded — in-game shop items | (manual) |
| `titles.ts` | Hardcoded — user title definitions (mirrors `titles` DB table) | (manual) |
| `updateInfo.ts` | Hardcoded — patch notes content | (manual) |

**When Digimon/evolution data changes in the DB, run the relevant generation script to sync the constants.** All constants files are marked `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.`

### Key Stores (`src/store/`)

| Store | Purpose |
|-------|---------|
| `petStore` | Active Digimon state, evolution/devolution, stats, feeding, party & storage management |
| `authStore` | Supabase auth session (`user` is Supabase `User` type; `userProfile` is the app profile), admin status |
| `taskStore` | Tasks CRUD, daily quota, overdue checks, streak EXP multiplier. Calls `complete_task_all_triggers` RPC |
| `battleStore` | Wild AI team generation, battle options caching, battle history, energy management |
| `interactiveBattleStore` | Interactive (turn-by-turn) battle mode — SPD-ordered turns, AI targeting, damage pipeline |
| `tournamentStore` | Weekly tournament: unlock gating (10 tasks), bracket generation, round results, placement bits |
| `milestoneStore` | **Deprecated** — legacy ABI-based Digimon claiming. Still used by `MilestoneProgress.tsx`; superseded by `titleStore` + `AchievementsPage` |
| `titleStore` | Fetches/awards user titles from `user_titles` table; checks unlock conditions after game events |
| `inventoryStore` | Inventory management (`user_inventory` table) |
| `currencyStore` | In-game currency (`user_currency` table — bits and digicoins) |
| `notificationStore` | In-app notification queue |
| `onboardingStore` | Onboarding flow state |
| `battleSpeedStore` | Persisted battle animation speed preference |
| `themeStore` | Light/dark theme preference |

### Database Tables

All tables are in the `public` schema with RLS enabled.

| Table | Rows | Purpose |
|-------|------|---------|
| `tasks` | ~712 | User tasks. Columns: `category` (HP/SP/ATK/DEF/INT/SPD), `difficulty` (easy/medium/hard), `priority` (low/medium/high), `is_daily`, `recurring_days` (text[]), `due_date`, `notes` |
| `digimon` | 411 | Species definitions. Has `hp/sp/atk/def/int/spd` (level-50 base), `*_level1` and `*_level99` cols for stat interpolation |
| `evolution_paths` | 956 | Evolution requirements: `level_required`, `stat_requirements` (JSONB), `dna_requirement` (digimon.id FK), `item_requirement` |
| `digimon_forms` | 96 | Form transformations (X-Antibody etc.): `base_digimon_id`, `form_digimon_id`, `form_type`, `unlock_condition` |
| `user_digimon` | ~296 | User-owned Digimon. Bonus stat cols: `hp/sp/atk/def/int/spd_bonus`. Also: `abi`, `personality`, `is_active`, `is_on_team`, `is_in_storage`, `has_x_antibody`, `happiness` |
| `user_discovered_digimon` | ~1888 | Digimon seen/unlocked by user — powers the Digimon dex |
| `profiles` | ~49 | User profile. Key cols: `saved_stats` (JSONB — pending unallocated stat points), `battle_energy`, `max_battle_energy`, `battles_won`, `battles_completed`, `highest_stage_cleared`, `has_completed_onboarding`, `last_arena_first_win` |
| `daily_quotas` | ~49 | Daily task tracking (one row per user, unique on `user_id`): `completed_today`, `current_streak`, `longest_streak`, `consecutive_days_missed`, `penalized_tasks` |
| `task_history` | ~426 | Historical daily task counts per user. Populated by `process_daily_quotas` cron. Used by TaskHeatmap and Dashboard |
| `battle_limits` | ~26 | Per-user daily battle tracking: `battles_used`, `last_reset_date` |
| `team_battles` | ~441 | Battle records: `user_team`, `opponent_team`, `turns` (JSONB turn log), `winner_id`, `opponent_id` (null for wild) |
| `user_milestones` | ~37 | Milestone tracking per user: `daily_quota_streak`, `tasks_completed_count`, `last_digimon_claimed_at`. Updated by DB trigger |
| `titles` | 29 | Title definitions (mirrors `src/constants/titles.ts`) |
| `user_titles` | ~206 | Titles earned by users: `title_id`, `earned_at`, `is_displayed` |
| `user_currency` | ~31 | `bits` (default 2000) and `digicoins` per user |
| `user_inventory` | ~69 | Items owned: `item_id` (references `storeItems.ts`), `quantity`, `item_type` |
| `admin_users` | 1 | Admin whitelist |
| `reports` | 0 | User abuse reports (pending/resolved): `reporter_id`, `reported_user_id`, `reason`, `category`, `status`, `admin_notes` |

### Core Game Logic

**Stat calculation** (`src/utils/digimonStatCalculation.ts`):
- Base stats are interpolated piecewise between known values at levels 1, 50, and 99
- Bonus stats from tasks are added on top; personality gives a 5% boost to one stat
- Formula: `finalStat = baseStat(level) + bonus * personality_multiplier`

**ABI (Ability/Aptitude) stat**:
- Every `UserDigimon` has an `abi` field
- Controls the **total bonus stat cap** per Digimon: `calculateBonusStatCap(abi) = 20 + abi`
- ABI is earned through evolution/devolution cycles: evolution grants `Math.floor(level / 10) + 1` ABI, devolution grants `Math.floor(level / 5) + 1` (more generous — the devolve→re-evolve loop is the primary ABI grind)
- Digimon claiming is now handled by the **Achievements system** (`AchievementsPage`, `titleStore`)

**Task → stat pipeline**:
1. User completes task → `taskStore.completeTask()` → calls `complete_task_all_triggers` RPC
2. RPC marks task done, updates `daily_quotas`, awards EXP to all party Digimon, and handles stat points
3. Stat points from a task depend on `difficulty` (hard = 2 pts, medium = 1 pt, easy = 0 pts) and are limited by the ABI-based total bonus cap on the active Digimon
4. If `autoAllocate=true` and Digimon is under its stat cap, stat goes directly to `user_digimon.*_bonus`; otherwise it's saved to `profiles.saved_stats` for manual allocation later via `allocate_stat()` RPC
5. EXP multipliers: streak (up to 2× at 11+ day streak), difficulty (easy=0.5×, hard=1.5×), priority (low=0.5×, high=1.5×)
6. Active Digimon gets full EXP + happiness boost; non-storage party members get 50% EXP; storage Digimon get 0%

**Saved stats** (`profiles.saved_stats`):
- JSONB object `{HP, SP, ATK, DEF, INT, SPD}` — accumulates unspent stat points
- Allocated to a specific Digimon via `allocate_stat(digimon_id, stat_type, user_id)` RPC
- Displayed to the user for manual distribution when auto-allocate is off or Digimon is at cap

**Battle energy** (`profiles.battle_energy` / `profiles.max_battle_energy`):
- Displayed in Layout, BattleHub, and Battle pages
- Arena battles (standard + interactive) cost **20 energy** each via `spend_energy_self(20)` RPC
- Each completed task restores **+1 energy** via `grant_energy_self(1)` RPC (called in `taskStore.completeTask`)
- Energy can also be granted by admin; max is enforced server-side

**Digimon party & storage**:
- Active party max size is **9**; beyond that, newly claimed Digimon go to storage (`is_in_storage: true`)
- Storage is managed in `petStore` via `storageDigimon`, `moveToStorage`, `moveToActiveParty`, `fetchStorageDigimon`
- Battle team is a subset of the active party (max 3 Digimon with `is_on_team: true`)

**Evolution system**:
- Paths are read from `EVOLUTION_LOOKUP_TABLE` (local constant, not live DB queries)
- `petStore.checkEvolution()` validates level, stat, and optional `abi` requirements
- Evolution resets level to 1 and converts pre-evolution level gains into permanent bonus stats
- Devolution allowed to any previously discovered form
- **DNA Evolution**: `dna_evolve_digimon(digimon_id, to_digimon_id, dna_partner_digimon_id, boost_points, abi_gain)` RPC — consumes (deletes) the DNA partner Digimon
- **Form transformation** (X-Antibody and others): `transformDigimonForm(userDigimonId, toFormId, formType)`, backed by `digimonFormsLookup.ts`. `UserDigimon` tracks `has_x_antibody: boolean`

**Battle simulation** (`battleStore`):
- All arena opponents are wild AI teams generated client-side via `generateBattleOption()`, scaled to the user's power rating at easy/medium/hard difficulty. Real-player matchmaking was removed.
- `calculateUserPowerRating()` averages the top-9 Digimon by combat power, matching the 9-slot party max
- Damage formula: `ATK/DEF` or `INT/INT` (whichever favors the attacker), multiplied by type matchup (Vaccine→Virus→Data→Vaccine triangle, 2.0×/0.5×), attribute matchup (elemental chains, 1.5×), random variance, and SP-based crit chance
- Miss chance (7%) applies to all attacks; `simulateTeamBattle()` runs a full simulation returning the turn log
- Battle options are cached in localStorage and refreshed after each battle or at day rollover
- First-win arena bonus tracked via `check_and_set_first_win_self()` RPC and `profiles.last_arena_first_win` date

**Daily/recurring task reset** (server-side cron):
- `reset_daily_tasks()` — resets `is_completed` on daily/recurring tasks, applies -5 happiness penalty to active Digimon for each uncompleted task
- `process_daily_quotas()` — saves yesterday's `completed_today` to `task_history`, resets `daily_quotas.completed_today` to 0, resets streak if quota (<3 tasks) was not met

**Tournament mode** (`/tournament`, `tournamentStore`):
- Weekly bracket unlocked by completing 10 tasks in the current week
- 3 real rounds (Quarterfinal/Semifinal/Grand Final at easy/medium/hard difficulty) plus 4 visual filler slots to form an 8-team bracket
- Opponents are generated by `pickTournamentOpponent()` using `TOURNAMENT_TEAM_POOL` templates scaled to user's power rating
- Results recorded via `recordRoundResult()`; placement awards bits (100 QF loss → 1500 champion)
- One tournament entry per calendar week (`week_start` key); stale active entries are expired client-side on fetch
- `profiles.highest_stage_cleared` is a legacy column from campaign mode — not actively used

**Titles system** (`titleStore`, `user_titles` table):
- Title definitions in `src/constants/titles.ts` (mirrors the `titles` DB table)
- `titleStore` checks unlock conditions and inserts earned titles into `user_titles`
- `is_displayed = true` marks the active title shown on the user's profile

**App initialization sequence** (`App.tsx`):
1. `checkSession()` → auth
2. `checkOnboardingStatus()`
3. `initializeStore()` (tasks)
4. `fetchUserDigimon()`
- A guard (`isInitializationInProgress`) prevents concurrent re-runs; auth events are debounced 2 seconds

### Supabase Patterns

- All DB access goes through the `supabase` singleton from `src/lib/supabase.ts`
- Realtime subscriptions: `petStore.subscribeToDigimonUpdates()`, `taskStore.subscribeToQuotaUpdates()`
- Row-level security is enforced server-side; game actions use Supabase DB functions rather than raw client writes where possible

### Key DB Functions & Triggers

**Actively called from client code:**
| Function | Called from | Purpose |
|----------|-------------|---------|
| `complete_task_all_triggers(task_id, user_id, auto_allocate)` | `taskStore` | Main task completion. Marks task done, updates quota, awards EXP, allocates stats |
| `allocate_stat(digimon_id, stat_type, user_id)` | `petStore` | Moves a saved stat point from `profiles.saved_stats` to a Digimon's `*_bonus` column |
| `dna_evolve_digimon(digimon_id, to_digimon_id, dna_partner_digimon_id, boost_points, abi_gain)` | `petStore` | DNA evolution — consumes partner Digimon |
| `check_and_increment_battle_limit()` | `battleStore` | Increments daily battle count; returns success + remaining (max 5/day) |
| `check_and_set_first_win_self()` | `battleStore` | Grants first-win bonus if not already claimed today |
| `spend_energy_self(amount)` | `battleStore`, `Battle.tsx` | Deducts `battle_energy` from calling user's profile |
| `grant_energy_self(amount)` | `taskStore` | Restores `battle_energy` (+1 per completed task) |
| `swap_team_members(user_id, digimon_id_1, digimon_id_2)` | `petStore` | Atomically swaps `is_on_team` between two Digimon to prevent two-tab race conditions |
| `is_admin()` | `authStore` | Checks if current user is in `admin_users` |

**Server-side only (cron jobs / triggers):**
| Function/Trigger | When | Purpose |
|-----------------|------|---------|
| `process_daily_quotas()` | Daily cron (PST midnight) | Saves task history, resets quotas, breaks streaks |
| `reset_daily_tasks()` | Daily cron | Resets daily/recurring tasks, applies happiness penalties |
| `level_up_digimon` trigger | BEFORE/AFTER UPDATE on `user_digimon` | Auto levels up Digimon when EXP threshold is reached |
| `assign_personality_to_digimon` trigger | BEFORE INSERT on `user_digimon` | Assigns random personality to new Digimon |
| `ensure_single_active_digimon` trigger | BEFORE INSERT/UPDATE on `user_digimon` | Enforces single active Digimon per user |
| `update_battle_stats` trigger | AFTER INSERT on `team_battles` | Updates `profiles.battles_won` / `battles_completed` |
| `update_completed_today` trigger | AFTER UPDATE on `tasks` | Increments `daily_quotas.completed_today` when task is completed |
| `update_milestone_on_daily_quota` trigger | AFTER UPDATE on `daily_quotas` | Updates `user_milestones` when quota streak changes |

### Animated Sprites

Sprites live in `public/assets/animated_digimon/<DigimonName>/` with standard filenames: `idle1.png`, `idle2.png`, `idle_mouth_open.png`, `attack.png`, `happy.png`, `cheer.png`, `angry.png`, `intimidate.png`, `sad1.png`, `sad2.png`, `sleeping1.png`, `sleeping2.png`.

`spriteManager.ts` checks if a Digimon's name is in `ANIMATED_DIGIMON` (from `src/constants/animatedDigimonList.ts`) to decide whether to serve an animated sprite or fall back to the static dot sprite from `sprite_url`. Run `generate-animated-digimon-list.js` after adding new animated sprite folders.

### Deprecated / Do Not Use

**DB columns that still exist but should not be used in new code:**
- `profiles.display_name` — same as `username`; use `username` instead

**DB functions that are stubs (exist but do nothing):**
- `contribute_boss_progress(user_id, task_points, is_daily_quota)` — weekly boss feature was removed. Kept as a no-op so `complete_task_all_triggers` doesn't need to be rewritten. Do not call directly.

**DB functions that exist but are no longer called by client code:**
- `get_random_users(exclude_user_id)` — was used for real-player PvP matchmaking, which was replaced by wild AI opponents. Still present in the DB but not imported or called anywhere in the codebase.
