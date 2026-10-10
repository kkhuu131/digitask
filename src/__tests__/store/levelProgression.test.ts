import { expect, it, vi } from 'vitest';
vi.mock('../../lib/supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }));
import { supabase } from '../../lib/supabase';
import { useDigimonStore, type UserDigimon } from '../../store/petStore';

it('replaces stale EXP with the server level without writing another level-up', async () => {
  const stale = { id: 'pet', current_level: 29, experience_points: 1800 } as UserDigimon;
  const committed = { ...stale, current_level: 30, experience_points: 800 };
  const refreshActive = vi.fn(async () => useDigimonStore.setState({ userDigimon: committed }));
  const refreshParty = vi.fn(async () => useDigimonStore.setState({ allUserDigimon: [committed] }));
  useDigimonStore.setState({
    userDigimon: stale,
    fetchUserDigimon: refreshActive,
    fetchAllUserDigimon: refreshParty,
  });
  expect(await useDigimonStore.getState().checkLevelUp()).toBe(true);
  expect(useDigimonStore.getState().userDigimon).toEqual(committed);
  expect(supabase.from).not.toHaveBeenCalled();
  expect(supabase.rpc).not.toHaveBeenCalled();
});
