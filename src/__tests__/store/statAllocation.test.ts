import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../../lib/supabase', () => ({ supabase: { rpc: vi.fn() } }));
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useDigimonStore, type UserDigimon } from '../../store/petStore';
import { EMPTY_ALLOCATION, bonusSnapshot } from '../../utils/statAllocation';

const pet = {
  id: 'pet',
  user_id: 'owner',
  abi: 0,
  hp_bonus: 0,
  sp_bonus: 0,
  atk_bonus: 0,
  def_bonus: 0,
  int_bonus: 0,
  spd_bonus: 0,
  digimon: { name: 'Agumon' },
} as UserDigimon;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('localStorage', { setItem: vi.fn() });
  useAuthStore.setState({ user: { id: 'owner' } as any });
  useDigimonStore.setState({ userDigimon: pet, allUserDigimon: [pet] });
});

describe('atomic stat save', () => {
  it('sends one batch and changes shared state only after confirmation', async () => {
    let confirm!: (value: any) => void;
    vi.mocked(supabase.rpc).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          confirm = resolve;
        }) as any
    );
    const allocations = { ...EMPTY_ALLOCATION, HP: 2, ATK: 3 };
    const saving = useDigimonStore
      .getState()
      .allocateStats(pet.id, allocations, bonusSnapshot(pet));
    expect(useDigimonStore.getState().userDigimon).toBe(pet);
    expect(supabase.rpc).toHaveBeenCalledExactlyOnceWith('allocate_stats', {
      p_digimon_id: pet.id,
      p_allocations: allocations,
      p_expected_bonuses: bonusSnapshot(pet),
    });
    confirm({
      data: {
        success: true,
        saved_stats: { HP: 4, ATK: 0 },
        digimon: { ...pet, digimon: undefined, hp_bonus: 2, atk_bonus: 3 },
      },
      error: null,
    });
    await saving;
    expect(useDigimonStore.getState().userDigimon?.hp_bonus).toBe(2);
    expect(useDigimonStore.getState().userDigimon?.digimon?.name).toBe('Agumon');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'savedStats',
      JSON.stringify({ HP: 4, ATK: 0 })
    );
  });
  it('refreshes authoritative state after a rejected stale draft', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: {
        success: false,
        reason: 'changed',
        saved_stats: { HP: 3 },
        digimon: { ...pet, hp_bonus: 5 },
      },
      error: null,
    } as any);
    const result = await useDigimonStore
      .getState()
      .allocateStats(pet.id, { ...EMPTY_ALLOCATION, HP: 2 }, bonusSnapshot(pet));
    expect(result.success).toBe(false);
    expect(useDigimonStore.getState().userDigimon?.hp_bonus).toBe(5);
  });
  it('keeps confirmed state and cached balances unchanged on a transport failure', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: new Error('offline'),
    } as any);
    await expect(
      useDigimonStore
        .getState()
        .allocateStats(pet.id, { ...EMPTY_ALLOCATION, HP: 2 }, bonusSnapshot(pet))
    ).rejects.toThrow('offline');
    expect(useDigimonStore.getState().userDigimon).toBe(pet);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
