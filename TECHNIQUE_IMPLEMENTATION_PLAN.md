# Technique System Implementation Plan

Status: Phase 0 and the Phase 1A vertical slice are implemented locally and validated;
Phase 1B onward remains planned. Nothing is deployed.

See [TECHNIQUE_SYSTEM_DESIGN.md](TECHNIQUE_SYSTEM_DESIGN.md) for the underlying design decisions.

## Guiding approach

Build one complete, observable path before adding randomized loot:

`species innate technique → server simulation → recorded replay → visible SP gauge → distinct effect → tested damage`

The previous attempt changed combat, replay, UI, and database behavior together before the gauge and playback path were proven. The next implementation should establish explicit ownership of battle SP and validate it in both live simulation and recorded playback before expanding scope.

Current-code findings that shape the plan:

- Daily arena combat is simulated in the Edge Function and saved before playback;
  tournament combat remains a separate flow and is not silently migrated with this feature.
- Replay v1 samples packed state every 64ms and currently records
  `skillCooldownMs`, not current SP. Playback interpolates only `x` and `y`.
- The current Skill bar derives its width from randomized remaining cooldown divided
  by a non-random base cooldown. The numerator can begin larger than the denominator,
  so the bar clamps at 0 for several seconds. Missing or non-finite values can also
  reach the DOM as `NaN%`.
- The current windup presentation draws a dashed attacker-to-target line and dashed
  ring. These generic overlays are explicitly replaced by technique-specific effects.
- Current damage still uses persistent SP to increase critical damage and chooses
  physical versus magic from the attacker's larger stat. Technique damage must use
  its authored role and must decouple SP from criticals.
- Replay v1's packed tuple order is implicit. A v2 reader must use an explicit schema
  and coexist with the v1 reader rather than changing tuple indices in place.

## Phase 0: Audit and prototype

1. Preserve the traced ownership contract: database preparation snapshots inputs;
   the Edge Function simulates; settlement atomically saves the result; the browser
   only plays the recording. Add this contract to the arena reference when code changes.
2. Build a minimal development fixture that can play deterministic saved battles
   without an account or production data. Include v1, normal v2, malformed/legacy
   optional fields, reduced motion, and a three-versus-three stress fixture.
3. Add pure normalization helpers for persistent SP, current battle SP, capacity,
   cost, and gauge percentage. Every helper returns a finite clamped value for
   `undefined`, `null`, numeric strings, `NaN`, infinities, zero capacity, and corrupt
   replay input.
4. Prototype the gauge from explicit replay samples named `battleSp` and
   `battleSpCapacity`. Interpolate those values between samples just like position.
   Technique events may mark cost/commit moments, but are not a second source of truth
   for the fill.
5. Label the gauge `SP`, show finite current/capacity text, and add a cost marker or
   ready treatment only when the recorded desired technique provides a valid cost.
   Dead combatants retain an explicit empty/disabled state.
6. Remove the dashed connector/ring from the prototype path and replace it with one
   technique-specific anticipation cue plus a reduced-motion substitute.

Exit criteria:

- The gauge visibly and smoothly moves from 0 to its threshold, drops at the recorded
  commit, and begins charging again.
- Unit tests prove monotonic charge between spends, exact-once spending, clamping,
  and finite serialization/CSS percentages.
- Replay tests exercise 7, 16, 50, and 1000ms playback advances and reach identical
  final HP/SP and event order.
- Old v1 replays render through the legacy adapter without `undefined`, `NaN`, or
  altered combat. Because v1 did not record battle SP, it keeps a normalized legacy
  Skill indicator or no meter rather than displaying invented SP. Missing v2
  presentation data uses an explicit safe fallback.
- No generic dashed/dotted line, arrow, or target ring appears in normal or
  reduced-motion playback.
- Playback does not run current combat rules.

## Phase 1: Technique engine and replay foundation

### Phase 1A: two-technique vertical slice

Implement only Impact Strike and Ember Burst first. The server-owned battle state
adds finite `battleSp`, `battleSpCapacity`, `desiredTechniqueId`, and recovery/commit
state. Use one capacity and one cost in this slice while preserving variable-cost
fields in the types and replay.

Engine requirements:

- Battle SP starts at 0 and charges from a bounded, named formula using normalized
  persistent SP. Put tuning constants beside the engine rules and test the minimum,
  ordinary, maximum, and malformed-stat cases.
