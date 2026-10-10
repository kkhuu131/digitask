import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  refresh: vi.fn(),
  dailyStats: vi.fn(),
  notify: vi.fn(),
  streakTitles: vi.fn(),
}));
vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: mocks.rpc,
    from: mocks.from,
    auth: { getUser: async () => ({ data: { user: { id: 'test-user' } } }) },
  },
}));
vi.mock('../../store/petStore', () => ({
  useDigimonStore: {
    getState: () => ({
      fetchAllUserDigimon: mocks.refresh,
      fetchUserDigimon: mocks.refresh,
      fetchUserDailyStatGains: mocks.dailyStats,
    }),
  },
}));
vi.mock('../../store/notificationStore', () => ({
  useNotificationStore: { getState: () => ({ addNotification: mocks.notify }) },
}));
vi.mock('../../store/titleStore', () => ({
  useTitleStore: { getState: () => ({ checkStreakTitles: mocks.streakTitles }) },
}));
import { getExpPoints, getStatPoints, useTaskStore, type Task } from '../../store/taskStore';

describe('task rewards', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });
    vi.stubGlobal('localStorage', { setItem: vi.fn() });
    mocks.from.mockReturnValue({
      select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
    });
    useTaskStore.setState({
      tasks: [
        { id: 'third-task', is_completed: false } as Task,
        { id: 'fourth-task', is_completed: false } as Task,
      ],
      dailyQuota: null,
      fetchDailyQuota: mocks.refresh,
      error: null,
    });
  });

  it.each([
    ['easy', 'low', 1, 56],
    ['easy', 'high', 1, 113],
    ['medium', 'medium', 1, 150],
    ['hard', 'high', 2, 900],
    ['medium', 'medium', 1.9, 285],
  ] as const)('previews %s/%s at %sx as %s EXP', (difficulty, priority, streak, exp) => {
    expect(getExpPoints({ difficulty, priority }, streak)).toBe(exp);
  });

  it('defaults missing task settings and awards easy tasks a stat point', () => {
    expect(getExpPoints({})).toBe(150);
    expect(getStatPoints({ difficulty: 'easy' })).toBe(1);
    expect(getStatPoints({ difficulty: 'medium' })).toBe(1);
    expect(getStatPoints({ difficulty: 'hard' })).toBe(2);
  });

  it('confirms the committed quota bonus even with stale or missing quota state', async () => {
    mocks.rpc.mockResolvedValue({
      data: {
        quota_bonus_exp: 600,
        daily_quota: { completed_today: 3, current_streak: 11, quota_rewarded: true },
      },
    });
    await useTaskStore.getState().completeTask('third-task');
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.notify).toHaveBeenCalledWith({
      message: 'Daily Quota Complete! All party members received 600 EXP!',
      type: 'success',
    });
    expect(mocks.streakTitles).toHaveBeenCalledWith(11);
    expect(useTaskStore.getState().error).toBeNull();
  });

  it('does not announce a quota bonus for an extra task', async () => {
    mocks.rpc.mockResolvedValue({ data: { quota_bonus_exp: 0 } });
    await useTaskStore.getState().completeTask('fourth-task');
    expect(mocks.notify).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it('keeps a committed task complete when refreshing its display fails', async () => {
    mocks.rpc.mockResolvedValue({ data: { quota_bonus_exp: 0 } });
    mocks.refresh.mockRejectedValueOnce(new Error('Offline after commit'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await useTaskStore.getState().completeTask('third-task');
    expect(useTaskStore.getState().tasks[0].is_completed).toBe(true);
    expect(mocks.notify).toHaveBeenCalledWith({
      message: 'Task completed and rewards saved. Refresh to update your display.',
      type: 'info',
    });
    log.mockRestore();
  });

  it('reverts the optimistic completion when the server rejects it', async () => {
    mocks.rpc.mockResolvedValue({ error: new Error('Task already completed') });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await useTaskStore.getState().completeTask('third-task');
    expect(useTaskStore.getState().tasks[0].is_completed).toBe(false);
    expect(mocks.refresh).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
