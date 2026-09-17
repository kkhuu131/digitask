export type LeaderboardType = 'wins' | 'winrate' | 'streak' | 'discoveries';

export interface LeaderboardProfile {
  id: string;
  username: string;
  battles_won: number;
  battles_completed: number;
  current_streak?: number;
  longest_streak?: number;
  avatar_url?: string;
  discoveries: number;
}

export function rankLeaderboard(users: LeaderboardProfile[], type: LeaderboardType) {
  return users
    .filter((user) => type !== 'winrate' || user.battles_completed > 0)
    .sort((a, b) => {
      let difference: number;
      if (type === 'winrate') {
        difference = b.battles_won / b.battles_completed - a.battles_won / a.battles_completed;
        if (!difference) difference = b.battles_won - a.battles_won;
      } else if (type === 'discoveries') {
        difference = b.discoveries - a.discoveries;
      } else if (type === 'streak') {
        difference = (b.longest_streak ?? 0) - (a.longest_streak ?? 0);
      } else {
        difference = b.battles_won - a.battles_won;
      }
      return difference || a.id.localeCompare(b.id);
    })
    .slice(0, 50);
}

export function countDiscoveries(
  rows: { user_id: string; digimon_id: number }[],
  catalogIds: Set<number>
) {
  const speciesByUser = new Map<string, Set<number>>();
  for (const row of rows) {
    if (!catalogIds.has(row.digimon_id)) continue;
    const species = speciesByUser.get(row.user_id) ?? new Set<number>();
    species.add(row.digimon_id);
    speciesByUser.set(row.user_id, species);
  }
  return new Map([...speciesByUser].map(([id, species]) => [id, species.size]));
}

/** Read every ordered page instead of ranking an arbitrary first set of rows. */
export async function fetchLeaderboardPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await fetchPage(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return rows;
  }
}
