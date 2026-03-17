/**
 * Analysis script: Compute real power ranges and evolution levels per stage
 * from actual digimon + evolution lookup data.
 *
 * Run with: npx tsx scripts/analyze-stage-thresholds.ts
 */

import { DIGIMON_LOOKUP_TABLE } from '../src/constants/digimonLookup';
import { EVOLUTION_LOOKUP_TABLE } from '../src/constants/evolutionLookup';
import { calculateBaseDigimonPowerRating } from '../src/utils/digimonStatCalculation';

const STAGES = ['Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega', 'Ultra'] as const;
type Stage = typeof STAGES[number];

// ── helpers ────────────────────────────────────────────────────────────────
const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
const pct = (arr: number[], p: number) => arr.length ? arr[Math.floor(arr.length * p)] : 0;

// ── group digimon by stage ─────────────────────────────────────────────────
const byStage: Record<Stage, typeof DIGIMON_LOOKUP_TABLE[number][]> = {
  Baby: [], 'In-Training': [], Rookie: [], Champion: [], Ultimate: [], Mega: [], Ultra: [],
};
const idToStage: Record<number, Stage> = {};

for (const d of Object.values(DIGIMON_LOOKUP_TABLE)) {
  const s = d.stage as Stage;
  if (byStage[s]) byStage[s].push(d);
  idToStage[d.digimon_id] = s;
}

// ── group evolution level_required by from-stage ───────────────────────────
const evoLevelsByFromStage: Record<Stage, number[]> = {
  Baby: [], 'In-Training': [], Rookie: [], Champion: [], Ultimate: [], Mega: [], Ultra: [],
};

for (const path of EVOLUTION_LOOKUP_TABLE.all) {
  const fromStage = idToStage[path.from_digimon_id];
  if (fromStage && evoLevelsByFromStage[fromStage] && path.level_required > 0) {
    evoLevelsByFromStage[fromStage].push(path.level_required);
  }
}

// ── report ─────────────────────────────────────────────────────────────────
console.log('=== DIGIMON COUNT PER STAGE ===');
for (const s of STAGES) {
  console.log(`  ${s.padEnd(12)}: ${byStage[s].length}`);
}

console.log('\n=== EVOLUTION LEVEL_REQUIRED BY FROM-STAGE ===');
for (const s of STAGES) {
  const levels = evoLevelsByFromStage[s].sort((a, b) => a - b);
  if (!levels.length) { console.log(`  ${s}: no paths`); continue; }
  const n = levels.length;
  console.log(
    `  ${s.padEnd(12)}: min=${levels[0]}  p25=${pct(levels, 0.25)}  med=${pct(levels, 0.5)}` +
    `  avg=${avg(levels)}  p75=${pct(levels, 0.75)}  max=${levels[n - 1]}  (n=${n})`
  );
}

console.log('\n=== POWER RANGES PER STAGE AT KEY LEVELS ===');
for (const s of STAGES) {
  const digiList = byStage[s];
  if (!digiList.length) continue;
  const evoLevels = evoLevelsByFromStage[s].sort((a, b) => a - b);

  const minEvoLevel = evoLevels.length ? evoLevels[0] : null;
  const medEvoLevel = evoLevels.length ? pct(evoLevels, 0.5) : null;
  const maxEvoLevel = evoLevels.length ? evoLevels[evoLevels.length - 1] : null;

  const pw = (lvl: number) => digiList.map(d => calculateBaseDigimonPowerRating(d, lvl));
  const fmt = (arr: number[]) => `avg=${avg(arr)}  range=[${Math.min(...arr)}-${Math.max(...arr)}]`;

  console.log(`\n  ${s}:`);
  console.log(`    L1          : ${fmt(pw(1))}`);
  if (minEvoLevel) console.log(`    L${String(minEvoLevel).padStart(2)} (min evo): ${fmt(pw(minEvoLevel))}`);
  if (medEvoLevel) console.log(`    L${String(medEvoLevel).padStart(2)} (med evo): ${fmt(pw(medEvoLevel))}`);
  if (maxEvoLevel) console.log(`    L${String(maxEvoLevel).padStart(2)} (max evo): ${fmt(pw(maxEvoLevel))}`);
  console.log(`    L99         : ${fmt(pw(99))}`);
}

// ── derive recommended stage thresholds ───────────────────────────────────
// A stage's power threshold = the max power a member of that stage can have
// before they "should" have evolved = power at the max observed evolution level
console.log('\n=== RECOMMENDED STAGE_THRESHOLDS (power per member) ===');
console.log('  (based on avg power at the max observed evolution level for each stage)\n');
for (const s of STAGES) {
  const digiList = byStage[s];
  if (!digiList.length) continue;
  const evoLevels = evoLevelsByFromStage[s].sort((a, b) => a - b);
  const maxEvo = evoLevels.length ? evoLevels[evoLevels.length - 1] : 99;
  const medEvo = evoLevels.length ? pct(evoLevels, 0.5) : 10;

  const pwAtMax = digiList.map(d => calculateBaseDigimonPowerRating(d, maxEvo));
  const pwAtMed = digiList.map(d => calculateBaseDigimonPowerRating(d, medEvo));

  console.log(
    `  ${s.padEnd(12)}: max_evo_level=${maxEvo}` +
    `  power_at_max_evo avg=${avg(pwAtMax)} max=${Math.max(...pwAtMax)}` +
    `  | med_evo_level=${medEvo} power_at_med_evo avg=${avg(pwAtMed)}`
  );
}

// ── show current user-facing power distribution at relevant levels ─────────
console.log('\n=== STAGE POWER BANDS (natural level range, avg digimon) ===');
const naturalRanges: Record<Stage, [number, number]> = {
  Baby: [1, 8], 'In-Training': [1, 13], Rookie: [3, 16],
  Champion: [8, 30], Ultimate: [15, 45], Mega: [25, 65], Ultra: [40, 99],
};
for (const s of STAGES) {
  const digiList = byStage[s];
  if (!digiList.length) continue;
  const [minL, maxL] = naturalRanges[s];
  const pwMin = avg(digiList.map(d => calculateBaseDigimonPowerRating(d, minL)));
  const pwMax = avg(digiList.map(d => calculateBaseDigimonPowerRating(d, maxL)));
  console.log(`  ${s.padEnd(12)}: L${minL}→L${maxL}  power band: [${pwMin} → ${pwMax}]`);
}
