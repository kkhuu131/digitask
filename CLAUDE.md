# Repository guidance

Digitask is a React/TypeScript productivity game backed by Supabase. See [README.md](README.md) for setup, commands, architecture paths and data tools, and [the arena reference](src/engine/ARENA_BATTLE_SYSTEM.md) for the active battle engine.

## Verification

```bash
npm run lint
npm run format:check
npm test
npm run build
```

Use `npm.cmd` on Windows if PowerShell blocks the npm script shim. CI uses Node.js 20. Tests use dummy Supabase configuration from `.env.test`; never put real credentials there. The coverage command needs a compatible coverage provider.

## Code and data conventions

- `src/App.tsx` defines routes, route guards and application initialization. Route screens are lazy-loaded.
- Zustand stores live in `src/store/`. Inspect their consumers before removing actions or changing session behavior.
- Database access uses `src/lib/supabase.ts`. Persistent actions include both RPCs and direct writes; do not assume every operation is atomic.
- `src/engine/` contains arena simulation and steering behavior. Team conversion is in `src/utils/convertToBattleDigimon.ts`; attribute glow colors are in `src/constants/battleAttributeColors.ts`.
- Species, evolution, form and animated-sprite lookup data are generated into `src/constants/`. Run the corresponding scripts when their inputs change; do not edit those generated files directly. Other constants are authored game definitions or content.
- Sprite paths are often constructed dynamically or stored in generated data. Filename searches alone cannot establish that an asset is unused.
- `SUPABASE_SERVICE_ROLE_KEY` is for data tools only. Only browser-safe configuration should use the `VITE_` prefix.
- Follow [supabase/README.md](supabase/README.md) for database changes. Edit declarative schemas, generate and review migrations, rebuild locally, regenerate types and run database checks. Production baseline adoption is complete: never replay the baseline there or repeat its history repair. See [DATABASE_AUDIT.md](DATABASE_AUDIT.md) for deployed fixes and remaining cleanup candidates.
