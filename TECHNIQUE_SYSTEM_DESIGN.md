# Technique, Battle Variety, and Drop System

Status: Phase 1A's battle-SP, replay-v2 and two-technique foundation is implemented locally;
later catalog, loadout and progression sections remain proposals. Nothing is deployed.

## Goals

The system should make battles visually distinct, give repeated encounters desirable drops, and let players customize Digimon without erasing species identity.

The core loop is:

1. Battle Digimon.
2. Receive Bits plus occasional technique-related drops.
3. Find, compare, collect, and improve Technique Chips.
4. Equip techniques that suit a Digimon's stats or the player's strategy.
5. Return to battle for better rolls, missing techniques, and upgrade materials.

The system should avoid requiring a perfectly rolled chip before a technique is usable. A common chip should be meaningful; rare rolls should provide long-term goals rather than mandatory power.

## First-release decisions

The following are design constraints for the first release rather than questions to
rediscover during implementation:

- Battle SP starts at `0`. It is a battle-only resource; the persistent `SP` stat is
  an input to charge speed and is never displayed as the current gauge value.
- The simulation owns current SP, capacity, spending, and technique selection. The
  playback UI only renders recorded state and events.
- The first vertical slice has one active innate technique. Chip techniques are not
  added until that path, old replay compatibility, and the SP gauge are proven.
- Once a chip slot is introduced, the simulation chooses a desired technique before
  charging to its cost. It does not repeatedly spend on the cheapest move before a
  more expensive move can become ready. The initial deterministic policy is described
  under Digimon techniques.
- Technique effects use smooth high-resolution presentation around deliberately
  pixelated Digimon sprites. Pixelating, nearest-neighbor scaling, or deliberately
  low-resolution rendering applies to the creature sprite, not to beams, particles,
  lighting, trails, ground effects, or impact shapes.
- Targeting is communicated through the technique itself. Persistent dotted lines,
  dashed arrows, crosshairs, and generic dashed target rings are not part of the
  visual language.
- Daily arena replay format v1 remains readable. Technique battles use a versioned
  successor and do not reinterpret old recordings with current combat rules.

## Digimon techniques

Each Digimon has:

- One species-defined innate technique.
- One customizable chip technique slot initially.
- Its normal basic attack, which remains separate from techniques and costs no SP.

Additional chip slots can be considered later, after one slot is readable and balanced in the automatic battle system.

### Innate techniques

Most species reuse a technique from the shared technique catalog. Every species does not need a bespoke move.

An innate technique is intentionally a reliable baseline version:

- Fixed stats rather than random rolls.
- Approximately common quality, or slightly below a good dropped chip.
- Always available, so a Digimon is never missing its special identity.
- Chosen to suit the species' attribute, stat profile, and visual anatomy where practical.

Mega, Ultra, boss, event, or other special Digimon may receive signature techniques in a future content pass. Signature techniques should be exceptions that feel special, not a requirement for every species.

Evolution changes the species innate technique. It does not delete collected Technique Chips.

### Technique Chips

A Technique Chip is a reusable inventory item that teaches or equips one generated technique instance. A chip contains:

- Base technique ID.
- Rarity.
- Rolled quality values.
- Element.
- Damage class or support role.
- SP cost.
- Power or effect strength.
- Range and targeting pattern.
- Visual family and optional visual modifier.
- Any secondary effect and its strength or chance.

Any Digimon may equip any Technique Chip. Attribute matching is not required.

There is no same-attribute attack bonus in the initial system. Elemental matchups already reward bringing the right move, and adding a matching-species multiplier would narrow customization. If testing later shows that species identity is too weak, a small affinity perk can be considered without invalidating off-attribute builds.

Equipping a new chip must not permanently destroy the previous technique. Unequipped chips return to inventory or to a technique collection. Players should be able to experiment without fear of losing a rare roll.

### Automatic technique choice

Automatic combat must choose a move deterministically so the gauge, windup, and
result tell one coherent story.

- With no chip equipped, the innate technique is the desired technique.
- With an innate and a chip technique available, the fighter alternates between
  them after each successful commit, beginning with the equipped chip. A technique
  with no legal target is skipped; skipped moves do not spend SP or advance the
  alternation.
- The chosen technique and target are locked when windup commits. SP is spent once
  at that transition. A target becoming invalid afterward follows the technique's
  authored miss/retarget rule; the browser never makes that decision.
- Support techniques later add explicit eligibility rules, but do not introduce a
  second client-side chooser.