- Select and lock the technique plus target before windup. Spend SP exactly once on
  commit. Being out of range holds the resource; death/cancel behavior is explicit.
- Create a dedicated technique-damage function. Physical techniques use ATK/DEF;
  magic techniques use INT/INT. Technique element replaces the attacker's species
  attribute for the attribute matchup, while the existing species type matchup is
  retained. Persistent SP affects neither critical chance nor multiplier.
- Basic arena attacks also stop using SP for critical damage as part of the engine
  version change. Do not change tournament rules implicitly; audit and test that
  separate flow.
- Emit exact-time semantic events for start, commit, hit, miss, and end. Each event
  includes a deterministic effect instance ID and enough resolved presentation data
  for playback without catalog access.

Replay and deployment requirements:

- Add replay v2 as a discriminated format with an explicit field schema/manifest.
  Keep the v1 type, reader, and fixture. Never append fields to v1's implicit packed
  tuple and assume old readers will understand them.
- Record and interpolate current SP and capacity. Snap authoritative damage/status
  state at recorded events; presentation callbacks never apply combat results.
- Benchmark replay size and simulation time after the extra state/events. Keep the
  current 120-second bound and define an acceptable storage budget before rollout.
- Bump the arena engine version and add explicit server-side version selection in a
  new migration. Freeze the current v1 simulator as a compatibility module. The Edge
  Function dispatches prepared v1 requests to that module and v2 requests to the
  technique engine; it never runs a pending request with a different engine.
- New clients advertise v2 support when starting a battle. Missing/old capability is
  limited by the server to v1 during the compatibility window, so an already-open old
  client is not handed a recording it cannot read. Inspect prepared requests before
  removing this window; never strand them behind the current version-mismatch response.
- Update settlement validation to accept the intended replay envelopes while still
  checking winner, engine version, seed, duration, and bounded frame/event sizes.
  Roll out additively: deploy dual-version SQL validation and preparation first;
  deploy the dual-reader frontend second; deploy the dual-engine Edge Function third;
  then enable v2 for capable clients. Remove v1 simulation only in a later reviewed
  release after no prepared v1 requests remain. The v1 replay reader stays.

Exit criteria:

- Both moves execute in deterministic engine tests and produce distinct semantic
  event sequences.
- Server simulation and playback end with identical finite HP and SP state.
- A v1 saved replay and v2 saved replay both play in the new client.
- Retrying/resuming a prepared or settled battle neither double-spends SP/tickets
  nor grants rewards again.

### Phase 1B: initial authored catalog

Add a small authored catalog with six techniques:

| Technique     | Element  | Role     | Delivery   | Purpose                          |
| ------------- | -------- | -------- | ---------- | -------------------------------- |
| Impact Strike | Neutral  | Physical | Melee      | Baseline close-range move        |
| Ember Burst   | Fire     | Magic    | Projectile | Baseline ranged move             |
| Riptide Fang  | Water    | Physical | Melee      | Elemental melee comparison       |
| Static Beam   | Electric | Magic    | Beam       | Continuous-looking ranged family |
| Seismic Slam  | Earth    | Physical | Area       | Short-range area family          |
| Verdant Pulse | Plant    | Magic    | Area       | Ranged/area timing comparison    |

Use working Digitask names during development. Licensed/reference move lists are balance and taxonomy references, not content to copy wholesale.

Implementation requirements:

- Species-to-innate assignment is deterministic and explicit.
- Physical and magic defense paths have unit tests.
- SP affects charge rate only and every serialized SP-related number is finite.
- Critical chance and multiplier are independent of SP in the arena engine.
- Technique SP is spent exactly once at commit.
- A short recovery prevents overlapping actions.
- Resolved mechanics and presentation recipes are snapshotted for replay; playback
  does not look up the current catalog.

Exit criteria:

- All six moves execute in deterministic engine tests.
- Every move is recognizable without its name label or color and differs from any
  same-family move in at least two major visual identifiers.
- Full battle simulation and replay end with identical HP/SP state.

## Phase 2: Visual language

Create reusable effect families before greatly expanding the catalog.

Recommended damaging families:

1. Punch/impact.
2. Bite/claw.
3. Single slash.
4. Crossing slash.
5. Multi-slash.
6. Body charge.
7. Ground slam.
8. Radial burst.
9. Orb projectile.
10. Bolt or needle volley.
11. Crescent wave.
12. Lobbed explosive.
13. Beam.
14. Breath or cone.

