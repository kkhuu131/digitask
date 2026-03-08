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

# Tests
# Note: No test files currently exist in the repo. The test runner is configured
# (jest in package.json scripts, vitest also listed as a dependency) but unused.
npm test              # Would run Jest if tests existed

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
VITE_OPENAI_API_KEY=          # For Bokomon AI assistant
SUPABASE_SERVICE_ROLE_KEY=    # Only needed when running data-generation scripts
```

## Architecture Overview

**Digitask** is a productivity app that gamifies task completion using Digimon as virtual pets. Users create real-life tasks; completing them gives EXP and stat gains to their active Digimon.

### Stack
- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Framer Motion
- **State**: Zustand stores (one per domain)
- **Backend/DB**: Supabase (Postgres + Auth + Realtime subscriptions)
- **Routing**: React Router v6
- **AI**: OpenAI via a Vite dev-server middleware (`/api/bokomon`) that is excluded from production builds

### Directory Structure

```
src/
  App.tsx             # Root router, auth init sequence, protected routes
  store/              # Zustand stores (one per domain)
  pages/              # Route-level components
  components/         # Shared/feature components
  utils/              # Pure logic (stat calc, evolution helpers, sprite manager)
  constants/          # Pre-generated lookup tables (see "Local Constants Pattern" below)
  hooks/              # Custom React hooks
  lib/supabase.ts     # Supabase client singleton
  api/bokomonHandler.ts  # OpenAI-backed Bokomon assistant handler
  server/middleware.ts   # Vite dev server middleware for Bokomon API
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
| `campaignOpponents.ts` | Hardcoded — campaign CPU teams | (manual) |
| `storeItems.ts` | Hardcoded — in-game shop items | (manual) |
| `titles.ts` | Hardcoded — user title definitions | (manual) |
| `updateInfo.ts` | Hardcoded — patch notes content | (manual) |

**When Digimon/evolution data changes in the DB, run the relevant generation script to sync the constants.** All constants files are marked `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.`

### Key Stores (`src/store/`)

| Store | Purpose |
|-------|---------|
| `petStore` | Active Digimon state, evolution/devolution, stats, feeding, party & storage management |
| `authStore` | Supabase auth session (`user` is Supabase `User` type; `userProfile` is the app profile), admin status |
| `taskStore` | Tasks CRUD, daily quota, overdue checks, streak EXP multiplier |
| `battleStore` | Battle simulation (vs. CPU wild teams or real players), battle history, daily limits |
| `milestoneStore` | ABI-based Digimon claiming (`canClaimDigimon`, `claimSelectedDigimon`) |
| `notificationStore` | In-app notification queue |
| `inventoryStore` | Inventory management |
| `currencyStore` | In-game currency |
| `weeklyBossStore` | Weekly boss raid |
| `interactiveBattleStore` | Interactive (turn-by-turn) battle mode |
| `themeStore` | Light/dark theme preference |

### Core Game Logic

**Stat calculation** (`src/utils/digimonStatCalculation.ts`):
- Base stats are interpolated piecewise between known values at levels 1, 50, and 99
- Bonus stats from tasks are added on top; personality gives a 5% boost to one stat
- Formula: `finalStat = baseStat(level) + bonus * personality_multiplier`

**ABI (Ability/Aptitude) stat**:
- Every `UserDigimon` has an `abi` field
- Controls the **total bonus stat cap** per Digimon: `calculateBonusStatCap(abi) = 50 + Math.floor(abi / 2)`
- Controls **Digimon claiming**: a new Digimon can be claimed when `getABITotal() >= getABIThreshold()`, where `ABI_MILESTONES = [2, 5, 10, 15, 20, 30, 50, 75, 100, 150, 200]` and the threshold index is based on total owned Digimon count

**Task → stat pipeline**:
1. User completes task → `taskStore.completeTask()` → `petStore.feedDigimon(taskPoints)`
2. Task category (HP/SP/ATK/DEF/INT/SPD) detected via keyword matching (`categoryDetection.ts`) or user selection
3. Active Digimon gains EXP + category-matched bonus stat; non-active party members get 50% EXP; storage Digimon get 0%
4. Daily stat cap per task completion is based on the active Digimon's **stage** (`src/utils/statCaps.ts`): Baby/In-Training → 4, Rookie → 6, Champion → 8, Ultimate → 10, Mega → 12

