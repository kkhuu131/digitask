import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserTournament } from '../../types/tournament';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  single: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  currency: vi.fn(),
  notify: vi.fn(),
  party: [
    { id: 'partner', digimon_id: 1, current_level: 10, is_on_team: true, is_in_storage: false },
  ],
}));
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: mocks.from,
    auth: { getUser: async () => ({ data: { user: { id: 'trainer' } } }) },
  },
}));
vi.mock('../../store/titleStore', () => ({
  useTitleStore: { getState: () => ({ checkTournamentTitles: vi.fn() }) },
}));
vi.mock('../../store/petStore', () => ({
  useDigimonStore: { getState: () => ({ allUserDigimon: mocks.party }) },
}));
vi.mock('../../store/currencyStore', () => ({
  useCurrencyStore: { getState: () => ({ addCurrency: mocks.currency }) },
}));
vi.mock('../../store/notificationStore', () => ({
  useNotificationStore: { getState: () => ({ addNotification: mocks.notify }) },
}));

import { useTournamentStore } from '../../store/tournamentStore';

const activeTournament = () =>
  ({
    id: 'weekly-entry',
    status: 'active',
    current_round: 1,
    round_results: [],
  }) as unknown as UserTournament;

describe('free weekly tournament', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const query = {
      insert: mocks.insert,
      update: mocks.update,
      eq: mocks.eq,
      select: () => query,
      single: mocks.single,
    };
    mocks.from.mockReturnValue(query);
    mocks.insert.mockReturnValue(query);
    mocks.update.mockReturnValue(query);
    mocks.eq.mockReturnValue(query);
    mocks.party = [
      { id: 'partner', digimon_id: 1, current_level: 10, is_on_team: true, is_in_storage: false },
    ];
    useTournamentStore.setState({ currentTournament: null, loading: false, error: null });
  });

  it('creates an entry without consulting task activity', async () => {
    mocks.single.mockResolvedValue({ data: activeTournament(), error: null });
    await useTournamentStore.getState().enterTournament();
    expect(mocks.from).toHaveBeenCalledWith('user_tournaments');
    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'trainer', status: 'active', current_round: 1 })
    );
    expect(useTournamentStore.getState().isActive()).toBe(true);
    const opponents = mocks.insert.mock.calls[0][0].bracket.visual_bracket.slots.slice(1);
    expect(new Set(opponents.map((slot: { name: string }) => slot.name)).size).toBe(7);
    expect(
      new Set(
        opponents.map((slot: { team: { digimon_id: number }[] }) =>
          slot.team
            .map((member) => member.digimon_id)
            .sort((a, b) => a - b)
            .join('-')
        )
      ).size
    ).toBe(7);
  });

  it('still rejects a second entry in the same week', async () => {
    useTournamentStore.setState({ currentTournament: activeTournament() });
    await expect(useTournamentStore.getState().enterTournament()).rejects.toThrow(
      'already entered'
    );
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('still requires a battle team', async () => {
    mocks.party = [];
    await expect(useTournamentStore.getState().enterTournament()).rejects.toThrow('battle team');
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it.each([
    [1, 'loss', 'qf_loss', 250],
    [2, 'loss', 'sf_loss', 500],
    [3, 'loss', 'gf_loss', 1000],
    [3, 'win', 'champion', 2000],
  ] as const)(
    'awards the correct placement prize after round %i %s',
    async (round, result, placement, bits) => {
      const tournament = { ...activeTournament(), current_round: round };
      useTournamentStore.setState({ currentTournament: tournament });
      mocks.single.mockResolvedValue({ data: { ...tournament, status: 'completed' }, error: null });
      await useTournamentStore.getState().recordRoundResult(round, result);
      expect(mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          final_placement: placement,
          round_results: [{ round, result, placement_bits: bits }],
        })
      );
      expect(mocks.currency).toHaveBeenCalledWith('bits', bits);
      expect(mocks.eq).toHaveBeenCalledWith('status', 'active');
    }
  );

  it('does not award a placement prize for an early-round win', async () => {
    useTournamentStore.setState({ currentTournament: activeTournament() });
    mocks.single.mockResolvedValue({
      data: { ...activeTournament(), current_round: 2 },
      error: null,
    });
    await useTournamentStore.getState().recordRoundResult(1, 'win');
    expect(mocks.currency).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ current_round: 2 }));
    expect(useTournamentStore.getState().isActive()).toBe(true);
  });
});
