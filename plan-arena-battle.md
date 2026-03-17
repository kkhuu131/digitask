# Arena Battle System — Implementation Plan

Inspired by Digimon World Championship (DS). Replaces the experience of watching a turn log with a real-time top-down arena where Digimon move, orbit, clash, and react organically. Lives alongside the existing interactive battle system for now.

---

## Goals

- Digimon feel alive: they orbit, wander, retreat, and circle rather than beeline
- Fully automatic — no player input during the fight
- Pre-battle strategy selection per Digimon (Aggressive / Balanced / Defensive)
- Camera pans and follows the action
- Responsive via CSS scale (fixed world coords, scaled to container)
- Death feels impactful: bounce-up then collapse to a dead/sleeping sprite
- Reuses existing damage formula, sprite system, and battle infrastructure

---

## New Files

```
src/
  components/
    ArenaBattle.tsx              # Main arena component (world div + overlay)
    ArenaHPBar.tsx               # HP bar absolutely positioned above each Digimon (in world space)
    ArenaDamageEffect.tsx        # Framer Motion floating damage numbers + skill flash (in viewport space)
    StrategyPicker.tsx           # Strategy selection shown after team pick, before fight
  engine/
    arenaEngine.ts               # Core game loop: steering, physics, collision, skill timers
    steeringBehaviors.ts         # Seek, wander, orbit, separation, flee force functions
    arenaTypes.ts                # ArenaDigimon, ArenaEvent, Strategy types
  utils/
    battleCalculations.ts        # EXTRACTED shared logic (see Phase 0 below)
```

**Removed from original plan:**
- ~~`ArenaDiigmonSprite.tsx`~~ — `BattleDigimonSprite.tsx` already does exactly this. Use it directly, positioned absolutely. No wrapper needed.
- ~~`ArenaBattlePage.tsx`~~ — No new route or page. Arena mode integrates into the existing `Battle.tsx` flow as an alternative fight renderer, the same way `InteractiveBattle` does today.

---

## Reused / Unchanged Files

| File | How it's used |
|------|--------------|
| `src/store/battleStore.ts` | Matchmaking, energy deduction, history saving — untouched |
| `src/store/interactiveBattleStore.ts` | Left intact (alongside mode). `convertToBattleDigimon` logic informs `ArenaDigimon` init but is rewritten for the arena type |
| `src/components/BattleDigimonSprite.tsx` | Reused exactly — positioned absolutely in the world div |
| `src/components/BattleTeamSelector.tsx` | **Reused entirely unchanged** — team selection step is identical for arena mode |
| `src/pages/Battle.tsx` | Modified: adds arena mode path alongside existing interactive mode |
| `src/utils/digimonStatCalculation.ts` | `calculateFinalStats` — unchanged |
| `src/utils/battleCalculations.ts` | **New in Phase 0** — extracted from existing files (see below) |

---

## Phase 0 — Extract Shared Code First (prerequisite)

Before writing any arena code, fix an existing code smell that the arena would make worse.

**The problem:** The damage formula and type/attribute advantage maps currently live in three places:
1. `battleStore.ts` — exports `TypeAdvantageMap`, `AttributeAdvantageMap`, `baseDamage`, `missChance`, `criticalHitChance`, `calculateCritMultiplier`
2. `interactiveBattleStore.ts` — imports the constants but reimplements `calculateDamage` as a private local function (not exported)
3. `InteractiveBattle.tsx` — has a comment `// Type and Attribute advantage maps (copied from battleStore.ts)` and duplicates both maps entirely

**The fix:** Create `src/utils/battleCalculations.ts` and move there:
- `calculateDamage(attacker, target)` — extracted from `interactiveBattleStore.ts`, now exported
- Remove the duplicate map copy from `InteractiveBattle.tsx` and import from `battleStore.ts` instead (or from `battleCalculations.ts`)

This means `arenaEngine.ts` can import `calculateDamage` cleanly without touching `interactiveBattleStore.ts` at all.

