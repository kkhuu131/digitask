import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { getUser: vi.fn() },
  from: vi.fn(),
  getEvolutionPath: vi.fn(),
  getEvolutions: vi.fn(),
  species: {
    id: 1,
    name: 'Fixture',
    stage: 'Rookie',
    sprite_url: '/fixture.png',
    hp_level1: 710,
    hp: 710,
    hp_level99: 710,
    sp_level1: 71,
    sp: 71,
    sp_level99: 71,
    atk_level1: 71,
    atk: 71,
    atk_level99: 71,
    def_level1: 71,
    def: 71,
    def_level99: 71,
    int_level1: 71,
    int: 71,
    int_level99: 71,
    spd_level1: 71,
    spd: 71,
    spd_level99: 71,
  },
}));
vi.mock('../../lib/supabase', () => ({ supabase: { auth: mocks.auth, from: mocks.from } }));
vi.mock('../../utils/evolutionsHelper', () => ({
  getEvolutionPath: mocks.getEvolutionPath,
  getEvolutions: mocks.getEvolutions,
  getDevolutions: vi.fn(),
}));
vi.mock('../../constants/digimonLookup', () => ({
  DIGIMON_LOOKUP_TABLE: { 1: mocks.species, 2: { ...mocks.species, id: 2, stage: 'Champion' } },
}));
import { useDigimonStore, type UserDigimon } from '../../store/petStore';
import { useTitleStore } from '../../store/titleStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { getEvolutionStatRequirements } from '../../utils/evolutionRequirements';

const pet = {
  id: 'pet',
  user_id: 'owner',
  digimon_id: 1,
  current_level: 50,
  abi: 20,
  experience_points: 100,
  hp_bonus: 12,
  sp_bonus: 12,
  atk_bonus: 12,
  def_bonus: 12,
  int_bonus: 12,
  spd_bonus: 12,
  personality: 'Brainy',
  digimon: mocks.species,
} as UserDigimon;
const path = {
  from_digimon_id: 1,
  to_digimon_id: 2,
  level_required: 20,
  stat_requirements: { int: 85 },
};
let readSingle: ReturnType<typeof vi.fn>;
let writeSingle: ReturnType<typeof vi.fn>;
let update: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.auth.getUser.mockResolvedValue({ data: { user: { id: 'owner' } } });
  mocks.getEvolutionPath.mockReturnValue(path);
  mocks.getEvolutions.mockReturnValue([path]);
  readSingle = vi.fn().mockResolvedValue({ data: pet, error: null });
  writeSingle = vi.fn().mockResolvedValue({ data: { digimon_id: 2 }, error: null });
  update = vi.fn();
  mocks.from.mockImplementation(() => {
    let writing = false;
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      update: (values: unknown) => {
        writing = true;
        update(values);
        return builder;
      },
      single: () => (writing ? writeSingle() : readSingle()),
    };
    return builder;
  });
  useDigimonStore.setState({
    userDigimon: pet,
    allUserDigimon: [pet],
    error: null,
    loading: false,
    addDiscoveredDigimon: vi.fn(),
    fetchAllUserDigimon: vi.fn(),
    fetchUserDigimon: vi.fn(),
  });
  useTitleStore.setState({ checkEvolutionTitles: vi.fn() });
  useInventoryStore.setState({
    checkEvolutionItem: vi.fn().mockResolvedValue(true),
    useItem: vi.fn().mockResolvedValue(true),
  });
});
afterEach(() => vi.restoreAllMocks());