This simple initial policy ensures both species identity and the equipped chip are
visible. More tactical priorities can be added as an explicit behavior feature
after two-technique battles are readable.

## Random variation

Randomness should create interesting comparisons without making the technique name meaningless.

Each dropped chip has a rarity tier and a small set of bounded rolls. A possible model is 0–15 quality values for:

- Potency.
- SP efficiency.
- Secondary-effect strength or reliability.

Not every technique needs all three rolls. Straight damage techniques may roll potency and efficiency; support techniques may roll duration, magnitude, or targeting quality.

Rarity controls the roll floor and the chance of an additional modifier. It should not simply multiply every number.

Example rarity direction:

| Rarity    | Purpose                                                          |
| --------- | ---------------------------------------------------------------- |
| Common    | Usable base technique with ordinary rolls                        |
| Uncommon  | Better roll floor or one modest modifier                         |
| Rare      | Strong rolls and a meaningful modifier chance                    |
| Epic      | High roll floor and a distinctive modifier or visual treatment   |
| Legendary | Very rare aspirational roll, not required for normal progression |

Good modifiers change how a technique behaves rather than only adding damage. Examples include a narrower/faster projectile, a wider area, a short debuff, a small heal, reduced SP cost, or an additional hit with lower per-hit power.

## Chips and fragments

Technique Chips should be the exciting, immediately inspectable drop. Fragments should exist only if they solve bad-luck protection and duplicate value.

Recommended model:

- Enemies can rarely drop a complete Technique Chip.
- More commonly, eligible battles award Technique Data.
- Technique Data is not a large family of inventory-cluttering fragments. It is a compact crafting currency, optionally scoped by element or technique family.
- Duplicate or unwanted chips can be dismantled into Technique Data.
- Enough data can create a basic chip, reroll one property, or improve a chip within strict limits.

This keeps complete chips exciting while ensuring repeated battles always make progress. It also prevents an inventory full of dozens of named fragment types.

Start with one universal Technique Data currency. Element-specific data can be introduced only if the universal version fails to provide enough farming identity.

## SP and combat rules

Techniques use an explicit battle resource rather than deriving a visual percentage
from a cooldown timer.

- `battleSp` starts at `0`, has a finite authored capacity, and is clamped to
  `[0, battleSpCapacity]` after every update.
- The persistent SP stat affects only a bounded charge-rate formula. Inputs and
  outputs must be normalized with `Number.isFinite`; malformed values fall back to
  safe catalog/stat defaults rather than reaching simulation or CSS as `NaN`.
- The SP stat does not affect critical-hit chance or critical damage. Arena basic
  attacks and techniques use fixed, separately tunable critical rules.
- A technique becomes ready when `battleSp >= spCost` and it has a legal target.
  The simulation selects the desired technique before charging to its threshold.
- SP is deducted exactly once when the fighter commits to windup, never when the
  animation completes and never during playback.
- A short shared recovery may prevent action and animation overlap, but SP remains
  the primary frequency control.
- A ready fighter holds the resource until it has a legal target. Charging, holding,
  committing, spending, and post-spend values are all server-simulated.
- The status panel labels the resource `SP`, displays current/capacity text, and may
  show the desired technique's cost marker. Its fill is always
  `battleSp / battleSpCapacity`; it is never reconstructed from time, persistent SP,
  strategy cooldowns, windup state, or catalog lookups.
- Replay v1 did not record battle SP. Its compatibility view must retain a safely
  normalized legacy Skill indicator or omit that meter; it must not relabel a derived
  cooldown as SP.

The first slice can use one capacity and one technique cost for easier balancing,
but the recorded state must support variable costs from the beginning.

Physical techniques scale from the attacker's ATK and are mitigated by the target's DEF.

Magic techniques scale from the attacker's INT and are mitigated by the target's INT.

Support techniques may heal, buff allies, debuff enemies, cleanse status effects, protect targets, or alter battle behavior. Support effects need separate caps and duration rules before broad implementation.

Technique element is used for elemental matchup calculations independently of the Digimon's own attribute.

## Technique anatomy

Each catalog definition should separate mechanics from presentation:

```ts
interface TechniqueDefinition {
  version: number;
  id: string;
  name: string;
  element: DigimonAttribute;
  role: 'physical' | 'magic' | 'support';
  delivery: 'melee' | 'charge' | 'projectile' | 'beam' | 'area' | 'self' | 'ally';
  spCost: number;
  power: number;
  range: number;
  windupMs: number;
  visualId: string;
  visualVersion: number;
  targeting: 'single-enemy' | 'enemy-area' | 'self' | 'single-ally' | 'all-allies';
  effectId?: string;
}
```