`BattleDigimon` from `src/types/battle.ts` is the input type for `calculateDamage`. The arena uses its own `ArenaDigimon` type (defined in `arenaTypes.ts`) but includes the same stats fields, so `calculateDamage` works on it with a minimal adapter.

---

## Coordinate System

**World size: 1400 × 520 units. Viewport size: 900 × 380 units.**

All game logic runs in world coordinates. The viewport is a clipped window into the world. The camera pans the world within the viewport to follow the action — this only works if the world is *larger* than the viewport. (The original plan had them equal, which means zero camera travel — fixed here.)

```
World:  (0,0) ──────────────────────────── (1400,0)
               │                          │
               │  [viewport: 900×380]     │
               │  moves within here ──>   │
               │                          │
        (0,520) ──────────────────────── (1400,520)
```

User team spawns left side (x: 100–250, y: 160–360, scattered). Opponent team spawns right side (x: 1150–1300, y: 160–360). Both sides charge toward center at fight start.

**Responsiveness:** The viewport div gets `transform: scale(containerWidth / 900)` applied via CSS, scaling the entire rendered output to fit the container. All engine math stays in fixed world units — no % coordinates needed anywhere.

---

## Arena Background (CSS Only)

```
Viewport container:  overflow-hidden, dark near-black background with subtle blue-purple gradient
World div:           1400×520, the full scrollable world (clipped by viewport)
Arena floor:         A large rounded rectangle centered in the world — earthy/sandy CSS gradient,
                     darker at edges (radial gradient) to give depth
Floor grid lines:    Faint horizontal and vertical lines at ~80px spacing — subtle, not distracting
Side indicators:     Left edge glowing blue strip (user side) / right edge glowing red strip (opponent side)
                     These are world-space decorations that scroll with the camera
Vignette:            CSS box-shadow inset on the viewport container (viewport-space, doesn't scroll)
```

No images. Pure CSS/Tailwind + inline styles.

---

## Engine Architecture (`arenaEngine.ts`)

### ArenaDigimon (lives in a ref, never React state)

```typescript
interface ArenaDigimon {
  // Identity
  id: string;
  name: string;
  digimon_name: string;
  sprite_url: string;
  type: string;       // DigimonType — for damage calc
  attribute: string;  // DigimonAttribute — for damage calc
  isUserTeam: boolean;

  // Physics
  x: number; y: number;    // world position (center of sprite)
  vx: number; vy: number;  // velocity (world units / ms)

  // Combat stats (mirrors BattleDigimon.stats for calculateDamage compatibility)
  hp: number; maxHp: number;
  atk: number; def: number;
  int: number; spd: number; sp: number;

  // State machine
  state: 'approaching' | 'circling' | 'attacking' | 'retreating' | 'skill_windup' | 'dead';
  attackCooldownMs: number;    // ms until next normal attack allowed
  skillCooldownMs: number;     // ms until skill fires
  retreatTimerMs: number;      // how long left in retreat state
  skillWindupTimerMs: number;  // how long left in skill windup
  deathBounceVy: number;       // vertical velocity during death bounce (0 when not in use)
  deathLanded: boolean;        // true once bounce settles

  // Steering
  wanderAngle: number;            // current wander heading offset (radians)
  currentTargetId: string | null;
  lastAttackerTeam: 'user' | 'opponent' | null; // for flee direction

  // Strategy
  strategy: 'aggressive' | 'balanced' | 'defensive';

  // Sprite state (read by React renderer, mutated by engine)
  spriteState: 'idle' | 'attacking' | 'hit' | 'dead';
}
```

### Strategy Constants

| Parameter | Aggressive | Balanced | Defensive |
|-----------|-----------|---------|-----------|
| Speed multiplier | 1.3 | 1.0 | 0.8 |
| Attack cooldown base (ms) | 1200 | 1800 | 2400 |
| Skill cooldown base (ms) | 10000 | 15000 | 18000 |
| Orbit radius (world units) | 80 | 130 | 170 |
| Flee duration (ms) | 400 | 700 | 1100 |
| Seek weight | 0.9 | 0.75 | 0.55 |
| Orbit weight | 0.4 | 0.65 | 0.85 |
| Wander weight | 0.25 | 0.35 | 0.45 |

