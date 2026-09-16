import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  refresh: vi.fn(),
  notify: vi.fn(),
}));
vi.mock('../../lib/supabase', () => ({ supabase: { rpc: mocks.rpc } }));
vi.mock('../../store/authStore', () => ({
  useAuthStore: { getState: () => ({ user: { id: 'test-user' } }) },
}));
vi.mock('../../store/petStore', () => ({
  useDigimonStore: {
    getState: () => ({
      fetchAllUserDigimon: mocks.refresh,
      fetchStorageDigimon: mocks.refresh,
      fetchDiscoveredDigimon: mocks.refresh,
    }),
  },
}));
vi.mock('../../store/notificationStore', () => ({
  useNotificationStore: { getState: () => ({ addNotification: mocks.notify }) },
}));
import { useTitleStore } from '../../store/titleStore';

describe('achievement claims', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
    useTitleStore.setState({
      userTitles: [{ id: 1, title_id: 2, earned_at: '', is_displayed: false, claimed_at: null }],
      error: null,
      fetchUserTitles: mocks.refresh,
    });
  });
  it('keeps failed claims unclaimed and shows the server error', async () => {
    mocks.rpc.mockResolvedValue({ error: { message: 'Reward unavailable' } });
    expect(await useTitleStore.getState().claimAchievement(1)).toBe(false);
    expect(useTitleStore.getState().userTitles[0].claimed_at).toBeNull();
    expect(mocks.notify).toHaveBeenCalledWith({ message: 'Reward unavailable', type: 'error' });
  });
  it('confirms a committed claim even when subsequent refreshes fail', async () => {
    mocks.rpc.mockResolvedValue({ data: { claimed: true, claimed_at: '2026-09-16', bits: 200 } });
    mocks.refresh.mockRejectedValue(new Error('Offline during refresh'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await useTitleStore.getState().claimAchievement(1)).toBe(true);
    expect(useTitleStore.getState().userTitles[0].claimed_at).toBe('2026-09-16');
    expect(mocks.rpc).toHaveBeenCalledWith('claim_achievement', {
      p_user_title_id: 1,
      p_digimon_id: null,
    });
    log.mockRestore();
  });
  it('accepts a repeat attempt confirmed by the server without announcing another reward', async () => {
    mocks.rpc.mockResolvedValue({ data: { claimed: false, claimed_at: '2026-09-16' } });
    expect(await useTitleStore.getState().claimAchievement(1, 18)).toBe(true);
    expect(mocks.notify).not.toHaveBeenCalled();
  });
  it('does not treat an empty server response as a successful claim', async () => {
    mocks.rpc.mockResolvedValue({ data: null });
    expect(await useTitleStore.getState().claimAchievement(1)).toBe(false);
    expect(useTitleStore.getState().userTitles[0].claimed_at).toBeNull();
  });
});
