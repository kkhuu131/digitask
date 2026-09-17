import type { Digimon, UserDigimon } from '../store/petStore';
import type { BattleOption } from '../store/battleStore';
import {
  calculateBaseDigimonPowerRating,
  calculateUserDigimonPowerRating,
} from '../utils/digimonStatCalculation';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';

export const calculateUserPowerRating = (allDigimon: UserDigimon[]) => {
  // Use actual combat power (includes bonus stats from task completion)
  const powerRatings = allDigimon
    .map((digimon) => {
      if (!digimon.digimon) return 0;
      return calculateUserDigimonPowerRating(digimon);
    })
    .sort((a, b) => b - a);

  // Average the top 9 (or all if fewer), matching the 9-slot party max
  return powerRatings.slice(0, 9).reduce((acc, p) => acc + p, 0) / Math.min(9, powerRatings.length);
};

// Stage thresholds: derived from actual Digimon stat data (avg power at median evolution level).
// A member whose target power falls below the threshold belongs to that stage.
export const STAGE_THRESHOLDS: [number, string][] = [
  [190, 'Baby'],
  [260, 'In-Training'],
  [350, 'Rookie'],
  [520, 'Champion'],
  [730, 'Ultimate'],
  [970, 'Mega'],
  [Infinity, 'Ultra'],
];

// Minimum level per stage — earliest a Digimon of this stage would naturally appear
export const STAGE_MIN_LEVEL: Record<string, number> = {
  Baby: 1,
  'In-Training': 1,
  Rookie: 5,
  Champion: 14,
  Ultimate: 25,
  Mega: 40,
  Ultra: 50,
};

// Max level before this stage should have evolved (based on actual evolution path data).
// If the binary search exceeds this, promote to the next stage.
export const STAGE_MAX_LEVEL: Record<string, number> = {
  Baby: 8,
  'In-Training': 13,
  Rookie: 16,
  Champion: 30,
  Ultimate: 45,
  Mega: 65,
  Ultra: 99,
};

/** Returns the expected stage for a given per-member power rating. */
export const getStageForPower = (perMemberPower: number): string =>
  STAGE_THRESHOLDS.find(([threshold]) => perMemberPower < threshold)![1];

/** Binary-searches for the level at which `digimon` matches `targetPower`, clamped to [minLevel, maxLevel]. */
export const findLevelForPower = (
  digimon: {
    hp: number;
    sp: number;
    atk: number;
    def: number;
    int: number;
    spd: number;
    hp_level1: number;
    sp_level1: number;
    atk_level1: number;
    def_level1: number;
    int_level1: number;
    spd_level1: number;
    hp_level99: number;
    sp_level99: number;
    atk_level99: number;
    def_level99: number;
    int_level99: number;
    spd_level99: number;
  },
  targetPower: number,
  minLevel: number,
  maxLevel: number
): number => {
  let lo = minLevel,
    hi = maxLevel,
    best = minLevel,
    bestDiff = Infinity;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const power = calculateBaseDigimonPowerRating(digimon as any, mid);
    const diff = Math.abs(power - targetPower);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = mid;
    }
    if (power < targetPower) lo = mid + 1;
    else hi = mid - 1;
  }
  return best;
};

const ATTRIBUTE_WORDS: Record<string, string[]> = {
  Fire: ['Flame', 'Volcano', 'Inferno', 'Blaze', 'Solar', 'Cinder'],
  Water: ['Aqua', 'Tidal', 'Marine', 'Torrent', 'Frost', 'Current'],
  Plant: ['Jungle', 'Thorn', 'Verdant', 'Forest', 'Briar', 'Canopy'],
  Electric: ['Thunder', 'Storm', 'Volt', 'Surge', 'Spark', 'Zap'],
  Wind: ['Gale', 'Sky', 'Cyclone', 'Tempest', 'Breeze', 'Aerial'],
  Earth: ['Terra', 'Boulder', 'Quake', 'Stone', 'Iron', 'Granite'],
  Light: ['Radiant', 'Aurora', 'Celestial', 'Holy', 'Solar', 'Lumen'],
  Dark: ['Shadow', 'Phantom', 'Eclipse', 'Abyss', 'Void', 'Dusk'],
  Neutral: ['Steel', 'Chrome', 'Onyx', 'Silver', 'Crystal', 'Cobalt'],
};