Speed is also scaled by `digimon.spd / 150` so faster Digimon actually move faster in the arena.

---

## Steering Behaviors (`steeringBehaviors.ts`)

Each function returns `{ fx: number; fy: number }`. The engine blends them with weights each frame.

### 1. Seek
Accelerate toward a target position.
```
direction = normalize(targetPos - position)
force = direction × seekStrength
```

### 2. Wander
Projects a circle 60 units ahead; picks a point on its edge based on `wanderAngle`. Each frame jitters `wanderAngle` by ±0.15 rad randomly. If velocity is near zero (Digimon just spawned), uses a random forward direction.
```
circleCenter = position + normalize(velocity) × 60
displacement = [cos(wanderAngle), sin(wanderAngle)] × 35
wanderTarget = circleCenter + displacement
force = normalize(wanderTarget - position) × wanderStrength
```
This produces organic curved drifting even when heading directly at an enemy.

### 3. Separation
For each ally within 60 world units: add a repulsion force inversely proportional to distance. Prevents 3 Digimon from stacking into one blob.

### 4. Orbit
When within `orbitRadius` of the current target enemy, adds a perpendicular force — 90° offset from the seek direction — causing circling before closing in.
```
toTarget = normalize(enemyPos - position)
perpendicular = [-toTarget.y, toTarget.x]          // rotate 90°
orbitFactor = 1 - (distance / orbitRadius)         // fades as they close in
force = perpendicular × orbitStrength × orbitFactor
```
At max orbit distance: mostly orbiting. As distance shrinks toward attack range: orbit fades, seek dominates → they spiral in naturally and make contact.

### 5. Flee
When in `retreating` state: force directly away from the opposing team's centroid. Weight starts at 1.0 and linearly decays to 0 as `retreatTimerMs` counts down.

---

## Game Loop (`arenaEngine.ts`)

`runFrame(deltaMs: number): ArenaEvent[]` — pure function called each RAF tick. Returns events that occurred this frame; the caller (React component) handles them.

```
events = []

for each alive ArenaDigimon:

  1. Find nearest living enemy → set as currentTarget
     (if no enemies alive, skip — battle_end will have been emitted)

  2. Compute distance to currentTarget

  3. Determine state transitions (priority order):
     a. state == 'dead'             → skip all logic below, handle death bounce only
     b. skillCooldown <= 0          → state = 'skill_windup', reset skillWindupTimer
     c. state == 'skill_windup' AND skillWindupTimer <= 0
                                    → emit damage event (2.5× multiplier), state = 'approaching'
     d. state == 'retreating' AND retreatTimer <= 0
                                    → state = 'approaching'
     e. distance < ATTACK_RADIUS (50 units) AND attackCooldown <= 0 AND state != 'skill_windup'
                                    → emit normal damage event, state = 'attacking' briefly,
                                       reset attackCooldown, set retreatTimer (short knockback retreat)
     f. distance < orbitRadius      → state = 'circling'
     g. else                        → state = 'approaching'

  4. Compute forces based on state:
     approaching:  seek × seekW  +  wander × 0.3  +  separation × 0.5
     circling:     seek × 0.25   +  wander × 0.2  +  orbit × orbitW  +  separation × 0.5
     retreating:   flee × 1.0    +  wander × 0.4
     skill_windup: no forces (Digimon stands still while charging)
     attacking:    no forces (brief lock during attack animation)

  5. Apply forces → velocity → position:
     vx += fx * deltaMs * speedMultiplier * (spd / 150)
     vy += fy * deltaMs * speedMultiplier * (spd / 150)
     vx *= 0.88  (damping/friction)
     vy *= 0.88
     x += vx * deltaMs
     y += vy * deltaMs

  6. Clamp to world bounds (with 30-unit margin from edges)

  7. Decrement all timers by deltaMs

for each dead ArenaDigimon WHERE deathLanded == false:
  deathBounceVy += 0.4 * deltaMs   (gravity)
  y += deathBounceVy * deltaMs
  if y >= originalY:
    y = originalY
    deathLanded = true
    spriteState = 'dead'

check battle_end: if all user-team dead → emit { type: 'battle_end', winner: 'opponent' }
                  if all opponent-team dead → emit { type: 'battle_end', winner: 'user' }

return events
```