**Digimon party & storage**:
- Active party max size is **9**; beyond that, newly claimed Digimon go to storage (`is_in_storage: true`)
- Storage is managed in `petStore` via `storageDigimon`, `moveToStorage`, `moveToActiveParty`, `fetchStorageDigimon`
- Battle team is a subset of the active party (max 3 Digimon with `is_on_team: true`)

**Evolution system**:
- Paths are read from `EVOLUTION_LOOKUP_TABLE` (local constant, not live DB queries)
- `petStore.checkEvolution()` validates level, stat, and optional `abi` requirements
- Evolution resets level to 1 and converts pre-evolution level gains into permanent bonus stats
- Devolution allowed to any previously discovered form
- **DNA Evolution** is a separate path: `dnaEvolveDigimon(digimonId, toDigimonId, dnaPartnerDigimonId)` — requires a second Digimon as a DNA partner (`dna_requirement` field on `EvolutionOption`)
- **Form transformation** (X-Antibody and others) is distinct from evolution: `transformDigimonForm(userDigimonId, toFormId, formType)`, backed by `digimonFormsLookup.ts`. `UserDigimon` tracks `has_x_antibody: boolean`

**Battle simulation** (`battleStore`):
- Battle opponents are CPU-generated "Wild Digimon" teams scaled to the user's power rating, with easy/medium/hard difficulty and optional type/attribute theming (30% chance). Real player matchmaking is also available via the `get_opponents_with_digimon` DB function
- Damage formula uses `ATK/DEF` or `INT/INT` (whichever attacker stat is higher), multiplied by type matchup, attribute matchup, a random variance factor, and a critical hit chance based on SP
- Miss chance applies to all attacks
- `simulateTeamBattle()` runs a full turn-by-turn simulation and returns the complete turn log
- Daily battle limit tracked in `battle_limits` table via `check_and_increment_battle_limit` DB function

**Campaign mode** (`/campaign`):
- Separate fixed-progression battle mode using hardcoded opponents in `src/constants/campaignOpponents.ts`
- Distinct from the normal battle hub (`/battles`)

**App initialization sequence** (`App.tsx`):
1. `checkSession()` → auth
2. `checkOnboardingStatus()`
3. `initializeStore()` (tasks)
4. `fetchUserDigimon()`
- A guard (`isInitializationInProgress`) prevents concurrent re-runs; auth events are debounced 2 seconds

### Supabase Patterns

- All DB access goes through the `supabase` singleton from `src/lib/supabase.ts`
- Realtime subscriptions set up in `petStore.subscribeToDigimonUpdates()` and `taskStore.subscribeToQuotaUpdates()`
- Row-level security is enforced server-side; several game actions (battle limits, stat resets, daily quota processing) use Supabase DB functions/triggers rather than client logic
- Key DB functions: `get_opponents_with_digimon`, `check_and_increment_battle_limit`, `process_daily_quotas`, `reset_daily_tasks`, `level_up_digimon`

### Animated Sprites

Sprites live in `public/assets/animated_digimon/<DigimonName>/` with standard filenames: `idle1.png`, `idle2.png`, `idle_mouth_open.png`, `attack.png`, `happy.png`, `cheer.png`, `angry.png`, `intimidate.png`, `sad1.png`, `sad2.png`, `sleeping1.png`, `sleeping2.png`.

`spriteManager.ts` checks if a Digimon's name is in `ANIMATED_DIGIMON` (from `src/constants/animatedDigimonList.ts`) to decide whether to serve an animated sprite or fall back to the static dot sprite from `sprite_url`. Run `generate-animated-digimon-list.js` after adding new animated sprite folders.

### Deprecated Fields

Several DB columns are deprecated and should not be used in new code:
- `user_digimon.daily_stat_gains` / `user_digimon.last_stat_reset` — stat cap now tracked on `profiles`
- `user_digimon.health` — not the same as HP stat; unused
- `profiles.display_name` — same as username
- `team_battles.is_wild_battle`