Generated chip values should reference a definition rather than copying the entire catalog record. This allows balance adjustments while preserving the rolled instance data that makes a chip unique.

The persistent mechanics catalog and species-to-innate assignment are versioned
reference data. Battle preparation resolves the current definition plus chip rolls
into the server-owned request snapshot. Replays store the resolved combat and visual
inputs needed to preserve that battle; they do not query today's catalog during
playback.

## Drops and farming

Battle rewards should use a server-authoritative roll and settlement path. Playback must never grant a second reward.

A reward result may contain:

- Bits.
- Technique Data.
- A complete Technique Chip.
- Future cosmetic or upgrade materials.

Drop tables can consider opponent stage, difficulty, species, attribute, and battle mode. Higher difficulty should improve rarity odds or roll floors rather than locking all useful techniques behind the hardest tier.

Useful farming targets include:

- A specific base technique.
- A preferred element or delivery style.
- A high potency roll.
- A low SP-cost roll.
- A desired modifier.
- A rare visual variant.

Pity or deterministic crafting should guarantee progress after repeated misses.

## Visual identity

Visuals are a primary feature, not decoration added after balance work. The intended
look is an HD 2D game built around pixel-art characters: creature sprites stay crisp
and pixelated, while effects are smooth, antialiased, layered, and rendered at the
display's effective resolution. Camera zoom must not turn an effect into a blurry
low-resolution bitmap.

Each technique uses a versioned visual recipe with independently configurable:

- anticipation pose and windup silhouette;
- origin/attachment point and trajectory;
- elemental material, core, bloom, trail, and secondary particles;
- impact shape, hit rhythm, and target reaction;
- ground interaction, lighting, brief hit-stop, camera emphasis, and sound cue;
- reduced-motion substitute and performance tier.

Reusing a family is encouraged, but changing only hue is not enough. Two techniques
that share a family must differ in at least two major identifiers such as silhouette,
trajectory, timing/rhythm, impact geometry, or target reaction. Common effects are
complete compositions; rarity may add restrained trail, particle, impact, or sound
layers but never supplies missing readability.

### Targeting and timing language

Target intent should emerge from the action:

- melee and charge moves face, compress, and travel toward the target;
- projectiles visibly leave the attacker and establish their path;
- beams build an origin glow and then connect with a solid, animated energy body;
- area attacks use a soft filled ground-light, shadow, crack, ripple, or environmental
  buildup at the affected location;
- target response begins at the recorded contact moment, not at windup start.

Do not draw a generic attacker-to-target dotted connector or dashed target ring.
If anticipation needs extra clarity, use a technique-specific cue such as gathering
motifs, a soft ground decal, directional light, or a brief non-geometric target tint.
Reduced motion keeps the same target and outcome legible with short fades, stable
effect shapes, readable labels, and no camera zoom, recoil, shake, or particle burst.

### Replay presentation contract

The simulation records semantic technique events such as `technique_start`,
`technique_commit`, `technique_hit`, and `technique_end`. Each instance has a stable
deterministic ID, exact battle time, source and target IDs/positions, technique and
visual versions, resolved element/variant parameters, and a presentation seed.
Damage and status changes remain authoritative engine results attached to the hit;
animation callbacks cannot apply them.

The recording also samples explicit `battleSp` and `battleSpCapacity`. Playback
interpolates position and SP for smooth presentation but snaps authoritative event
state at recorded timestamps. It records recipe inputs, not every particle. Old
visual renderers remain available for supported replay versions so catalog or balance
changes do not rewrite history.

## Inventory and permanence

- Chips are stable item instances with unique IDs.
- Equipping moves a chip into a Digimon's technique slot; it does not consume it.
- Unequipping returns it to inventory.
- A chip cannot be equipped by multiple Digimon simultaneously unless the design later changes to account-wide unlocks.
- Locked/favorited chips cannot be dismantled.
- Evolution and devolution preserve equipped chips unless the new form cannot participate in battle for another reason.
- Replays store resolved battle state and technique presentation data so future balance changes do not rewrite history.

## Open balance questions

- Exact bounded charge formula, capacity, technique costs, and useful persistent-SP range.
- Whether a second chip slot can remain readable after one innate plus one chip is proven.
- Which support effects can work reliably without direct player commands.
- Whether chip rerolls replace a value or offer a choice between old and new.
- Whether rare visual variants belong to chips, techniques, or separate cosmetics.

These should be answered through a small vertical slice before building the full drop economy.
