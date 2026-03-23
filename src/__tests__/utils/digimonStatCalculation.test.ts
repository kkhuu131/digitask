import { describe, it, expect } from 'vitest';
import calculateBaseStat, {
  xpForNextLevel,
  totalCumulativeXp,
  calculateFinalStats,
} from '@/utils/digimonStatCalculation';

// ─── xpForNextLevel ───────────────────────────────────────────────────────────

describe('xpForNextLevel', () => {
  // Formula: 100 + level * 50
  it('returns 150 for level 1', () => {
    expect(xpForNextLevel(1)).toBe(150);
  });

  it('returns 600 for level 10', () => {
    expect(xpForNextLevel(10)).toBe(600);
  });

  it('returns 2600 for level 50', () => {
    expect(xpForNextLevel(50)).toBe(2600);
  });

  it('scales linearly with level', () => {
    expect(xpForNextLevel(20)).toBe(xpForNextLevel(10) + 10 * 50);
  });
});

// ─── totalCumulativeXp ───────────────────────────────────────────────────────

describe('totalCumulativeXp', () => {
  it('returns 0 at level 1 with 0 XP', () => {
    expect(totalCumulativeXp(1, 0)).toBe(0);
  });

  it('adds currentLevelXp to the total', () => {
    expect(totalCumulativeXp(1, 75)).toBe(75);
  });

  it('equals xpForNextLevel(1) at level 2 with 0 XP', () => {
    // Reaching level 2 requires exactly xpForNextLevel(1) = 150 XP
    expect(totalCumulativeXp(2, 0)).toBe(xpForNextLevel(1));
  });
});

// ─── calculateBaseStat ───────────────────────────────────────────────────────

describe('calculateBaseStat', () => {
  // Known values: level1=10, level50=50, level99=100

  it('returns the exact level-1 stat at level 1', () => {
    expect(calculateBaseStat(1, 10, 50, 100)).toBe(10);
  });

  it('returns the exact level-50 stat at level 50', () => {
    expect(calculateBaseStat(50, 10, 50, 100)).toBe(50);
  });

  it('returns the exact level-99 stat at level 99', () => {
    expect(calculateBaseStat(99, 10, 50, 100)).toBe(100);
  });

  it('clamps to level-1 stat for levels below 1', () => {
    expect(calculateBaseStat(0, 10, 50, 100)).toBe(10);
    expect(calculateBaseStat(-10, 10, 50, 100)).toBe(10);
  });

  it('clamps to level-99 stat for levels above 99', () => {
    expect(calculateBaseStat(100, 10, 50, 100)).toBe(100);
    expect(calculateBaseStat(999, 10, 50, 100)).toBe(100);
  });

  it('interpolates correctly in the 1–50 range at level 25', () => {
    // progress = (25-1)/(50-1) = 24/49 ≈ 0.4898
    // result = round(10 + 0.4898 * 40) ≈ round(29.59) = 30
    expect(calculateBaseStat(25, 10, 50, 100)).toBe(30);
  });

  it('interpolates correctly in the 50–99 range at level 75', () => {
    // progress = (75-50)/(99-50) = 25/49 ≈ 0.5102
    // result = round(50 + 0.5102 * 50) ≈ round(75.51) = 76
    expect(calculateBaseStat(75, 10, 50, 100)).toBe(76);
  });

  it('produces values strictly between the boundary stats', () => {
    const mid = calculateBaseStat(25, 10, 50, 100);
    expect(mid).toBeGreaterThan(10);
    expect(mid).toBeLessThan(50);
  });
});

// ─── calculateFinalStats ─────────────────────────────────────────────────────

describe('calculateFinalStats', () => {
  it('returns safe default stats for null input', () => {
    const result = calculateFinalStats(null);
    expect(result.hp).toBe(100);
    expect(result.atk).toBe(10);
    expect(result.spd).toBe(10);
  });

  it('returns safe default stats when digimon.digimon is missing', () => {
    const result = calculateFinalStats({ current_level: 5 });
    expect(result.hp).toBe(100);
  });

  it('adds hp_bonus * 10 to HP', () => {
    const digimon = {
      current_level: 1,
      personality: null,
      hp_bonus: 5,
      sp_bonus: 0,
      atk_bonus: 0,
      def_bonus: 0,
      int_bonus: 0,
      spd_bonus: 0,
      digimon: {
        hp_level1: 100,
        hp: 500,
        hp_level99: 1000,
        sp_level1: 50,
        sp: 100,
        sp_level99: 500,
        atk_level1: 10,
        atk: 50,
        atk_level99: 100,
        def_level1: 10,
        def: 50,
        def_level99: 100,
        int_level1: 10,
        int: 50,
        int_level99: 100,
        spd_level1: 10,
        spd: 50,
        spd_level99: 100,
      },
    };
    const result = calculateFinalStats(digimon);
    // base HP at level 1 = 100, bonus = 5 * 10 = 50
    expect(result.hp).toBe(150);
  });

  it('applies Fighter personality 5% ATK bonus', () => {
    const digimon = {
      current_level: 1,
      personality: 'Fighter',
      hp_bonus: 0,
      sp_bonus: 0,
      atk_bonus: 0,
      def_bonus: 0,
      int_bonus: 0,
      spd_bonus: 0,
      digimon: {
        hp_level1: 100,
        hp: 500,
        hp_level99: 1000,
        sp_level1: 50,
        sp: 100,
        sp_level99: 500,
        atk_level1: 20,
        atk: 50,
        atk_level99: 100,
        def_level1: 10,
        def: 50,
        def_level99: 100,
        int_level1: 10,
        int: 50,
        int_level99: 100,
        spd_level1: 10,
        spd: 50,
        spd_level99: 100,
      },
    };
    const result = calculateFinalStats(digimon);
    // base ATK at level 1 = 20; Fighter: round(20 * 1.05) = 21
    expect(result.atk).toBe(21);
  });

  it('does not apply personality bonus to other stats', () => {
    const digimon = {
      current_level: 1,
      personality: 'Fighter',
      hp_bonus: 0,
      sp_bonus: 0,
      atk_bonus: 0,
      def_bonus: 0,
      int_bonus: 0,
      spd_bonus: 0,
      digimon: {
        hp_level1: 100,
        hp: 500,
        hp_level99: 1000,
        sp_level1: 50,
        sp: 100,
        sp_level99: 500,
        atk_level1: 20,
        atk: 50,
        atk_level99: 100,
        def_level1: 30,
        def: 50,
        def_level99: 100,
        int_level1: 30,
        int: 50,
        int_level99: 100,
        spd_level1: 30,
        spd: 50,
        spd_level99: 100,
      },
    };
    const result = calculateFinalStats(digimon);
    // DEF should not get the bonus
    expect(result.def).toBe(30);
  });
});