### ArenaEvent types

```typescript
type ArenaEvent =
  | { type: 'damage'; attackerId: string; targetId: string; damage: number;
      isCritical: boolean; isMiss: boolean; isSkill: boolean;
      targetX: number; targetY: number }   // world coords for effect placement
  | { type: 'death'; digimonId: string }
  | { type: 'battle_end'; winner: 'user' | 'opponent' }
```

Target world coordinates are included in damage events so `ArenaDamageEffect` can convert to viewport space.

---

## Damage Calculation

Import `calculateDamage(attacker, target)` from `src/utils/battleCalculations.ts` (extracted in Phase 0). The function signature stays the same as in `interactiveBattleStore.ts` today. `ArenaDigimon` satisfies the input type since it has the same `stats`, `type`, and `attribute` fields.

Skill hits: pass the result's `damage` × **2.5** before applying.

Attack cooldown (ms) = `strategyBase / (digimon.spd / 100)` — faster Digimon attack more frequently.

Skill cooldown (ms) = `strategyBase - (digimon.sp / 2)` — higher SP shortens the skill recharge, clamped to a minimum of 6000ms.

---

## Camera System

The camera tracks the centroid of all living Digimon with smooth lerp. **Critical:** camera offset is stored in a ref and applied directly to the DOM element — not React state — so it doesn't trigger re-renders every frame.

```typescript
// Refs (not state):
const cameraRef = useRef({ x: 0, y: 0 });
const worldDivRef = useRef<HTMLDivElement>(null);

// Each RAF frame (after running engine):
const centroidX = average(alive digimon x);
const centroidY = average(alive digimon y);

const targetX = clamp(centroidX - VIEWPORT_W / 2, 0, WORLD_W - VIEWPORT_W);
const targetY = clamp(centroidY - VIEWPORT_H / 2, 0, WORLD_H - VIEWPORT_H);

cameraRef.current.x += (targetX - cameraRef.current.x) * 0.04;
cameraRef.current.y += (targetY - cameraRef.current.y) * 0.04;

// Direct DOM mutation — no setState:
if (worldDivRef.current) {
  worldDivRef.current.style.transform =
    `translate(-${cameraRef.current.x}px, -${cameraRef.current.y}px)`;
}
```

HP bars are positioned in world space inside the world div — they naturally follow their Digimon with no extra math.

Damage number effects need viewport-space coordinates: `viewportX = worldX - cameraRef.current.x`, `viewportY = worldY - cameraRef.current.y`.

---

## React Components

### `ArenaBattle.tsx`

Owns:
- `useRef<ArenaDigimon[]>` — authoritative game state (mutated by engine each frame)
- `useRef<number>` — RAF handle
- `useRef<{ x, y }>` — camera offset (mutated each frame, DOM-applied directly)
- `useRef<HTMLDivElement>` — the world div (for direct transform mutation)
- `useState<HPSnapshot>` — `{ [id]: { hp, maxHp } }` — updated ONLY on damage events
- `useState<DamageEffect[]>` — floating number queue for Framer Motion
- `useState<Set<string>>` — dead Digimon IDs (for fade/sprite swap)
- `useState<'fighting' | 'complete'>` — battle phase

On mount: init `ArenaDigimon[]` from teams + strategies, start RAF loop.
On unmount: cancel RAF.