describe('evolution requirements and saving', () => {
  it('accepts 87 INT from 71 base, +12 training and Brainy for an 85 INT path', async () => {
    expect(getEvolutionStatRequirements(pet, path.stat_requirements)).toEqual([
      { name: 'INT', current: 87, required: 85, meets: true },
    ]);
    expect(await useDigimonStore.getState().checkEvolution()).toBe(true);
    await useDigimonStore.getState().evolveDigimon(2, pet.id);
    expect(update).toHaveBeenCalledExactlyOnceWith({
      digimon_id: 2,
      current_level: 1,
      experience_points: 0,
      abi: 26,
    });
    expect(useDigimonStore.getState().error).toBeNull();
  });
  it.each([
    ['Durable', 'hp', 850, 872],
    ['Lively', 'sp', 85, 87],
    ['Fighter', 'atk', 85, 87],
    ['Defender', 'def', 85, 87],
    ['Brainy', 'int', 85, 87],
    ['Nimble', 'spd', 85, 87],
  ])(
    'counts %s and trained bonuses for %s requirements',
    (personality, stat, required, current) => {
      expect(getEvolutionStatRequirements({ ...pet, personality }, { [stat]: required })).toEqual([
        { name: stat.toUpperCase(), current, required, meets: true },
      ]);
    }
  );
  it('uses the same final rounding at an exact threshold, and checks ABI separately', () => {
    const roundedPet = { ...pet, int_bonus: 10 };
    expect(getEvolutionStatRequirements(roundedPet, { int: 85, abi: 21 })).toEqual([
      { name: 'INT', current: 85, required: 85, meets: true },
      { name: 'ABI', current: 20, required: 21, meets: false },
    ]);
  });
  it('does not consume an evolution item when stats do not qualify', async () => {
    readSingle.mockResolvedValue({ data: { ...pet, personality: 'Fighter' }, error: null });
    mocks.getEvolutionPath.mockReturnValue({ ...path, item_requirement: 'digi_egg_of_courage' });
    await expect(useDigimonStore.getState().evolveDigimon(2, pet.id)).rejects.toThrow('INT: 83/85');
    expect(useInventoryStore.getState().useItem).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
  it('rechecks saved stats even when evolving the active pet without an explicit ID', async () => {
    readSingle.mockResolvedValue({ data: { ...pet, int_bonus: 0 }, error: null });
    await expect(useDigimonStore.getState().evolveDigimon(2)).rejects.toThrow('INT: 75/85');
    expect(update).not.toHaveBeenCalled();
  });
  it('rejects an update that did not return the evolved species', async () => {
    writeSingle.mockResolvedValue({ data: null, error: null });
    await expect(useDigimonStore.getState().evolveDigimon(2, pet.id)).rejects.toThrow(
      'Evolution was not saved'
    );
    expect(useDigimonStore.getState().addDiscoveredDigimon).not.toHaveBeenCalled();
  });
  it('propagates database failures so the dialog can keep errors visible', async () => {
    writeSingle.mockResolvedValue({ data: null, error: new Error('Connection lost') });
    await expect(useDigimonStore.getState().evolveDigimon(2, pet.id)).rejects.toThrow(
      'Connection lost'
    );
    expect(useDigimonStore.getState()).toMatchObject({ loading: false, error: 'Connection lost' });
  });
  it('rejects an expired session instead of silently reporting success', async () => {
    mocks.auth.getUser.mockResolvedValue({ data: { user: null } });
    await expect(useDigimonStore.getState().evolveDigimon(2, pet.id)).rejects.toThrow(
      'session has expired'
    );
    expect(update).not.toHaveBeenCalled();
  });
  it('does not evolve when the required item could not be consumed', async () => {
    mocks.getEvolutionPath.mockReturnValue({ ...path, item_requirement: 'digi_egg_of_courage' });
    useInventoryStore.setState({ useItem: vi.fn().mockResolvedValue(false) });
    await expect(useDigimonStore.getState().evolveDigimon(2, pet.id)).rejects.toThrow(
      'item could not be used'
    );
    expect(update).not.toHaveBeenCalled();
  });
  it('confirms saved devolution before resolving and preserves its ABI gain', async () => {
    readSingle.mockResolvedValue({ data: { ...pet, digimon_id: 2 }, error: null });
    writeSingle.mockResolvedValue({ data: { digimon_id: 1 }, error: null });
    useDigimonStore.setState({ discoveredDigimon: [1] });
    await useDigimonStore.getState().devolveDigimon(1, pet.id);
    expect(update).toHaveBeenCalledExactlyOnceWith({
      digimon_id: 1,
      current_level: 1,
      experience_points: 0,
      abi: 31,
    });
  });
  it('rejects devolution when no saved species was returned', async () => {
    readSingle.mockResolvedValue({ data: { ...pet, digimon_id: 2 }, error: null });
    writeSingle.mockResolvedValue({ data: null, error: null });
    useDigimonStore.setState({ discoveredDigimon: [1] });
    await expect(useDigimonStore.getState().devolveDigimon(1, pet.id)).rejects.toThrow(
      'Devolution was not saved'
    );
  });
});