Recommended support families:

1. Self aura.
2. Ally heal.
3. Team field buff.
4. Enemy debuff seal.
5. Cleanse or barrier.

Each family should define windup pose, travel/shape, impact, target response, reduced-motion behavior, and camera limits. Element-specific layers should be composable with these families.

### Rendering contract

- Keep Digimon sprite images nearest-neighbor/pixelated. Render VFX as smooth SVG,
  CSS/DOM, or device-pixel-ratio-aware canvas layers in world coordinates. Do not
  scale a small raster effect until it blurs.
- Build effects as restrained layers: readable core silhouette, soft bloom/light,
  secondary particles or debris, and an impact layer. Effects must remain legible in
  light/dark app themes and against both team colors.
- Drive effect lifetime from replay battle time and the recorded presentation seed,
  not `Date.now()`, animation completion callbacks, or ambient `Math.random()`.
- Stable technique events create and dispose effect instances. Cap concurrent
  particles and pool/reuse hot-path objects where necessary. Avoid per-frame layout
  reads and React state updates for every particle.
- Damage/status labels appear at recorded contact time. Camera focus and hit-stop are
  presentation-only, bounded, cooldown-aware, and unable to delay or change settlement.
- Audio hooks may be part of a recipe, but missing audio assets must not block or
  weaken the visual composition. Respect user audio settings when sound is added.

### Initial six visual briefs

| Technique     | Recognition brief                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Impact Strike | Short compression/lunge, bright contact crescent, dense circular shock, single heavy recoil              |
| Ember Burst   | Compact fire orb with turbulent tail, accelerating travel, expanding flame-and-ember impact              |
| Riptide Fang  | Fast water-wrapped dash, opposing curved jaws, sharp closing splash and lateral target snap              |
| Static Beam   | Gathering electric motes, solid luminous beam with restrained branches, sustained contact flicker        |
| Seismic Slam  | Upward anticipation then planted impact, filled ground compression, cracks/debris radiating from contact |
| Verdant Pulse | Seed-like core, smooth expanding leaf/energy wave, staggered soft impacts across its area                |

These are direction, not an invitation to copy one generic projectile and recolor it.
No brief uses the current dashed line or dashed ring. Area readability comes from
filled ground light, shadow, cracks, ripples, or environmental motion; single-target
readability comes from facing, travel, contact, and target reaction.

Exit criteria:

- Effects remain readable in three-versus-three battles.
- Reduced-motion mode communicates the same targeting and result.
- Common effects look complete; rare treatments add polish rather than basic clarity.
- Pixel sprites remain crisp while effect edges, gradients, trails, and lighting are
  smooth at 1x and during the maximum allowed camera zoom on standard and high-DPI screens.
- A visual review covers 320/375px, 768px, 1024px, and 1440px layouts, normal and
  reduced motion, light and dark themes, simultaneous effects, misses, criticals,
  deaths, and long names.
- A three-versus-three stress fixture meets an agreed frame-time budget on a
  representative desktop and mobile device; effect degradation removes secondary
  particles before core silhouettes or timing cues.

## Phase 3: Technique Chips and equipment

Add database-backed chip instances and one equipped chip slot per Digimon.

Suggested entities:

- Technique catalog definitions.
- Owned chip instances.
- Equipped slot association.
- Optional favorite/lock flag.
- Roll payload with a version number.

Use a versioned database mechanics catalog as the authority for persistent definitions
and explicit species-to-innate reference data. Update both through the declarative
schema/data-migration workflow and matching development seed data. Battle preparation
resolves catalog values and owned chip rolls into the request snapshot; the Edge
Function never trusts client-supplied rolled stats. The checked-in visual registry is keyed by
`visualId` plus `visualVersion`; CI/tests must fail on missing mechanics-to-visual
references rather than silently substituting the wrong effect.

Rules:

- Any Digimon can equip any chip.
- No same-attribute damage bonus initially.
- Equipping and replacing are atomic.
- Replaced chips return to inventory.
- Innate technique remains available and is not represented as an owned chip.
- The server validates chip ownership and equipped state when preparing a battle.
- Automatic selection alternates chip and innate after successful commits, beginning
  with the chip and skipping moves without legal targets, as specified in the design.