const TYPE_WORDS: Record<string, string[]> = {
  Vaccine: ['Guardian', 'Sacred', 'Aegis', 'Sentinel', 'Blessed'],
  Virus: ['Venom', 'Scourge', 'Plague', 'Blight', 'Corrupt'],
  Data: ['Cyber', 'Binary', 'Matrix', 'Logic', 'Digital'],
  Free: ['Rogue', 'Nomad', 'Vagrant', 'Drifter', 'Outlaw'],
};

const RANK_WORDS: Record<string, string[]> = {
  easy: ['Patrol', 'Scout', 'Grunt', 'Recruit', 'Pack'],
  medium: ['Knight', 'Striker', 'Warden', 'Blade', 'Guard', 'Fang', 'Rush'],
  hard: ['Lord', 'Emperor', 'Sovereign', 'Titan', 'Centurion', 'Royale', 'Legion', 'Overlord'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const generateTeamName = (
  team: { attribute?: string; type?: string }[],
  difficulty: string
): string => {
  // Find dominant attribute and type by frequency
  const attrCount: Record<string, number> = {};
  const typeCount: Record<string, number> = {};
  for (const d of team) {
    if (d.attribute) attrCount[d.attribute] = (attrCount[d.attribute] ?? 0) + 1;
    if (d.type) typeCount[d.type] = (typeCount[d.type] ?? 0) + 1;
  }

  const topAttr = Object.entries(attrCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  const rankWords = RANK_WORDS[difficulty] ?? RANK_WORDS.medium;
  const rank = pickRandom(rankWords);

  // 50/50: use attribute theme or type theme
  if (Math.random() < 0.5 && topAttr && ATTRIBUTE_WORDS[topAttr]) {
    return `${pickRandom(ATTRIBUTE_WORDS[topAttr])} ${rank}`;
  }
  if (topType && TYPE_WORDS[topType]) {
    return `${pickRandom(TYPE_WORDS[topType])} ${rank}`;
  }
  if (topAttr && ATTRIBUTE_WORDS[topAttr]) {
    return `${pickRandom(ATTRIBUTE_WORDS[topAttr])} ${rank}`;
  }
  return `Shadow ${rank}`;
};

export const generateBattleOption = (powerRating: number, difficulty: string) => {
  const difficultyMultipliers: Record<string, number> = { easy: 0.65, medium: 0.8, hard: 1.0 };
  const multiplier = difficultyMultipliers[difficulty] ?? 1.0;
  const targetPower = powerRating * multiplier;
  const teamSize = 3;

  // Always pick a theme (attribute or type, 50/50)
  let teamTheme: { type?: string; attribute?: string } = {};
  if (Math.random() < 0.5) {
    const types = ['Vaccine', 'Data', 'Virus', 'Free'];
    teamTheme.type = pickRandom(types);
  } else {
    const attributes = [
      'Fire',
      'Water',
      'Plant',
      'Electric',
      'Wind',
      'Earth',
      'Light',
      'Dark',
      'Neutral',
    ];
    teamTheme.attribute = pickRandom(attributes);
  }

  // Group digimon by stage, filtered by theme
  const digimonByStage: Record<string, Digimon[]> = {
    Baby: [],
    'In-Training': [],
    Rookie: [],
    Champion: [],
    Ultimate: [],
    Mega: [],
    Ultra: [],
  };

  const buildStageGroups = (filter: boolean) => {
    Object.keys(digimonByStage).forEach((k) => {
      digimonByStage[k] = [];
    });
    Object.values(DIGIMON_LOOKUP_TABLE).forEach((digimon) => {
      if (filter && teamTheme.type && digimon.type !== teamTheme.type) return;
      if (filter && teamTheme.attribute && digimon.attribute !== teamTheme.attribute) return;
      if (digimonByStage[digimon.stage]) digimonByStage[digimon.stage].push(digimon);
    });
  };

  buildStageGroups(true);
  // Fall back to unfiltered if theme has too few Digimon
  const totalInTheme = Object.values(digimonByStage).reduce((s, g) => s + g.length, 0);
  if (totalInTheme < teamSize) {
    buildStageGroups(false);
    teamTheme = {};
  }

  const team: {
    id: number;
    digimon_id: number;
    name: string;
    current_level: number;
    sprite_url: string;
    type: string;
    attribute: string;
  }[] = [];

  // Start with the full team power budget. Each member's share is drawn from
  // the remaining budget rather than splitting evenly up front, so earlier
  // picks can run slightly over or under their "fair share" and later picks
  // compensate — producing teams that feel organically varied rather than
  // three identical-power clones.
  let remainingPower = targetPower * teamSize;

  for (let i = 0; i < teamSize; i++) {
    const isLast = i === teamSize - 1;
    // For all but the last member: divide remaining budget by slots left,
    // then apply ±10% random variance to break symmetry.
    // The last member simply absorbs whatever budget is left.
    const memberTargetPower = isLast
      ? remainingPower
      : (remainingPower / (teamSize - i)) * (0.9 + Math.random() * 0.2);

    const stageOrder = ['Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega', 'Ultra'];

    // Determine stage from threshold table, then promote if the target power
    // requires a level above the stage's natural evolution cap
    let stageIdx = stageOrder.indexOf(
      STAGE_THRESHOLDS.find(([threshold]) => memberTargetPower < threshold)![1]
    );

    const pickCandidates = (idx: number) => {
      let c = digimonByStage[stageOrder[idx]] ?? [];
      if (c.length > 0) return c;
      // Widen to adjacent stages if empty
      for (let delta = 1; delta < stageOrder.length && c.length === 0; delta++) {
        if (idx - delta >= 0) c = digimonByStage[stageOrder[idx - delta]];
        if (c.length === 0 && idx + delta < stageOrder.length)
          c = digimonByStage[stageOrder[idx + delta]];
      }
      return c.length > 0 ? c : Object.values(DIGIMON_LOOKUP_TABLE);
    };

    const binarySearchLevel = (digimon: Digimon, minLvl: number) => {
      let lo = minLvl,
        hi = 99,
        best = minLvl,
        bestDiff = Infinity;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const power = calculateBaseDigimonPowerRating(digimon, mid);
        const diff = Math.abs(power - memberTargetPower);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = mid;
        }
        if (power < memberTargetPower) lo = mid + 1;
        else hi = mid - 1;
      }
      return best;
    };

    // Filter candidates to those whose natural level range can actually hit memberTargetPower.
    // This avoids picking outlier species (e.g. Omegamon in a weak Champion slot) that would
    // need an unnaturally low or high level to match the target.
    const filterByPowerRange = (pool: Digimon[], minLvl: number, maxLvl: number) => {
      const compatible = pool.filter((d) => {
        const pMin = calculateBaseDigimonPowerRating(d, minLvl);
        const pMax = calculateBaseDigimonPowerRating(d, maxLvl);
        return pMin <= memberTargetPower * 1.15 && memberTargetPower <= pMax * 1.15;
      });
      return compatible.length >= 2 ? compatible : pool; // fall back to full pool if too few
    };

    // Try the initial stage; if the level lands too high (Digimon would have evolved),
    // promote to the next stage and retry — repeat until we're in a sensible range or at Ultra
    let minLevel = STAGE_MIN_LEVEL[stageOrder[stageIdx]] ?? 1;
    let candidates = filterByPowerRange(
      pickCandidates(stageIdx),
      minLevel,
      STAGE_MAX_LEVEL[stageOrder[stageIdx]] ?? 99
    );
    let randomDigimon = pickRandom(candidates);
    let bestLevel = binarySearchLevel(randomDigimon, minLevel);

    while (
      bestLevel > (STAGE_MAX_LEVEL[stageOrder[stageIdx]] ?? 99) &&
      stageIdx < stageOrder.length - 1
    ) {
      stageIdx++;
      minLevel = STAGE_MIN_LEVEL[stageOrder[stageIdx]] ?? 1;
      candidates = filterByPowerRange(
        pickCandidates(stageIdx),
        minLevel,
        STAGE_MAX_LEVEL[stageOrder[stageIdx]] ?? 99
      );
      randomDigimon = pickRandom(candidates);
      bestLevel = binarySearchLevel(randomDigimon, minLevel);
    }

    team.push({
      id: randomDigimon.digimon_id * 10 + i, // unique per slot even if the same species appears twice
      digimon_id: randomDigimon.digimon_id,
      name: randomDigimon.name,
      current_level: bestLevel,
      sprite_url: randomDigimon.sprite_url,
      type: randomDigimon.type,
      attribute: randomDigimon.attribute,
    });

    // Deduct the actual power of the chosen member (not the target) so the
    // next iteration's budget reflects the real remaining power deficit.
    remainingPower -= calculateBaseDigimonPowerRating(randomDigimon, bestLevel);
  }

  const teamName = generateTeamName(team, difficulty);

  const battleOption = {
    id: `${difficulty}-wild-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    difficulty,
    team: {
      user_id: '00000000-0000-0000-0000-000000000000',
      username: teamName,
      digimon: team as any,
    },
    isWild: true,
  };

  return battleOption as BattleOption;
};
