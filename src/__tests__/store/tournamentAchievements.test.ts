import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tournamentProgress } from '../../utils/achievementProgress';
import type { UserTournament } from '../../types/tournament';

const mocks = vi.hoisted(() => ({
  history: [] as Partial<UserTournament>[],
  existing: [] as { title_id: number }[],
  insert: vi.fn(),
  refresh: vi.fn(),
  error: null as null | { message: string },
}));
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (table: string) =>
      table === 'user_tournaments'
        ? { select: () => ({ eq: async () => ({ data: mocks.history, error: mocks.error }) }) }
        : {
            select: () => ({ eq: () => ({ in: async () => ({ data: mocks.existing }) }) }),
            insert: mocks.insert,
          },
  },
}));
vi.mock('../../store/authStore', () => ({
  useAuthStore: { getState: () => ({ user: { id: 'trainer' } }) },
}));
vi.mock('../../store/petStore', () => ({ useDigimonStore: { getState: () => ({}) } }));
vi.mock('../../store/notificationStore', () => ({
  useNotificationStore: { getState: () => ({ addNotification: vi.fn() }) },
}));
import { useTitleStore } from '../../store/titleStore';

describe('weekly tournament achievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.history = [];
    mocks.existing = [];
    mocks.error = null;
    mocks.insert.mockResolvedValue({ error: null });
    useTitleStore.setState({ userTitles: [], fetchUserTitles: mocks.refresh });
  });
  it('earns Contender immediately after an active quarterfinal win', async () => {
    mocks.history = [
      { status: 'active', round_results: [{ round: 1, result: 'win', placement_bits: 0 }] },
    ];
    await useTitleStore.getState().checkTournamentTitles();
    expect(mocks.insert).toHaveBeenCalledWith([{ user_id: 'trainer', title_id: 601 }]);
  });
  it('recognizes older completed champions and earns all three as unclaimed titles', async () => {
    mocks.history = [{ status: 'completed', final_placement: 'champion', round_results: [] }];
    await useTitleStore.getState().checkTournamentTitles();
    expect(mocks.insert).toHaveBeenCalledWith(
      [601, 602, 603].map((title_id) => ({ user_id: 'trainer', title_id }))
    );
    expect(mocks.refresh).toHaveBeenCalled();
  });
  it('preserves existing earned or claimed records when checking historical results', async () => {
    mocks.history = [{ status: 'completed', final_placement: 'gf_loss', round_results: [] }];
    mocks.existing = [{ title_id: 601 }];
    await useTitleStore.getState().checkTournamentTitles();
    expect(mocks.insert).toHaveBeenCalledWith([{ user_id: 'trainer', title_id: 602 }]);
  });
  it('does not award from a failed history query', async () => {
    mocks.error = { message: 'offline' };
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await useTitleStore.getState().checkTournamentTitles();
    expect(mocks.insert).not.toHaveBeenCalled();
    log.mockRestore();
  });
  it('requires consecutive wins and ignores uncompleted placement flags', () => {
    expect(
      tournamentProgress({
        status: 'active',
        final_placement: 'champion',
        round_results: [{ round: 3, result: 'win', placement_bits: 0 }],
      })
    ).toBe(0);
    expect(
      tournamentProgress({
        status: 'expired',
        final_placement: null,
        round_results: [
          { round: 1, result: 'win', placement_bits: 0 },
          { round: 2, result: 'win', placement_bits: 0 },
        ],
      })
    ).toBe(2);
  });
});
