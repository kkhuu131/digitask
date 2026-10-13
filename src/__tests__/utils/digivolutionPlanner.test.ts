import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EvolutionPath } from '../../constants/evolutionLookup';
import { getDevolutions } from '../../utils/evolutionsHelper';
import { getPlannerPredecessors } from '../../utils/digivolutionPlanner';

vi.mock('../../utils/evolutionsHelper', () => ({ getDevolutions: vi.fn() }));

const path = (
  id: number,
  from: number,
  to: number,
  requirements: Partial<EvolutionPath> = {}
): EvolutionPath => ({
  id,
  from_digimon_id: from,
  to_digimon_id: to,
  level_required: 20,
  stat_requirements: { atk: 80, abi: 10 },
  ...requirements,
});

describe('Digivolution Planner routes', () => {
  beforeEach(() => {
    vi.mocked(getDevolutions).mockReset();
  });

  it('follows incoming routes backward without including forward destinations', () => {
    const routes = [path(1, 18, 23), path(2, 23, 24)];
    vi.mocked(getDevolutions).mockImplementation((target) =>
      routes.filter((route) => route.to_digimon_id === target)
    );
    expect(getPlannerPredecessors(23).map((route) => route.species.id)).toEqual([18]);
    expect(getPlannerPredecessors(18)).toEqual([]);
  });

  it('stops a cycle within its route while keeping a shared predecessor available in other routes', () => {
    const routes = [path(1, 18, 23), path(2, 23, 24), path(3, 24, 18), path(4, 18, 24)];
    vi.mocked(getDevolutions).mockImplementation((target) =>
      routes.filter((route) => route.to_digimon_id === target)
    );
    expect(
      getPlannerPredecessors(18, [24, 23]).find((route) => route.species.id === 24)?.repeatsInRoute
    ).toBe(true);
    expect(
      getPlannerPredecessors(23, [24]).find((route) => route.species.id === 18)?.repeatsInRoute
    ).toBe(false);
    expect(
      getPlannerPredecessors(24).find((route) => route.species.id === 18)?.repeatsInRoute
    ).toBe(false);
  });

  it('preserves distinct routes and their DNA, item, level, stat and ABI requirements', () => {
    const dna = path(1, 18, 23, { dna_requirement: 24 });
    const item = path(2, 18, 23, { item_requirement: 'fixture-item', level_required: 30 });
    vi.mocked(getDevolutions).mockReturnValue([dna, item]);
    expect(getPlannerPredecessors(23).map((route) => route.path)).toEqual([dna, item]);
  });

  it('marks self loops and ignores references to species absent from the catalog', () => {
    vi.mocked(getDevolutions).mockReturnValue([path(1, 18, 18), path(2, -1, 18)]);
    expect(getPlannerPredecessors(18)).toEqual([
      expect.objectContaining({ path: expect.objectContaining({ id: 1 }), repeatsInRoute: true }),
    ]);
  });
});