- Locked/favorited chips cannot be dismantled, and all ownership/equip/dismantle
  writes are server-authoritative with owner-scoped reads.

Exit criteria:

- Equip, replace, unequip, evolve, and replay flows are tested.
- A player cannot equip another player's chip or duplicate one chip across Digimon.
- Old Digimon receive their species innate without a destructive backfill.
- Concurrent equip/replace/dismantle requests cannot lose or duplicate a chip.
- Prepared battles keep their snapshotted loadout even if equipment changes afterward.

## Phase 4: Drops and farming

Add rewards only after chips can be safely owned and equipped.

Initial reward model:

- Bits remain guaranteed according to current rules.
- Technique Data has a modest common chance or guaranteed amount at selected difficulties.
- Complete chips are uncommon drops.
- Opponent species or encounter table influences the available technique pool.
- Difficulty improves rarity odds and roll floors.
- Duplicate chips can be dismantled into universal Technique Data.

Settlement must remain server-authoritative and atomic with ticket spend, history, and all rewards. Client playback displays the recorded reward result and never rolls or grants loot.

Define inventory capacity before enabling drops. The recommended first behavior is
no silent loss: settlement either has guaranteed storage or atomically converts an
overflow chip into a clearly recorded Technique Data amount. Do not make reward
success depend on the playback animation completing.

Exit criteria:

- Retrying playback cannot duplicate a reward.
- Failed settlement cannot spend a ticket without recording the corresponding result.
- Drop distributions are covered by deterministic statistical tests.
- Inventory capacity and duplicate handling have explicit behavior.

## Phase 5: Support techniques

Introduce support moves after offensive targeting and replay behavior are stable.

Start with effects that work clearly in automatic combat:

- Self ATK or INT boost.
- Ally heal targeting the lowest health ratio.
- Enemy ATK or INT reduction.
- Short status barrier.
- Cleanse one negative status.

Avoid revival, turn-order manipulation, broad status catalogs, and highly conditional effects in the first support pass.

Acceleration Boost is a useful future candidate, but it needs a Digitask-specific interpretation because arena combat is continuous rather than turn-based. Possible versions include a short charge-rate buff, a temporary movement/attack-speed buff, or amplification of the next technique. It should not be added until buff duration and replay representation are established.

## Phase 6: Expanded catalog and rare variants

Expand toward two physical and two magic techniques per element, then add support coverage based on observed gaps.

Rare variants may introduce:

- Alternate projectile count or trajectory.
- Wider or narrower areas.
- Small status riders.
- SP-efficiency tradeoffs.
- Multi-hit timing.
- Enhanced but mechanically readable visual treatments.

Signature techniques for selected Mega, Ultra, boss, or event Digimon belong here, after shared techniques and chips already provide sufficient variety.

## Validation checklist for every phase

- Engine rules have deterministic unit tests.
- Replays remain readable across supported versions.
- All resource, damage, duration, position, and gauge values are finite at engine,
  serialization, reader, and DOM boundaries; malformed replay fixtures fail safely.
- Server and frontend use compatible engine versions.
- Prepared requests are preserved or deliberately migrated without charging.
- Playback cannot settle or grant rewards.
- Technique visuals consume semantic replay events and cannot mutate engine state.
- The dotted/dashed targeting connector and generic ring do not return through a
  fallback, reduced-motion mode, or reused legacy component.
- `npm run arena:build` succeeds.
- `npm run lint`, `npm run format:check`, affected tests, `npm run build`, and
  `npm run arena:build` pass. Run the local arena integration test for server-flow changes.
- Database schema, migrations, RLS, grants, generated types, and authorization tests pass when persistence changes.
- Patch notes describe only behavior that is actually part of the user-facing batch and do not claim deployment prematurely.

## Recommended next session

Begin with Phase 0 only. Preserve a checked-in synthetic v1 replay fixture, add the deterministic
local fixture, and prove an explicit finite `battleSp / battleSpCapacity` gauge that
charges, commits, drops, and recharges at several playback frame rates. Replace the
dashed targeting overlay in that fixture with a temporary technique-specific cue.

Then implement Phase 1A with Impact Strike and Ember Burst, replay v2, and the engine
version/prepared-request deployment strategy. Do not begin the other four techniques,
database-backed chips, drops, or support effects until the two-move slice passes its
engine, replay, visual, performance, reduced-motion, and compatibility gates.
