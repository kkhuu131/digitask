import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateDamage } from '@/utils/battleCalculations';
import type { BattleDigimon } from '@/types/battle';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeDigimon(
  overrides: Partial<BattleDigimon['stats']> = {},
  type = 'Vaccine',
  attribute = 'Neutral'
): BattleDigimon {
  return {
    id: 'test',
    name: 'Test',
    digimon_name: 'Agumon',
    current_level: 10,
    sprite_url: '',
    type,
    attribute,
    isAlive: true,
    isOnUserTeam: true,
    stats: {
      hp: 100,
      max_hp: 100,
      atk: 50,
      def: 50,
      int: 30,
      spd: 30,
      sp: 50,
      ...overrides,
    },
  };
}

// Mock Math.random in a controlled way:
// calculateDamage calls Math.random() three times in order:
//   1st → miss check  (< 0.07 = miss)
//   2nd → crit check  (< 0.125 = crit)
//   3rd → variance    (0.8 + value * 0.4)
function mockRandom(miss: number, crit: number, variance: number) {
  vi.spyOn(Math, 'random')
    .mockReturnValueOnce(miss)
    .mockReturnValueOnce(crit)
    .mockReturnValueOnce(variance);
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Miss ────────────────────────────────────────────────────────────────────

describe('calculateDamage — miss', () => {
  it('returns 0 damage and isMiss=true when random is below miss chance (0.07)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const result = calculateDamage(makeDigimon(), makeDigimon());
    expect(result.isMiss).toBe(true);
    expect(result.damage).toBe(0);
    expect(result.isCritical).toBe(false);
  });
});

// ─── Hit ─────────────────────────────────────────────────────────────────────

describe('calculateDamage — normal hit', () => {
  it('returns damage >= 1 and isMiss=false on a normal hit', () => {
    mockRandom(0.5, 0.5, 0.5); // no miss, no crit, mid variance
    const result = calculateDamage(makeDigimon(), makeDigimon());
    expect(result.isMiss).toBe(false);
    expect(result.isCritical).toBe(false);
    expect(result.damage).toBeGreaterThanOrEqual(1);
  });

  it('always produces at least 1 damage even with very low stats', () => {
    mockRandom(0.5, 0.5, 0.0); // minimum variance
    const weakAttacker = makeDigimon({ atk: 1, int: 1 });
    const tankTarget = makeDigimon({ def: 9999, int: 9999 });
    const result = calculateDamage(weakAttacker, tankTarget);
    expect(result.damage).toBeGreaterThanOrEqual(1);
  });
});

// ─── Critical hit ─────────────────────────────────────────────────────────────

describe('calculateDamage — critical hit', () => {
  it('sets isCritical=true when random is below crit chance (0.125)', () => {
    mockRandom(0.5, 0.01, 0.5); // no miss, crit, mid variance
    const result = calculateDamage(makeDigimon(), makeDigimon());
    expect(result.isCritical).toBe(true);
  });

  it('deals more damage on a crit than an identical non-crit', () => {
    const attacker = makeDigimon({ atk: 50 });
    const target = makeDigimon({ def: 50 });

    mockRandom(0.5, 0.01, 0.0); // crit, minimum variance
    const critResult = calculateDamage(attacker, target);

    mockRandom(0.5, 0.5, 0.0); // no crit, same variance
    const normalResult = calculateDamage(attacker, target);

    expect(critResult.damage).toBeGreaterThan(normalResult.damage);
  });
});

// ─── Physical vs magic ────────────────────────────────────────────────────────

describe('calculateDamage — physical vs magic', () => {
  it('uses ATK/DEF path when ATK >= INT', () => {
    // attacker: atk=100, int=10; target: def=50, int=50
    // physical: round(max(1, (100/50) * 50 * 0.8)) = round(80) = 80
    mockRandom(0.5, 0.5, 0.0); // no miss/crit, minimum variance
    const result = calculateDamage(
      makeDigimon({ atk: 100, int: 10 }),
      makeDigimon({ def: 50, int: 50 })
    );
    expect(result.damage).toBe(80);
  });

  it('uses INT/INT path when INT > ATK', () => {
    // attacker: int=100, atk=10; target: int=50
    // magic: round(max(1, (100/50) * 50 * 0.8)) = round(80) = 80
    mockRandom(0.5, 0.5, 0.0);
    const result = calculateDamage(
      makeDigimon({ int: 100, atk: 10 }),
      makeDigimon({ def: 50, int: 50 })
    );
    expect(result.damage).toBe(80);
  });
});

// ─── Type advantage ───────────────────────────────────────────────────────────

describe('calculateDamage — type matchup', () => {
  it('applies 2x multiplier when Vaccine attacks Virus', () => {
    // (50/50) * 50 * 0.8 * 2.0 = 80
    mockRandom(0.5, 0.5, 0.0);
    const result = calculateDamage(
      makeDigimon({ atk: 50 }, 'Vaccine'),
      makeDigimon({ def: 50 }, 'Virus')
    );
    expect(result.damage).toBe(80);
  });

  it('applies 0.5x multiplier when Vaccine attacks Data', () => {
    // (50/50) * 50 * 0.8 * 0.5 = 20
    mockRandom(0.5, 0.5, 0.0);
    const result = calculateDamage(
      makeDigimon({ atk: 50 }, 'Vaccine'),
      makeDigimon({ def: 50 }, 'Data')
    );
    expect(result.damage).toBe(20);
  });

  it('applies 1x when attacker type is Free', () => {
    // (50/50) * 50 * 0.8 * 1.0 = 40
    mockRandom(0.5, 0.5, 0.0);
    const result = calculateDamage(
      makeDigimon({ atk: 50 }, 'Free'),
      makeDigimon({ def: 50 }, 'Virus')
    );
    expect(result.damage).toBe(40);
  });
});
