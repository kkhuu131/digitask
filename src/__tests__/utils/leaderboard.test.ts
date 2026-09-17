import { describe, expect, it } from 'vitest';
import { countDiscoveries, fetchLeaderboardPages, rankLeaderboard } from '../../utils/leaderboard';
import type { LeaderboardProfile } from '../../utils/leaderboard';

const player = (
  id: string,
  wins: number,
  battles: number,
  discoveries = 0
): LeaderboardProfile => ({
  id,
  username: id,
  battles_won: wins,
  battles_completed: battles,
  discoveries,
});

describe('leaderboard rankings', () => {
  it('breaks equal win rates by wins, preserves rate priority and excludes unplayed users', () => {
    const users = [
      player('one', 1, 1),
      player('hundred', 100, 100),
      player('many', 1000, 2000),
      player('none', 0, 0),
    ];
    expect(rankLeaderboard(users, 'winrate').map((user) => user.id)).toEqual([
      'hundred',
      'one',
      'many',
    ]);
    expect(users[0].id).toBe('one');
  });

  it('counts unique catalog species rather than pets or duplicate rows', () => {
    const counts = countDiscoveries(
      [
        { user_id: 'a', digimon_id: 1 },
        { user_id: 'a', digimon_id: 1 },
        { user_id: 'a', digimon_id: 2 },
        { user_id: 'a', digimon_id: 999 },
        { user_id: 'b', digimon_id: 2 },
      ],
      new Set([1, 2])
    );
    expect(counts.get('a')).toBe(2);
    expect(counts.get('b')).toBe(1);
    expect(
      rankLeaderboard([player('b', 100, 100, 1), player('a', 0, 0, 2)], 'discoveries').map(
        (user) => user.id
      )
    ).toEqual(['a', 'b']);
  });

  it('includes players beyond the first page before selecting the top fifty', async () => {
    const rows = Array.from({ length: 501 }, (_, i) => player(String(i), i, i));
    const ranges: number[][] = [];
    const users = await fetchLeaderboardPages(async (from, to) => {
      ranges.push([from, to]);
      return { data: rows.slice(from, to + 1), error: null };
    });
    expect(ranges).toEqual([
      [0, 499],
      [500, 999],
    ]);
    expect(rankLeaderboard(users, 'wins')).toHaveLength(50);
    expect(rankLeaderboard(users, 'wins')[0].id).toBe('500');
  });

  it('rejects failed pages instead of showing a partial ranking', async () => {
    await expect(
      fetchLeaderboardPages(async () => ({ data: null, error: new Error('Unavailable') }))
    ).rejects.toThrow('Unavailable');
  });
});
