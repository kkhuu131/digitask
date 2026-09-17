import { describe, expect, it } from 'vitest';
import type { UserDigimon } from '../../store/petStore';
import { selectStrongestTeam } from '../../utils/selectStrongestTeam';

const pet = (id: string, hp: number, other: number, level = 1): UserDigimon =>
  ({
    id,
    current_level: level,
    is_in_storage: false,
    digimon: Object.fromEntries(
      ['hp', 'sp', 'atk', 'def', 'int', 'spd'].flatMap((stat) =>
        ['', '_level1', '_level99'].map((suffix) => [stat + suffix, stat === 'hp' ? hp : other])
      )
    ),
  }) as unknown as UserDigimon;

describe('selectStrongestTeam', () => {
  it('uses actual species stats and bonuses rather than level alone', () => {
    const highLevel = pet('high-level', 100, 10, 99);
    const strongSpecies = pet('strong-species', 1000, 100);
    const trained = { ...pet('trained', 100, 10), atk_bonus: 1000 };
    expect(selectStrongestTeam([highLevel, strongSpecies, trained]).map((d) => d.id)).toEqual([
      'trained',
      'strong-species',
      'high-level',
    ]);
  });
  it('normalizes HP so a health-heavy Digimon does not win by raw stat scale', () => {
    expect(
      selectStrongestTeam([pet('health-heavy', 800, 20), pet('balanced', 300, 40)])[0].id
    ).toBe('balanced');
  });
  it('selects up to three unique non-storage party members without mutating the input', () => {
    const a = pet('a', 100, 30),
      b = pet('b', 100, 20),
      c = pet('c', 100, 10),
      d = pet('d', 100, 5);
    const party = [d, c, b, a, a, { ...pet('stored', 10000, 1000), is_in_storage: true }];
    const original = [...party];
    expect(selectStrongestTeam(party).map((d) => d.id)).toEqual(['a', 'b', 'c']);
    expect(party).toEqual(original);
    expect(selectStrongestTeam([])).toEqual([]);
    expect(selectStrongestTeam([a])).toEqual([a]);
  });
  it('breaks equal stat scores by level, then stable ID', () => {
    expect(
      selectStrongestTeam([
        pet('b', 100, 20, 10),
        pet('a', 100, 20, 10),
        pet('c', 100, 20, 20),
      ]).map((d) => d.id)
    ).toEqual(['c', 'a', 'b']);
  });
});
