# Arena Battle System — Developer Reference

> **Last updated:** March 2026
> **Scope:** All files under `src/engine/arena*`, `src/components/ArenaBattle.tsx`, `src/components/StrategyPicker.tsx`, `src/components/ArenaDamageEffect.tsx`, and the arena flow wiring in `src/pages/Battle.tsx`.

---

## Table of Contents

1. [Overview](#1-overview)
2. [File Map](#2-file-map)
3. [World & Viewport Coordinates](#3-world--viewport-coordinates)
4. [Engine Constants — Tuning Knobs](#4-engine-constants--tuning-knobs)
5. [ArenaDigimon — State Record](#5-arenadigimon--state-record)
6. [State Machine](#6-state-machine)
7. [Steering Behaviors](#7-steering-behaviors)
8. [Combat System](#8-combat-system)
9. [Physics Loop](#9-physics-loop)
10. [Cinematic System (Zoom + Slow-Motion)](#10-cinematic-system-zoom--slow-motion)
11. [React Architecture — Direct DOM vs State](#11-react-architecture--direct-dom-vs-state)
12. [RAF Game Loop](#12-raf-game-loop)
13. [Camera System](#13-camera-system)
14. [Responsive Scaling](#14-responsive-scaling)
15. [Sprite Facing Direction](#15-sprite-facing-direction)
16. [StatusPanel — HP/Skill Bars](#16-statuspanel--hpskill-bars)
17. [Battle Log Panel](#17-battle-log-panel)
18. [WinnerOverlay & Auto-Advance](#18-winneroverlay--auto-advance)
19. [ArenaResultsScreen (Battle.tsx)](#19-arenaresultsscreen-battletsx)
20. [StrategyPicker](#20-strategypicker)
21. [Battle.tsx — Full Flow Wiring](#21-battletsx--full-flow-wiring)
22. [How to Extend / Tune](#22-how-to-extend--tune)

---

## 1. Overview

The Arena Battle system is a real-time, physics-driven battle engine rendered in React. Digimon move autonomously using steering behaviors, attack each other based on configurable strategies, and the result is displayed with cinematics, HP bars, a battle log, and an animated results screen.

**Key design principle:** The game loop runs at ~60fps using `requestAnimationFrame`. To avoid React re-renders on every frame, all per-frame visual updates (sprite positions, HP/skill bar widths, camera panning, sprite facing, zoom) are applied by **directly mutating DOM element styles** via refs. React state is only updated on discrete events (attack hit, death, battle end).

---

## 2. File Map

| File | Role |
|------|------|
| `src/engine/arenaTypes.ts` | All TypeScript types, interfaces, and tunable constants |
| `src/engine/arenaEngine.ts` | `initArenaDigimon()` + `runFrame()` — pure game logic, no React |
| `src/engine/steeringBehaviors.ts` | Pure functions: `seek`, `wander`, `orbit`, `flee`, `separation` |
| `src/components/ArenaBattle.tsx` | Main React component: RAF loop, DOM mutations, cinematic system, camera |
| `src/components/StrategyPicker.tsx` | Pre-battle strategy selection UI |
| `src/components/ArenaDamageEffect.tsx` | `ATTRIBUTE_COLORS` map (used by windup ring); floating damage effect component is no longer rendered |
| `src/components/BattleDigimonSprite.tsx` | Sprite renderer supporting `'victory'`/`'defeat'`/`'idle'`/`'attacking'`/`'hit'`/`'dead'` states |
| `src/pages/Battle.tsx` | Wires everything: mode toggle, team selection, strategy picker, arena, results screen |

---

## 3. World & Viewport Coordinates

```
World:    1400 × 520 px  (engine logic runs in these coordinates)
Viewport:  900 × 380 px  (the clipped window rendered to the user)
```

The **world div** is absolutely positioned inside the viewport div and shifted by the camera:
```
worldDiv.style.transform = `translate(-${cameraX}px, -${cameraY}px)`
```

Camera X range: `[0, WORLD_W - VIEWPORT_W]` = `[0, 500]`
Camera Y range: `[0, WORLD_H - VIEWPORT_H]` = `[0, 140]`

> ⚠️ The vertical camera travel is only **140px**. Digimon near the top or bottom of the world cannot be perfectly camera-centered. The cinematic zoom compensates by computing the correct `transform-origin` based on the Digimon's actual viewport position after camera clamping — see [Section 10](#10-cinematic-system-zoom--slow-motion).

---

## 4. Engine Constants — Tuning Knobs

All constants live in `src/engine/arenaTypes.ts`.

### World / Viewport

| Constant | Value | Effect |
|----------|-------|--------|
| `WORLD_W` | `1400` | Scrollable world width (world units) |
| `WORLD_H` | `520` | Scrollable world height |
| `VIEWPORT_W` | `900` | Rendered viewport width |
| `VIEWPORT_H` | `380` | Rendered viewport height |
| `ARENA_MARGIN` | `30` | Min distance Digimon must stay from world edges |

### Combat

| Constant | Value | Effect |
|----------|-------|--------|
| `ATTACK_RADIUS` | `55` | Distance (world units) at which a normal attack can land |
| `SKILL_WINDUP_MS` | `700` | ms of charge-up before skill damage fires |
| `SKILL_DAMAGE_MULTIPLIER` | `2.5` | Skill damage = normal damage × this |
| `ATTACK_SPRITE_MS` | `400` | How long the attack sprite is shown |
| `HIT_SPRITE_MS` | `300` | How long the hit sprite is shown |

### Physics

| Constant | Value | Effect |
|----------|-------|--------|
| `SEPARATION_RADIUS` | `68` | Distance within which allied Digimon repel each other |
| `BASE_FORCE` | `0.006` | Base steering force magnitude (world units / ms²) |
| `DAMPING` | `0.88` | Velocity damping per frame — lower = more friction |
| `MAX_SPEED` | `0.5` | Max velocity (world units / ms) |
| `KNOCKBACK_IMPULSE` | `0.8` | Impulse magnitude on a normal hit |
| `KNOCKBACK_SKILL_MULTIPLIER` | `2.2` | Skill knockback = `KNOCKBACK_IMPULSE × 2.2` |
| `KNOCKBACK_DEATH_MULTIPLIER` | `6` | Applied on top of skill/normal knockback for the killing blow |
| `DEATH_BOUNCE_VY_INIT` | `-0.28` | Initial upward velocity on death |
| `DEATH_GRAVITY` | `0.001` | Gravity pulling dead Digimon back down |

### Strategy Configs

| Strategy | Speed | Attack CD | Skill CD | Orbit R | Flee Duration |
|----------|-------|-----------|----------|---------|---------------|
| `aggressive` | 1.35× | 1000ms | 12000ms | 65 wu | 300ms |
| `balanced` | 1.0× | 1500ms | 13000ms | 110 wu | 650ms |
| `defensive` | 0.82× | 2000ms | 15000ms | 145 wu | 900ms |

*(wu = world units)*

---

## 5. ArenaDigimon — State Record

Lives in a React `ref` (never React state) and is mutated directly by the engine each frame.

```ts
interface ArenaDigimon {
  // Identity
  id: string;
  name: string;
  digimon_name: string;
  sprite_url: string;
  type: string;          // DigimonType — fed to calculateDamage
  attribute: string;     // DigimonAttribute — fed to calculateDamage
  isUserTeam: boolean;

  // Physics (world units)
  x: number; y: number;
  vx: number; vy: number;               // steering velocity
  knockbackVx: number; knockbackVy: number;  // independent knockback velocity

  // Combat stats (mirror BattleDigimon.stats)
  hp: number; maxHp: number;
  atk: number; def: number; int: number; spd: number; sp: number;

  // State machine
  state: ArenaDigimonState;
  attackCooldownMs: number;   // ms until next normal attack allowed
  skillCooldownMs: number;    // ms until skill fires (enters windup at 0)
  retreatTimerMs: number;     // ms remaining in retreat state
  skillWindupTimerMs: number; // ms remaining in windup (fires at 0)

  // Death animation
  deathBounceVy: number;
  deathOriginY: number;
  deathLanded: boolean;

  // Steering
  wanderAngle: number;
  currentTargetId: string | null;
  lastAttackerTeam: 'user' | 'opponent' | null;

  // Strategy
  strategy: Strategy;

  // Sprite state (mutated by engine, read by React renderer)
  spriteState: SpriteState;
  spriteTimerMs: number;
}
```

---

## 6. State Machine

Each Digimon cycles through these states every frame (priority order — higher entries take precedence):

```
┌─────────────────┐
│  skill_windup   │ ← No movement; waits for skillWindupTimerMs to hit 0, then fires
└────────┬────────┘
         │ skillCooldownMs ≤ 0 → enter skill_windup
┌────────▼────────┐
│   retreating    │ ← Flee from lastAttackerTeam until retreatTimerMs expires
└────────┬────────┘
         │ dist < ATTACK_RADIUS && attackCooldownMs ≤ 0 → attack (speed race)
┌────────▼────────┐
│    circling     │ ← Within orbitRadius; loops around before closing in
└────────┬────────┘
         │ dist > orbitRadius
┌────────▼────────┐
│   approaching   │ ← Moving toward nearest enemy
└────────┬────────┘
         │ hp ≤ 0
┌────────▼────────┐
│      dead       │ ← Death bounce, then frozen
└─────────────────┘
```

---

## 7. Steering Behaviors

All in `src/engine/steeringBehaviors.ts`. Each returns `{ fx, fy }`.

| Function | Used when | Effect |
|----------|-----------|--------|
| `seek(x, y, tx, ty, force)` | `approaching`, `circling` | Accelerates toward target |
| `wander(x, y, vx, vy, angle, force)` | All non-dead, non-windup | Adds organic randomness |
| `orbit(x, y, cx, cy, radius, force)` | `circling` | Circles around a point |
| `flee(x, y, fx, fy, force)` | `retreating` | Accelerates away from a point |
| `separation(x, y, others[], radius, force)` | Always | Pushes allies apart |

**Force blending by state** (weights from `STRATEGY_CONFIGS[strategy]`):

| State | Blend |
|-------|-------|
| `approaching` | `seekWeight * seek + wanderWeight * wander + separation` |
| `circling` | `0.35 * seek + orbitWeight * orbit + wanderWeight * wander + separation` |
| `retreating` | `fleeDecay * flee + 0.6 * wanderWeight * wander + separation` |

---

## 8. Combat System

### Damage Calculation

Delegates to `calculateDamage()` from `src/utils/battleCalculations.ts`. The engine wraps `ArenaDigimon` into a `BattleDigimon`-shaped adapter object (`toCalcDigimon()`) for compatibility. Accounts for ATK/DEF or INT/INT (whichever the attacker excels at), type matchup, attribute matchup, crit chance (based on SP), and miss chance.

### Speed Race (One Attacker at a Time)

When two Digimon meet and *both* have `attackCooldownMs ≤ 0`, only one wins the right to attack:

```ts
const totalSpd = d.spd + target.spd;
const attackerWins = Math.random() < d.spd / totalSpd;
if (!attackerWins) {
  // Loser gets a short hesitation penalty
  d.attackCooldownMs = 350 + Math.random() * 200;
}
```

Higher SPD → higher probability of striking first. This prevents the "twin orbit lock" where both Digimon endlessly hit each other simultaneously.

### Knockback

On any hit, the target receives a knockback impulse in the direction away from the attacker:

```ts
const dir = normalize(target.x - d.x, target.y - d.y);

// Normal hit
target.knockbackVx = dir.x * KNOCKBACK_IMPULSE;
target.knockbackVy = dir.y * KNOCKBACK_IMPULSE;

// Skill hit
target.knockbackVx = dir.x * KNOCKBACK_IMPULSE * KNOCKBACK_SKILL_MULTIPLIER;
target.knockbackVy = dir.y * KNOCKBACK_IMPULSE * KNOCKBACK_SKILL_MULTIPLIER;
```

On the **killing blow** (HP drops to ≤ 0), knockback is further multiplied by `KNOCKBACK_DEATH_MULTIPLIER = 6` before the `dead` state is set — producing the dramatic death launch.

Knockback velocity decays **independently** from steering velocity each frame (time-normalized so behavior is identical regardless of frame rate):

```ts
const dampFactor = Math.pow(DAMPING, deltaMs / 16);
d.knockbackVx *= dampFactor;
d.knockbackVy *= dampFactor;
d.x += d.knockbackVx * deltaMs;
d.y += d.knockbackVy * deltaMs;
```

### Skill Charge (SP-Driven)

```ts
d.skillCooldownMs -= deltaMs * (1 + d.sp / 300);
```

| SP value | Drain rate | Effect |
|----------|-----------|--------|
| 0 | 1.0× | Baseline charge speed |
| 150 | 1.5× | 50% faster |
| 300 | 2.0× | Twice as fast |

**Initial skill cooldown** is staggered: `config.skillCooldownBase + Math.random() * 5000` — prevents all Digimon from firing skills simultaneously at battle start.

After firing, resets to: `config.skillCooldownBase + Math.random() * 3000`.

---

## 9. Physics Loop

Per-Digimon, each frame in `runFrame()`:

1. Decrement timers: `attackCooldownMs`, `skillCooldownMs` (SP-scaled), `retreatTimerMs`, `skillWindupTimerMs`, `spriteTimerMs`
2. If `dead`: apply death bounce gravity only → skip rest
3. Find nearest living enemy
4. Run state machine (priority order — Section 6)
5. Compute blended steering forces
6. Apply forces → velocity: `vx += totalFx * deltaMs * speedScale`
7. Damp velocity: `vx *= DAMPING`
8. Clamp to `MAX_SPEED`
9. Update position from steering velocity: `x += vx * deltaMs`
10. Update position from knockback (time-normalized decay)
11. Clamp to world bounds: `[ARENA_MARGIN, WORLD_W - ARENA_MARGIN]` × `[ARENA_MARGIN, WORLD_H - ARENA_MARGIN]`

After all Digimon are updated → check for battle end (all user or all opponent Digimon dead).

---

## 10. Cinematic System (Zoom + Slow-Motion)

When a Digimon dies or enters `skill_windup`, the game triggers a cinematic: slow-motion + camera zoom focused on that Digimon.

### Trigger Points

**On death:**
```ts
startCinematic(dead.x, dead.y, durationMs=2200, timeScale=0.2, zoomFactor=1.5);
// 2200ms real-time, 5× slow-motion (timeScale=0.2), 1.5× zoom
```

**On skill windup (detected when new windup IDs appear in RAF loop):**
```ts
startCinematic(d.x, d.y, durationMs=1600, timeScale=0.25, zoomFactor=1.4);
// 1600ms real-time, 4× slow-motion, 1.4× zoom
```

### `startCinematic()` Implementation

```ts
function startCinematic(focusX, focusY, durationMs, timeScale, zoomScale) {
  if (cinematicRef.current) return; // only one cinematic at a time

  cinematicRef.current = { realRemainingMs: durationMs, timeScale, focusX, focusY };

  // Compute the actual viewport position of the focus Digimon after camera clamping
  const clampedCamX = Math.max(0, Math.min(WORLD_W - VIEWPORT_W, focusX - VIEWPORT_W / 2));
  const clampedCamY = Math.max(0, Math.min(WORLD_H - VIEWPORT_H, focusY - VIEWPORT_H / 2));
  const vpX = focusX - clampedCamX;  // Digimon's X in viewport coords
  const vpY = focusY - clampedCamY;  // Digimon's Y in viewport coords

  const originX = ((vpX / VIEWPORT_W) * 100).toFixed(1) + '%';
  const originY = ((vpY / VIEWPORT_H) * 100).toFixed(1) + '%';

  viewportDivRef.current.style.transformOrigin = `${originX} ${originY}`;
  viewportDivRef.current.style.transition = 'transform 220ms ease-out';
  viewportDivRef.current.style.transform = `scale(${zoomScale})`;
}
```

### Why `transform-origin` Matters

The viewport is zoomed using CSS `transform: scale()`. The zoom always expands **from the `transform-origin` point**. If the default `center center` is used, zoom always expands from the viewport center — but when a Digimon is near the top/bottom of the map, the camera clamps and the Digimon appears near a viewport edge. This makes the zoom expand *away* from the Digimon.

By computing the Digimon's actual position in viewport coordinates (after camera clamping), `transform-origin` is set to point directly at the Digimon — so the zoom always expands toward it, regardless of where it is on the map.

### Cinematic in the RAF Loop

```ts
let gameDelta = realDelta;
if (cinematicRef.current) {
  gameDelta = realDelta * cinematicRef.current.timeScale; // slowed game time
  cinematicRef.current.realRemainingMs -= realDelta;       // real-time countdown
  if (cinematicRef.current.realRemainingMs <= 0) endCinematic();
}
const events = runFrame(digimonRef.current, gameDelta); // engine runs at slowed time
```

`endCinematic()` resets: `transform: scale(1)` with 550ms ease transition, then resets `transformOrigin` back to `center center` after 580ms.

---

## 11. React Architecture — Direct DOM vs State

### Direct DOM Mutations (60fps safe, no re-renders)

| Ref | DOM element | Updated when |
|-----|-------------|-------------|
| `spriteContainerRefs` | Sprite position wrappers | Every frame (translate) |
| `facingRefs` | Sprite facing wrappers | When horizontal direction changes (scaleX) |
| `hpBarFillRefs` | HP bar fills in StatusPanel | On damage events |
| `skillBarFillRefs` | Skill bar fills in StatusPanel | Every frame (width%) |
| `worldDivRef` | World scrolling div | Every frame (translate via camera) |
| `viewportDivRef` | Viewport clip div | On cinematic start/end (scale + transformOrigin) |

### React State (Discrete Events Only)

| State | Updated when |
|-------|-------------|
| `hpSnapshot` | On damage events (keeps HP numbers in sync on re-renders) |
| `deadIds` | On death events |
| `spriteStates` | When `spriteState` field changes on any Digimon (diffed via `lastSpriteStatesRef`) |
| `windupIds` | When `skill_windup` set changes (diffed via `lastWindupIdsRef`) |
| `battleLog` | On any loggable event (attack, skill, death) |
| `battlePhase` / `winner` | On `battle_end` event |
| `spriteToggle` | Every 600ms (drives idle animation alternation) |
| `scale` | On container resize (responsive scaling) |

---

## 12. RAF Game Loop

```ts
const loop = (ts: number) => {
  const realDelta = Math.min(ts - lastTsRef.current, 50); // cap at 50ms to handle tab focus loss
  lastTsRef.current = ts;

  // 1. Apply cinematic time scaling
  let gameDelta = realDelta;
  if (cinematicRef.current) {
    gameDelta = realDelta * cinematicRef.current.timeScale;
    cinematicRef.current.realRemainingMs -= realDelta;
    if (cinematicRef.current.realRemainingMs <= 0) endCinematic();
  }

  // 2. Advance engine (pure logic, returns events)
  const events = runFrame(digimonRef.current, gameDelta);

  // 3. Direct DOM: sprite positions + facing direction
  for (const d of digimonRef.current) {
    const el = spriteContainerRefs.current[d.id];
    if (el) el.style.transform = `translate(${d.x - 32}px, ${d.y - 32}px)`;

    const combinedVx = d.vx + d.knockbackVx;
    if (Math.abs(combinedVx) > 0.01) {
      const facingRight = combinedVx > 0;
      if (lastFacingRef.current[d.id] !== facingRight) {
        lastFacingRef.current[d.id] = facingRight;
        const facingEl = facingRefs.current[d.id];
        if (facingEl) facingEl.style.transform = facingRight ? 'scaleX(-1)' : '';
      }
    }

    // Skill bar — direct DOM every frame
    const skillEl = skillBarFillRefs.current[d.id];
    if (skillEl) {
      const fillPct = Math.max(0, Math.min(100,
        100 * (1 - d.skillCooldownMs / config.skillCooldownBase)));
      skillEl.style.width = `${fillPct}%`;
    }
  }

  // 4. Camera pan (lerp toward target)
  updateCamera();

  // 5. Sprite state diff → React setstate (only when changed)
  // 6. Windup diff → React setstate + trigger cinematic
  // 7. Handle events → HP snapshot, deaths, log entries, battle end

  if (!battleEndedRef.current) {
    rafIdRef.current = requestAnimationFrame(loop);
  }
};
```

---

## 13. Camera System

The camera smoothly follows the action each frame:

```ts
// Normal: average position of all alive Digimon
const avgX = aliveDigimon.reduce((s, d) => s + d.x, 0) / aliveDigimon.length;
const avgY = aliveDigimon.reduce((s, d) => s + d.y, 0) / aliveDigimon.length;
let tx = Math.max(0, Math.min(WORLD_W - VIEWPORT_W, avgX - VIEWPORT_W / 2));
let ty = Math.max(0, Math.min(WORLD_H - VIEWPORT_H, avgY - VIEWPORT_H / 2));
let lerp = 0.04;

// During cinematic: snap to focal Digimon
if (cinematicRef.current) {
  tx = Math.max(0, Math.min(WORLD_W - VIEWPORT_W, focusX - VIEWPORT_W / 2));
  ty = Math.max(0, Math.min(WORLD_H - VIEWPORT_H, focusY - VIEWPORT_H / 2));
  lerp = 0.1; // faster snap to focal point
}

cameraXRef.current += (tx - cameraXRef.current) * lerp;
cameraYRef.current += (ty - cameraYRef.current) * lerp;
worldDivRef.current.style.transform =
  `translate(-${cameraXRef.current}px, -${cameraYRef.current}px)`;
```

---

## 14. Responsive Scaling

The viewport is scaled to fill its container div while maintaining aspect ratio:

```ts
// ResizeObserver on the container
const scale = containerWidth / VIEWPORT_W; // can upscale beyond 1.0
setScale(scale);
```

Applied via:
```tsx
<div
  style={{
    width: VIEWPORT_W,
    height: VIEWPORT_H,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }}
>
```

The outer scale wrapper sets an explicit `height: VIEWPORT_H * scale` to prevent layout collapse under the absolute-sized viewport div.

---

## 15. Sprite Facing Direction

Sprites default to facing **LEFT**. Facing is controlled by `scaleX(-1)` applied to the sprite wrapper div referenced by `facingRefs`.

**Initial facing** (set in `useLayoutEffect`):
- User team spawns on the **left** → should face right → `scaleX(-1)`
- Opponent team spawns on the **right** → faces left → no flip (default)

**Dynamic facing** (updated in RAF loop per frame):
```ts
const combinedVx = d.vx + d.knockbackVx;
if (Math.abs(combinedVx) > 0.01) {
  const facingRight = combinedVx > 0;
  if (lastFacingRef.current[d.id] !== facingRight) {
    lastFacingRef.current[d.id] = facingRight;
    facingEl.style.transform = facingRight ? 'scaleX(-1)' : '';
  }
}
```

`lastFacingRef` prevents redundant DOM writes when direction hasn't changed.

---

## 16. StatusPanel — HP/Skill Bars

Rendered above the arena. Two columns: user team (left, indigo) and opponent team (right, red).

**HP bars** are driven by both:
- React state (`hpSnapshot`) — keeps HP numbers correct on re-renders
- Direct DOM (`hpBarFillRefs`) — provides instant visual response on damage events

**Skill bars** are **direct DOM only** (`skillBarFillRefs`) — updated every frame, no React state.

**Design tokens:**
- Bar track: `bg-gray-200 dark:bg-dark-100`
- User HP fill: `bg-indigo-600 dark:bg-indigo-400`
- Opponent HP fill: `bg-red-500 dark:bg-red-400`
- Skill fill: `bg-amber-400`
- Dead Digimon: `opacity-40` + strikethrough on name

---

## 17. Battle Log Panel

Rendered as a `.card` below the arena. Stores up to **8** `LogEntry` objects in React state:

```ts
interface LogEntry {
  id: string;
  text: string;
  type: 'attack' | 'skill' | 'crit' | 'miss' | 'death';
}
```

Displayed newest-first with fading opacity per entry (`Math.max(0.2, 1 - i * 0.18)`).

**Color coding by type:**

| Type | Class |
|------|-------|
| `death` | `text-red-500` |
| `skill` | `text-violet-500` |
| `crit` | `text-amber-500` |
| `miss` | `text-gray-400` |
| `attack` | `text-gray-700 dark:text-gray-300` |

Typography: panel label uses `font-heading` (Fredoka); entry text uses `font-body` (Nunito).

---

## 18. WinnerOverlay & Auto-Advance

When `battle_end` fires, `battlePhase` becomes `'complete'` and `WinnerOverlay` appears inside the viewport as a Framer Motion `motion.div`:

- Background: `bg-black/60` backdrop
- Title: spring-animated `motion.div`, `font-heading` 4xl, colored by winner
- Subtitle: staggered fade-in `font-body` text

A `useEffect` auto-calls `onBattleComplete({ winner, turns: [] })` after **2500ms** — no user action required. This gives the user a brief celebration splash before transitioning to the results screen.

---

## 19. ArenaResultsScreen (Battle.tsx)

Rendered in `Battle.tsx` when `arenaResult` state is set (after `handleArenaBattleComplete` completes DB work). `preparedUserTeam` is intentionally kept alive until the user clicks Continue — it powers the sprite display.

**Layout:**
- Gradient header band (indigo for win, red for loss)
- `font-heading` 5xl victory/defeat title with Framer Motion spring entrance
- User Digimon displayed with staggered `motion.div` per sprite
  - Win: `animationState='victory'` → `BattleDigimonSprite` toggles cheer/happy sprites
  - Loss: `animationState='defeat'` → toggles sad1/sad2 sprites
  - Toggle driven by a 700ms `spriteToggle` interval
- Rewards row: amber indicator dot + bits amount in `text-amber-600 dark:text-amber-400`

**Bits reward amounts:**

| Outcome | Difficulty | Reward |
|---------|-----------|--------|
| Win | Hard | 200 bits |
| Win | Medium | 100 bits |
| Win | Easy | 75 bits |
| Loss | Hard | 40 bits |
| Loss | Easy/Medium | 50 bits |

---

## 20. StrategyPicker

Pre-battle screen where the user assigns a strategy to each of their Digimon before the arena starts. Strategies map directly to `STRATEGY_CONFIGS` in `arenaTypes.ts`.

**Three options:**

| Strategy | Label | Active Color |
|----------|-------|-------------|
| `aggressive` | Aggressive | Red `#ef4444` |
| `balanced` | Balanced | Indigo `#6366f1` |
| `defensive` | Defensive | Green `#22c55e` |

Default: all `'balanced'`. Confirmed via "Fight!" button → `onConfirm(strategies[])`.

Each Digimon row shows: sprite, name, level + type/attribute, current strategy badge, and three strategy buttons with colored active state.

---

## 21. Battle.tsx — Full Flow Wiring

```
Battle Options (difficulty cards)
      ↓ handleSelectOption()
BattleTeamSelector (pick up to 3 Digimon)
      ↓ handleConfirmTeam()  [spends energy via spend_energy_self RPC]
      ↓
  Arena mode? ──yes──→ StrategyPicker
                             ↓ handleStartArenaBattle(strategies)
                       ArenaBattle (live battle)
                             ↓ onBattleComplete({ winner }) [auto after 2.5s]
                       handleArenaBattleComplete()
                       [calc bits, insert team_battles, update profiles, check titles]
                             ↓ sets arenaResult
                       ArenaResultsScreen
                             ↓ handleArenaResultsContinue()
                       [reset all state → back to Battle Options]

Classic mode? ──→ InteractiveBattle (unchanged)
```

### State for Arena Flow in Battle.tsx

| State | Purpose |
|-------|---------|
| `battleMode` | `'arena'` or `'interactive'` |
| `showStrategyPicker` | Show StrategyPicker after team selection |
| `arenaBattleActive` | Show ArenaBattle component |
| `preparedUserTeam` | `BattleDigimon[]` — kept alive through results screen |
| `preparedOpponentTeam` | `BattleDigimon[]` |
| `userStrategies` | `Strategy[]` — one per user Digimon |
| `arenaResult` | `{ winner, bitsReward } \| null` — triggers ArenaResultsScreen |

### Render Priority in Battle.tsx Tab Panel

```tsx
{arenaResult && preparedUserTeam ? (
  <ArenaResultsScreen ... />   // ← shown first (covers arenaBattleActive)
) : arenaBattleActive ? (
  <ArenaBattle ... />
) : showStrategyPicker ? (
  <StrategyPicker ... />
) : (
  // normal battle hub UI
)}
```

---

## 22. How to Extend / Tune

### Change battle pacing

- **Slower/faster attacks:** Modify `attackCooldownBase` in `STRATEGY_CONFIGS` (`arenaTypes.ts`)
- **More/less skill usage:** Modify `skillCooldownBase` in `STRATEGY_CONFIGS`
- **Overall damage scaling:** Modify the base stats passed via `initArenaDigimon()` in `arenaEngine.ts`, or adjust the `calculateDamage` call in the engine

### Add a new strategy

1. Add to the `Strategy` union type in `arenaTypes.ts`
2. Add entry to `STRATEGY_CONFIGS` with all required fields
3. Add to the `STRATEGIES` array in `StrategyPicker.tsx` with `label`, `desc`, `activeColor`, `activeBg`

### Change cinematic durations and intensity

Find `startCinematic(...)` calls in `ArenaBattle.tsx`:

```ts
// Signature:
startCinematic(focusX, focusY, realDurationMs, timeScale, zoomFactor)

// Death:
startCinematic(dead.x, dead.y, 2200, 0.2, 1.5);
//                              ^^^^  ^^^  ^^^
//                              ms    speed  zoom

// Skill windup:
startCinematic(d.x, d.y, 1600, 0.25, 1.4);
```

- `realDurationMs` — how long the slow-mo lasts in wall-clock time
- `timeScale` — game speed multiplier (0.2 = 5× slowdown, 0.5 = 2× slowdown)
- `zoomFactor` — CSS scale factor applied to viewport div

### Change knockback feel

In `arenaTypes.ts`:
- Stronger hits → raise `KNOCKBACK_IMPULSE`
- More dramatic deaths → raise `KNOCKBACK_DEATH_MULTIPLIER`
- Longer slide → raise `DAMPING` (closer to 1.0)
- Snappier stop → lower `DAMPING` (closer to 0)

### Add a new arena event type

1. Add to `ArenaEvent` union in `arenaTypes.ts`
2. Emit from `runFrame()` in `arenaEngine.ts` (push to the `events` array)
3. Handle in `handleEvents()` inside `ArenaBattle.tsx`

### Change the world/viewport size

Edit `WORLD_W`, `WORLD_H`, `VIEWPORT_W`, `VIEWPORT_H` in `arenaTypes.ts`.

> ⚠️ If you reduce the ratio of `WORLD_H / VIEWPORT_H`, Digimon near map edges will be further from the cinematic focal point. The `startCinematic()` `transform-origin` logic already handles this correctly — no changes needed there.

### Add more Digimon to a team (beyond 3)

`arenaEngine.ts` supports any team size. The limits on team size (max 3 `is_on_team` Digimon) are enforced in `BattleTeamSelector` and `petStore`. `StatusPanel` in `ArenaBattle.tsx` uses `.map()` over the full team array — it will auto-expand to more entries.

### Change bits rewards

In `Battle.tsx`, find `handleArenaBattleComplete()`. The bits calculation is a simple inline object lookup — edit the values there directly.
