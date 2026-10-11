import { describe, expect, it } from 'vitest';
import {
  battleSpChargePerSecond,
  battleSpGaugePercent,
  chargeBattleSp,
  legacySkillGaugePercent,
  sampleBattleSp,
  spendBattleSp,
  PREVIOUS_BATTLE_SP_PER_SECOND,
} from '../../engine/battleSp';

describe('battle SP normalization', () => {
  it('always returns a finite, clamped gauge percentage', () => {
    const cases: [unknown, unknown][] = [
      [undefined, undefined],
      [Number.NaN, 0],
      [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
      ['50', '100'],
      [-20, 100],
      [200, 100],
    ];

    for (const [value, capacity] of cases) {
      const percentage = battleSpGaugePercent(value, capacity);
      expect(Number.isFinite(percentage)).toBe(true);
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    }
    expect(battleSpGaugePercent('50', '100')).toBe(50);
  });

  it('bounds persistent-SP charge rate and charges monotonically', () => {
    expect(battleSpChargePerSecond(-100)).toBe(4);
    expect(battleSpChargePerSecond(Number.NaN)).toBe(4);
    expect(battleSpChargePerSecond(10_000)).toBe(10);

    let current = 0;
    for (const deltaMs of [7, 16, 50, 1000]) {
      const next = chargeBattleSp(current, 100, 150, deltaMs);
      expect(next).toBeGreaterThanOrEqual(current);
      current = next;
    }
  });

  it('takes three times as long to earn a skill at every persistent SP level', () => {
    for (const sp of [0, 150, 300, 450, 10_000]) {
      const oldRate = battleSpChargePerSecond(sp, PREVIOUS_BATTLE_SP_PER_SECOND);
      expect(battleSpChargePerSecond(sp)).toBeCloseTo(oldRate / 3);
      expect(chargeBattleSp(0, 100, sp, (80 / oldRate) * 3000)).toBeCloseTo(80);
      expect(chargeBattleSp(0, 100, sp, (80 / oldRate) * 1000)).toBeCloseTo(80 / 3);
    }
  });

  it('spends once only when the full cost is available', () => {
    expect(spendBattleSp(79, 100, 80)).toBeNull();
    expect(spendBattleSp(100, 100, 80)).toBe(20);
    expect(spendBattleSp(20, 100, 80)).toBeNull();
    expect(spendBattleSp(Number.NaN, 100, 10)).toBeNull();
  });
});

describe('battle SP playback sampling', () => {
  const frames = [
    { t: 0, battleSp: 0, battleSpCapacity: 100 },
    { t: 1000, battleSp: 50, battleSpCapacity: 100 },
    { t: 2000, battleSp: 100, battleSpCapacity: 100 },
    { t: 2100, battleSp: 20, battleSpCapacity: 100, transition: 'snap' as const },
    { t: 3100, battleSp: 70, battleSpCapacity: 100 },
  ];

  it('interpolates charge but holds until a recorded spend', () => {
    expect(sampleBattleSp(frames, 500).battleSp).toBe(25);
    expect(sampleBattleSp(frames, 2050).battleSp).toBe(100);
    expect(sampleBattleSp(frames, 2100).battleSp).toBe(20);
    expect(sampleBattleSp(frames, 2600).battleSp).toBe(45);
  });

  it('returns safe state for missing or corrupt frames', () => {
    expect(sampleBattleSp([], Number.NaN)).toEqual({ battleSp: 0, battleSpCapacity: 100 });
    const sampled = sampleBattleSp(
      [{ t: 0, battleSp: Number.NaN, battleSpCapacity: 0 }],
      Number.POSITIVE_INFINITY
    );
    expect(sampled).toEqual({ battleSp: 0, battleSpCapacity: 1 });
  });
});

describe('legacy skill gauge', () => {
  it('moves immediately through the randomized initial cooldown window', () => {
    expect(legacySkillGaugePercent(14_984, 15_000, false)).toBeGreaterThan(0);
    expect(legacySkillGaugePercent(0, 15_000, false)).toBe(100);
    expect(legacySkillGaugePercent(undefined, undefined, false)).toBeGreaterThanOrEqual(0);
    expect(legacySkillGaugePercent(Number.NaN, 0, true)).toBe(100);
  });
});