Layout:
```
<div className="overflow-hidden relative" style={{ width: 900, height: 380 }}>
  {/* CSS scale wrapper for responsiveness — wraps the viewport div */}

  {/* World div — moves with camera via direct DOM mutation */}
  <div ref={worldDivRef} style={{ width: 1400, height: 520, position: 'absolute' }}>
    {/* CSS arena background (floor, grid lines, side strips) */}

    {/* Digimon sprites — absolutely positioned in world space */}
    {digimon.map(d => <BattleDigimonSprite ... style={{ left: d.x, top: d.y }} />)}

    {/* HP bars — absolutely positioned in world space, follow sprites naturally */}
    {digimon.map(d => <ArenaHPBar ... style={{ left: d.x, top: d.y - 20 }} />)}
  </div>

  {/* Viewport-space overlay — does NOT scroll with camera */}
  <div className="absolute inset-0 pointer-events-none">
    {/* Damage number effects */}
    <ArenaDamageEffect effects={damageEffects} />

    {/* Battle log strip at bottom */}
    {/* Team HP summary headers at top */}
  </div>
</div>
```

**Note:** Digimon sprite positions are driven by the game ref, not React state. Each RAF tick mutates the ref. The React tree only re-renders when discrete events (HP change, death) update `HPSnapshot` or `deadIds` state. Sprite DOM elements are positioned via the world div's layout — a future optimization could also direct-mutate sprite positions for truly zero React re-renders, but this is only needed if performance issues arise.

### `StrategyPicker.tsx`

Shown AFTER `BattleTeamSelector` (team already selected), BEFORE `ArenaBattle` starts. Receives the already-selected `UserDigimon[]` team.

Shows each of the user's 3 Digimon with:
- Sprite + name (reuses `DigimonSprite`)
- Strategy button group: Aggressive / Balanced / Defensive (default: Balanced)
- One-line description of each strategy
- "Fight!" button

Does NOT re-do team selection — `BattleTeamSelector` handles that upstream, unchanged.

### `ArenaDamageEffect.tsx`

Framer Motion `AnimatePresence` list. Each effect has a unique key (timestamp + target ID) and auto-removes after animation completes.

- Normal hit: white text, floats up 50px, fades out over 800ms
- Critical hit: yellow text, 1.4× size, brief scale pop then floats + fades
- Miss: grey italic "MISS", smaller
- Skill hit: attribute-colored glow behind the number (Fire=orange, Water=blue, etc.), 1.6× size, longer linger
- Positioned in viewport space: `left: worldX - cameraX`, `top: worldY - cameraY`

### `ArenaHPBar.tsx`

Thin bar (width ~60px) in world space above each Digimon. Green → yellow → red as HP drops (CSS transition on width). Shows Digimon name in small text. Fades to 0 opacity on death event.

---

## Pre-Battle Flow

The existing `Battle.tsx` flow is:
```
Options screen → BattleTeamSelector → InteractiveBattle
```

The arena flow reuses the first two steps unchanged and swaps the third:
```
Options screen → BattleTeamSelector (unchanged) → StrategyPicker (new) → ArenaBattle (new)
```

Both modes share the same difficulty options, team selector, energy cost, history saving, and `onBattleComplete` callback interface. The only difference is what renders after team confirmation.

---

## Integration into `Battle.tsx`

**No new route. No new page.** Changes to `Battle.tsx` only:

