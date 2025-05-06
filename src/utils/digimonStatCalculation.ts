/**
 * Calculates a Digimon's stat at any level using piecewise linear interpolation
 * between known values at levels 1, 50, and 99.
 *
 * @param level The target level (1-99)
 * @param level1Stat The stat value at level 1
 * @param level50Stat The stat value at level 50
 * @param level99Stat The stat value at level 99
 * @returns The interpolated stat value at the target level
 */
export default function calculateBaseStat(
  level: number,
  level1Stat: number,
  level50Stat: number,
  level99Stat: number
) {
  const clampedLevel = Math.max(1, Math.min(99, level));
  if (clampedLevel === 1) return level1Stat;
  if (clampedLevel === 50) return level50Stat;
  if (clampedLevel === 99) return level99Stat;

  if (clampedLevel < 50) {
    const progress = (clampedLevel - 1) / (50 - 1);
    return Math.round(level1Stat + progress * (level50Stat - level1Stat));
  }

  const progress = (clampedLevel - 50) / (99 - 50);
  return Math.round(level50Stat + progress * (level99Stat - level50Stat));
}

export function calculateFinalStats(digimon: any) {
  const baseStats = {
    hp:
      calculateBaseStat(
        digimon.current_level,
        digimon.digimon.hp_level1 ?? 0,
        digimon.digimon.hp ?? 0,
        digimon.digimon.hp_level99 ?? 0
      ) + (digimon.hp_bonus || 0),
    atk:
      calculateBaseStat(
        digimon.current_level,
        digimon.digimon.atk_level1 ?? 0,
        digimon.digimon.atk ?? 0,
        digimon.digimon.atk_level99 ?? 0
      ) + (digimon.atk_bonus || 0),
    def:
      calculateBaseStat(
        digimon.current_level,
        digimon.digimon.def_level1 ?? 0,
        digimon.digimon.def ?? 0,
        digimon.digimon.def_level99 ?? 0
      ) + (digimon.def_bonus || 0),
    sp:
      calculateBaseStat(
        digimon.current_level,
        digimon.digimon.sp_level1 ?? 0,
        digimon.digimon.sp ?? 0,
        digimon.digimon.sp_level99 ?? 0
      ) + (digimon.sp_bonus || 0),
    int:
      calculateBaseStat(
        digimon.current_level,
        digimon.digimon.int_level1 ?? 0,
        digimon.digimon.int ?? 0,
        digimon.digimon.int_level99 ?? 0
      ) + (digimon.int_bonus || 0),
    spd:
      calculateBaseStat(
        digimon.current_level,
        digimon.digimon.spd_level1 ?? 0,
        digimon.digimon.spd ?? 0,
        digimon.digimon.spd_level99 ?? 0
      ) + (digimon.spd_bonus || 0),
  };

  // Mapping of personality to stat key
  const personalityBoosts: Record<string, keyof typeof baseStats> = {
    Durable: "hp",
    Lively: "sp",
    Fighter: "atk",
    Defender: "def",
    Brainy: "int",
    Nimble: "spd",
  };

  const boostedStats = { ...baseStats };

  const boostKey = personalityBoosts[digimon.personality];
  if (boostKey) {
    boostedStats[boostKey] = Math.floor(boostedStats[boostKey] * 1.05);
  }

  return boostedStats;
}
