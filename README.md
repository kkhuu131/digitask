# Digitask

A productivity app where completing real-life tasks grows your Digimon. Raise a party, evolve its members, fight CPU arena opponents, enter weekly tournaments, and claim achievement rewards.

## Stack

React 18, TypeScript, Vite, React Router, Zustand, Tailwind CSS, Framer Motion, and Supabase (Postgres, Auth, Realtime). Exact dependency versions and commands are in [package.json](package.json).

## Running locally

Use Node.js 20 to match [CI](.github/workflows/ci.yml), and a Supabase project with the tables and RPCs required by the application. The checked-in SQL is a partial backend definition; it is not yet a complete fresh-project setup.

```bash
npm ci
```

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Only needed for scripts that read or update Supabase data:
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

The `VITE_` variables are browser configuration, validated in `src/lib/supabase.ts`. Keep the service role key in script-only configuration; do not prefix it with `VITE_` or commit credentials. `.env.test` contains dummy configuration for tests.

```bash
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). New accounts go through onboarding; returning users see the dashboard.

On Windows, use `npm.cmd` if PowerShell blocks the `npm.ps1` shim.

## Commands

```bash
npm run build         # TypeScript check and production build into dist/
npm run preview       # Preview the production build
npm run lint          # ESLint with zero warnings allowed
npm run format        # Format src/ TypeScript files
npm run format:check  # Check source formatting
npm test              # Run Vitest tests
npm run test:watch    # Watch tests during development
```

The `test:coverage` script also exists, but requires a compatible Vitest coverage provider to be installed.

## Project structure

```text
src/
  App.tsx             # Routes, guards, auth and initialization lifecycle
  main.tsx            # React entry point
  components/         # Shared and feature UI
  pages/              # Route screens
  store/              # Zustand state and domain actions
  engine/             # Arena simulation, types and steering behavior
  constants/          # Generated lookup data, game definitions and content
  hooks/              # React hooks
  lib/supabase.ts     # Supabase client
  types/              # Shared battle and tournament interfaces
  utils/              # Calculations, conversion, lookups and browser helpers
  __tests__/utils/    # Calculation and category-detection tests
public/assets/        # Animated/static sprites, items and fallback images
scripts/              # Data generation, scraping and analysis
supabase/             # Baseline, declarative schema, migrations and reference data
```

Routes are defined in `src/App.tsx`. Main features include the dashboard, DigiDex, arena battles, tournaments, DigiFarm, roster, shop, achievements, profiles and admin screens. `/debug` is enabled only during development.

## Application paths

- Tasks: `Dashboard` → `TaskList` → `CleanTaskList`; mutations go through `taskStore` and Supabase. Task completion calls `complete_task_all_triggers` and grants one battle ticket through `grant_energy_self`.
- Digimon: `petStore` handles party/storage, evolution and progression. Species, evolution paths and forms are imported from generated constants. `digimonStatCalculation.ts` contains stat interpolation and final-stat calculations.
- Arena: `Battle` → `BattleTeamSelector` → `StrategyPicker` → `ArenaBattle`. Teams are converted by `utils/convertToBattleDigimon.ts`. The active entry flow spends one battle ticket through `spend_energy_self`. See [the arena reference](src/engine/ARENA_BATTLE_SYSTEM.md).
- Tournaments: `Tournament` and `tournamentStore` provide weekly entry, opponent selection, rounds and placement rewards.
- Achievements: `AchievementsPage` and `titleStore` handle titles, claims and DigiEgg rewards.
- Shop: `DigimonStorePage`, `inventoryStore` and `currencyStore` handle items, effects and balances.

All database access uses the client in `src/lib/supabase.ts`. Some actions use RPCs; others use direct table writes. Deployed policies, triggers and scheduled jobs must be checked against the live Supabase project when changing persistent game behavior.

Follow [the database workflow](supabase/README.md) for local setup and migrations. See [the live database audit](DATABASE_AUDIT.md) for deployed fixes, cleanup candidates and inherited defects. Production now uses the adopted baseline and tested follow-up migrations.

## Data tools

The following generators overwrite checked-in TypeScript lookup files. The database generators require `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

```bash
node scripts/generate-digimon-lookup.js        # Species data
node scripts/generate-evolution-lookup.js      # Evolution paths
node scripts/generate-digimon-forms-lookup.js  # Form transformations
node scripts/generate-animated-digimon-list.js # Reads sprite folders; no DB access
npm run generate-placeholders                # Writes fallback pet SVGs
npx tsx scripts/analyze-stage-thresholds.ts   # Analyzes checked-in species/evolution data
```

`scripts/scrape-digimon.js` scrapes reference data, downloads sprites, writes `digimon_list.json` and `evolution_data.json`, and updates Supabase. Review it before running because it writes data and assets.

Edit generator inputs or scripts rather than generated lookup files, then review the regenerated diff. Keep fallback images and dynamically named sprite files unless their references have been audited.
