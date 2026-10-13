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
    vi.mocked(getDevolutions).mockReturnValue([]);
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
    expect(
      getPlannerPredecessors(23).flatMap((route) =>
        route.kind === 'evolution' ? [route.path] : []
      )
    ).toEqual([dna, item]);
  });

  it('adds Agumon as a form-change route into Agumon X alongside normal evolution routes', () => {
    const normalEvolution = path(345, 23, 345);
    vi.mocked(getDevolutions).mockReturnValue([normalEvolution]);
    const routes = getPlannerPredecessors(345);
    expect(routes).toContainEqual(
      expect.objectContaining({
        kind: 'form',
        species: expect.objectContaining({ id: 18, name: 'Agumon' }),
        form: expect.objectContaining({ formDigimonId: 345, formType: 'X-Antibody' }),
        repeatsInRoute: false,
      })
    );
    expect(routes).toContainEqual(
      expect.objectContaining({ kind: 'evolution', path: normalEvolution })
    );
    expect(new Set(routes.map((route) => route.key)).size).toBe(routes.length);
  });

  it('omits all return-to-base form routes, including the mislabeled Crusadermon return', () => {
    expect(getPlannerPredecessors(18)).toEqual([]);
    expect(getPlannerPredecessors(306)).toEqual([]);
    expect(getPlannerPredecessors(373)).toContainEqual(
      expect.objectContaining({
        kind: 'form',
        species: expect.objectContaining({ id: 306 }),
      })
    );
  });

  it('keeps cycle protection when a form source already appears earlier in the branch', () => {
    expect(getPlannerPredecessors(345, [18])).toContainEqual(
      expect.objectContaining({
        kind: 'form',
        species: expect.objectContaining({ id: 18 }),
        repeatsInRoute: true,
      })
    );
  });

  it('marks self loops and ignores references to species absent from the catalog', () => {
    vi.mocked(getDevolutions).mockReturnValue([path(1, 18, 18), path(2, -1, 18)]);
    expect(getPlannerPredecessors(18)).toEqual([
      expect.objectContaining({ path: expect.objectContaining({ id: 1 }), repeatsInRoute: true }),
    ]);
  });
});
