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
  // Make sure digimon and digimon.digimon exist
  if (!digimon || !digimon.digimon) {
    console.error("Invalid digimon data:", digimon);
    // Return default stats to prevent crashes
    return {
      hp: 100,
      sp: 50,
      atk: 10,
      def: 10,
      int: 10,
      spd: 10,
    };
  }

  const baseDigimon = digimon.digimon;
  const level = digimon.current_level || 1;

  // Calculate base stats for current level with null checks
  const baseHP = calculateBaseStat(
    level,
    baseDigimon.hp_level1 || 100,
    baseDigimon.hp || 100,
    baseDigimon.hp_level99 || 1000
  );

  const baseSP = calculateBaseStat(
    level,
    baseDigimon.sp_level1 || 50,
    baseDigimon.sp || 50,
    baseDigimon.sp_level99 || 500
  );

  const baseATK = calculateBaseStat(
    level,
    baseDigimon.atk_level1 || 10,
    baseDigimon.atk || 10,
    baseDigimon.atk_level99 || 100
  );

  const baseDEF = calculateBaseStat(
    level,
    baseDigimon.def_level1 || 10,
    baseDigimon.def || 10,
    baseDigimon.def_level99 || 100
  );

  const baseINT = calculateBaseStat(
    level,
    baseDigimon.int_level1 || 10,
    baseDigimon.int || 10,
    baseDigimon.int_level99 || 100
  );

  const baseSPD = calculateBaseStat(
    level,
    baseDigimon.spd_level1 || 10,
    baseDigimon.spd || 10,
    baseDigimon.spd_level99 || 100
  );

  // Apply bonuses
  const hp = Math.round(baseHP * (1 + (digimon.hp_bonus || 0) / 100));
  const sp = Math.round(baseSP * (1 + (digimon.sp_bonus || 0) / 100));
  const atk = Math.round(baseATK * (1 + (digimon.atk_bonus || 0) / 100));
  const def = Math.round(baseDEF * (1 + (digimon.def_bonus || 0) / 100));
  const int = Math.round(baseINT * (1 + (digimon.int_bonus || 0) / 100));
  const spd = Math.round(baseSPD * (1 + (digimon.spd_bonus || 0) / 100));

  return { hp, sp, atk, def, int, spd };
}