1. Add `battleMode` state: `'arena' | 'interactive'` (default: `'arena'` since it's the new primary mode)
2. Add a small mode toggle in the Arena tab header (e.g., two buttons: "Arena" / "Classic")
3. After `handleConfirmTeam`: branch on `battleMode`
   - `'arena'`: set `showStrategyPicker = true`, passing selected team
   - `'interactive'`: existing `startInteractiveBattle(...)` path, unchanged
4. On `StrategyPicker` confirm: start arena with teams + strategies
5. `handleArenaBattleComplete` mirrors `handleInteractiveBattleComplete` exactly — same energy already spent, same DB writes, same bits reward. No changes to the bookkeeping logic.
6. Energy cost: **1 ticket** (`spend_energy_self({ p_amount: 1 })`) — same as today. (The original plan incorrectly said 20; the actual code uses 1 ticket.)

---

## Implementation Order

### Phase 0 — Extract shared code (prerequisite, ~1 hour)
1. Create `src/utils/battleCalculations.ts`
   - Move `calculateDamage` out of `interactiveBattleStore.ts`, export it
   - Remove the duplicate `TypeAdvantageMap`/`AttributeAdvantageMap` copy from `InteractiveBattle.tsx`; import from `battleStore.ts`
   - Update `interactiveBattleStore.ts` to import `calculateDamage` from `battleCalculations.ts`
   - No behavior changes — pure refactor

### Phase 1 — Engine foundation (no visuals)
2. `src/engine/arenaTypes.ts` — `ArenaDigimon`, `ArenaEvent`, `Strategy` types
3. `src/engine/steeringBehaviors.ts` — 5 force functions, verified via console logging
4. `src/engine/arenaEngine.ts` — full game loop, `runFrame(deltaMs)` returning events, death bounce

### Phase 2 — Arena visual shell
5. `src/components/ArenaBattle.tsx` — viewport + world divs, CSS background, RAF loop wired to engine, sprites positioned in world space, direct DOM camera mutation
6. `src/components/ArenaHPBar.tsx` — HP bars in world space
7. Verify camera lerp feels dynamic — tune lerp factor (currently 0.04, may need adjustment)
8. Hook up sprite state (idle/attacking/hit/dead) driven by engine's `spriteState` field

### Phase 3 — Effects and polish
9. `src/components/ArenaDamageEffect.tsx` — floating damage numbers with Framer Motion, viewport-space positioning
10. Death bounce animation wired end-to-end (engine physics → sprite swap to `sad2` → HP bar fade)
11. Skill windup visual: Framer Motion pulse on the charging Digimon, then colored flash on target

### Phase 4 — Strategy and integration
12. `src/components/StrategyPicker.tsx` — strategy selection UI using already-selected team
13. Modify `Battle.tsx`: add mode toggle, arena battle path, `handleArenaBattleComplete`
14. End-to-end test: Options → BattleTeamSelector → StrategyPicker → ArenaBattle → result → history saved in DB
15. Verify 1 ticket deducted, bits awarded, `team_battles` row inserted, title checks run

### Phase 5 — Feel pass
16. Tune steering weights — fights should feel chaotic but readable; Digimon should visibly circle and orbit, not clump
17. Tune attack/skill cooldowns — target fight duration: 30–90 seconds for 3v3
18. CSS background polish — floor gradient, grid opacity, side glow strips, vignette
19. Responsive scale test — verify scale transform at 375px, 768px, 1280px widths
20. Verify mobile works as a spectator (no interaction needed, just viewport scaling)

---

## Open Questions for Later

- **Sounds**: Architecture supports it — call `new Audio(...)` in the event handler. No scope now.
- **Arena background art**: CSS for now; replace the background div with an `<img>` or CSS background-image when art is ready.
- **Campaign integration**: Once arena is proven, `Campaign.tsx` can adopt `ArenaBattle` in place of `InteractiveBattle`.
- **Tournament**: `Tournament.tsx` (untracked) is designed for the same flow and can adopt the arena component.
- **Replacing interactive mode**: After arena is stable, delete `InteractiveBattle.tsx`, `interactiveBattleStore.ts`, and clean up `Battle.tsx`.

---

## What We Are NOT Building (yet)

- Player commands during battle
- Obstacles or arena hazards
- Multi-hit combos or combo animations
- Animated attack projectiles (skill burst is a Framer Motion flash, not a moving object)
- Sound
- Mobile touch controls (spectator-only on mobile)
- Zooming in/out dynamically (fixed scale per viewport width)
